# AWS デプロイ設計

EC2 + Docker + CloudFront によるデプロイの設計思想と技術選定。

> **デプロイ手順は [cdk/README.md](../cdk/README.md) を参照**

---

## なぜ EC2 + Docker か

Marp CLI の PDF エクスポートには Puppeteer/Chromium が必要。Chromium は `/dev/shm` を共有メモリとして使用するため、`--shm-size` パラメータが必須。

| サービス | shm-size 設定 | 結果 |
|----------|---------------|------|
| Lambda | ❌ 非対応 | Chromium クラッシュ |
| App Runner | ❌ 非対応 | 同上 |
| Fargate | ❌ 非対応 | 同上 |
| ECS EC2 | ✅ 対応 | 動作 |
| **EC2 + Docker** | ✅ 対応 | **動作（シンプル）** |

**EC2 + Docker を選択した理由**:
- ECS と同等の機能を、よりシンプルな構成で実現
- ECS Agent 不要で EBS 8GB に削減（ECS は 30GB 必要）
- CloudFormation リソース数削減（Cluster, Service, TaskDef 不要）

---

## アーキテクチャ

```
                              CloudFront
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
            ▼                      ▼                      ▼
    ┌───────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │  S3 Bucket    │    │   EC2 + Docker  │    │  Lambda@Edge    │
    │  (Frontend)   │    │   (Backend)     │    │  (起動トリガー)  │
    │  OAC 保護     │    │   Port 3001     │    │  origin-response│
    └───────────────┘    └─────────────────┘    └─────────────────┘
            │                      │                      │
            │                      │                      │
    /index.html 等          /api/*                503 時に EC2 起動
```

### オリジン構成

| パス | オリジン | 説明 |
|------|----------|------|
| `/` | S3 (OAC) | 静的フロントエンド |
| `/api/*` | EC2 | バックエンド API |

---

## オンデマンド起動の仕組み

コスト削減のため、アクセスがない時は EC2 を自動停止。アクセス時に自動起動。

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. アクセス時 (EC2 停止中)                                        │
├─────────────────────────────────────────────────────────────────┤
│ User → CloudFront → EC2 Origin (3秒タイムアウト) → 503           │
│                                    ↓                            │
│                          Lambda@Edge (origin-response)          │
│                                    ↓                            │
│                          EC2 起動トリガー (非同期)                │
│                                    ↓                            │
│                          503 レスポンス返却                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2. 起動完了時                                                    │
├─────────────────────────────────────────────────────────────────┤
│ EC2 state: running                                              │
│         ↓                                                       │
│ EventBridge Rule 検知                                           │
│         ↓                                                       │
│ Origin Update Lambda                                            │
│         ↓                                                       │
│ CloudFront オリジン更新 (新しい PublicDnsName)                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 3. アイドル検知 (15分ごと)                                        │
├─────────────────────────────────────────────────────────────────┤
│ EventBridge Scheduler                                           │
│         ↓                                                       │
│ IdleCheck Lambda                                                │
│         ↓                                                       │
│ CloudFront Requests メトリクス確認                               │
│         ↓                                                       │
│ IDLE_MINUTES 間リクエストなし → EC2 停止                         │
└─────────────────────────────────────────────────────────────────┘
```

### なぜ CloudFront メトリクスでアイドル検知？

- ALB 不要でコスト削減
- CloudFront は必須コンポーネントなので追加コストなし
- `/api/*` へのリクエスト数で正確に判定可能

---

## コスト設計

### 月額目安

| 利用パターン | EC2 稼働時間 | 月額 |
|-------------|-------------|------|
| 停止中のみ | 0時間 | ~$0.64 (EBS のみ) |
| 月10時間利用 | 10時間 | ~$1 |
| 平日業務時間 | ~200時間 | ~$5-8 |
| 常時稼働 | 720時間 | ~$15-20 |

### コスト内訳

| リソース | 単価 | 備考 |
|----------|------|------|
| t4g.small | $0.0168/時間 | ARM64、コスト効率最高 |
| EBS 8GB | $0.08/GB/月 | ~$0.64/月 |
| CloudFront | $0.085/GB | 転送量課金、無料枠 1TB |
| Lambda | - | 無料枠内で収まる |

### なぜオンデマンドインスタンスか

Spot Instance を検討したが却下:

| 項目 | Spot | オンデマンド |
|------|------|-------------|
| コスト | ~70% 割引 | 定価 |
| 中断リスク | あり | なし |
| 停止/起動制御 | **AWS のみ** | ユーザー可能 |

**却下理由**: Spot Instance は中断後の再起動が AWS 側でしか行えない。オンデマンド起動の仕組みと相性が悪い。月 10 時間利用で ~$0.12 の差額は許容範囲。

---

## セキュリティ設計

### アクセス制御

| リソース | 保護方式 | 詳細 |
|----------|----------|------|
| S3 (Frontend) | CloudFront OAC | パブリックアクセス完全ブロック |
| S3 (ImageBucket) | IAM ポリシー | EC2 ロールのみアクセス可 |
| EC2 | Security Group | CloudFront Prefix List のみ許可 |

### EC2 セキュリティ

| 設定 | 値 | 理由 |
|------|-----|------|
| IMDSv2 | 必須 (HttpTokens: required) | SSRF 対策 |
| Security Group | CloudFront Prefix List | 直接アクセス防止 |
| EBS 暗号化 | 有効 | データ保護 |
| SSM 接続 | 有効 | SSH 不要、セキュアな管理 |

### コンテナセキュリティ

| 設定 | 値 | 理由 |
|------|-----|------|
| --read-only | true | 書き込み攻撃防止 |
| --user | 1000:1000 | 非 root 実行 |
| --init | true | ゾンビプロセス対策 |
| --memory | 1536m | リソース制限 |

---

## 設計判断

| 項目 | 決定 | 理由 |
|------|------|------|
| リージョン | us-east-1 | Lambda@Edge 必須 |
| インスタンス | t4g.small (ARM64) | コスト最適化、2 vCPU / 2GB |
| AMI | Amazon Linux 2023 | 軽量、Docker 対応 |
| EBS | 8GB gp3 | 最小構成、暗号化有効 |
| 購入オプション | オンデマンド | Spot は停止/起動制御に制約 |
| shm-size | 512MB | Chromium 動作に必須 |
| スタック分離 | Stateful / Compute | データ保護、独立デプロイ |
| アイドル検知 | CloudFront Requests | ALB 不要 |
| Origin タイムアウト | 3秒 x 1回 | EC2 停止時の高速レスポンス |
| SG 制限 | CloudFront Prefix List | EC2 直接アクセス防止 |

---

## 検討した代替案

### Lambda 分割構成

当初検討した構成:

```
CloudFront
├── /           → S3 (Frontend)
├── /api/export → Lambda Export (Docker, 2GB)
└── /api/*      → Lambda Light (Node.js, 1GB)
```

**却下理由**: Lambda は `shm-size` 非対応。Chromium が `/dev/shm` にアクセスできずクラッシュ。

### App Runner

**却下理由**: `shm-size` 非対応。また、最小インスタンス数 1 でコスト高。

### Fargate

**却下理由**: `shm-size` 非対応。ECS EC2 のみ対応。

### ECS EC2

**却下理由**: 動作するが、EC2 + Docker と比較して:
- ECS Agent が EBS 30GB を要求（EC2 + Docker は 8GB）
- CloudFormation リソースが複雑（Cluster, Service, TaskDef）
- 2 段階デプロイが必要（desiredCount: 0 → 1）

### ECS EC2 + ALB

**却下理由**: ALB は最低 ~$16/月。CloudFront 直接接続でコスト削減。

---

## 実装上の注意点

### Read-only Filesystem と Puppeteer

コンテナは `--read-only` で実行。Puppeteer/Chromium が一時ファイルを書き込むため、以下の設定で対応:

```bash
-e TMPDIR=/tmp \
-e HOME=/tmp \
-v /tmp:/tmp \
--tmpfs /home/bun:rw,noexec,nosuid,uid=1000,gid=1000,size=64m
```

`/home/bun` への tmpfs マウントは、Puppeteer が `/etc/passwd` からホームディレクトリを解決して書き込もうとするため必要。

### Security Group の CloudFront Prefix List

CloudFront からのアクセスのみ許可するため、Prefix List を使用:

```typescript
const cfPrefixList = ec2.PrefixList.fromLookup(this, 'CloudFrontPrefixList', {
  prefixListName: 'com.amazonaws.global.cloudfront.origin-facing',
});
securityGroup.addIngressRule(cfPrefixList, ec2.Port.tcp(3001));
```

### Lambda@Edge の制約

- us-east-1 必須 (CloudFront と同じリージョン)
- これがリージョン選定の主要因

### コンテナ更新

デプロイ時は `deploy.sh` が SSM Run Command で EC2 上のコンテナを更新。Parameter Store から AI 設定を取得して Docker に渡します。

```bash
# 推奨: deploy.sh を使用
./deploy.sh

# AI 設定を変更する場合
AI_MODEL=openrouter:openai/gpt-4.1-mini AI_API_KEY=... ./deploy.sh
```

---

## トラブルシューティング

### コンテナ起動失敗

| エラー | 原因 | 対処 |
|--------|------|------|
| `Exec format error` | アーキテクチャ不一致 | ARM64 でビルド |
| `EROFS: read-only file system` | Puppeteer が /home/bun に書き込み | `--tmpfs /home/bun:...` 追加 |
| `shm_open failed` | shm-size 不足 | `--shm-size=512m` 確認 |

### ログ確認

```bash
# EC2 コンテナログ (CloudWatch Logs)
aws logs tail "/marp-editor/backend" --follow

# Lambda ログ
aws logs tail "/aws/lambda/MarpEditorComputeStack-..." --follow

# EC2 に SSM 接続してデバッグ
aws ssm start-session --target "$INSTANCE_ID"
docker logs marp-editor
```

---

## 関連ドキュメント

- [cdk/README.md](../cdk/README.md) - デプロイ手順
- [ARCHITECTURE.md](./ARCHITECTURE.md) - アプリケーション設計
- [DOCKER.md](./DOCKER.md) - ローカル Docker 環境
