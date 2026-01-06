# Marp Web Editor - AWS CDK デプロイ

EC2 + Docker + CloudFront によるデプロイ。オンデマンド起動・自動停止機能付き。

> **設計思想・技術選定は [docs/DEPLOY.md](../docs/DEPLOY.md) を参照**

---

## アーキテクチャ

```
CloudFront
    │
    ├── / → S3 (Frontend)
    │
    └── /api/* → EC2 (Docker → Backend)
                      │
                      └── systemd で管理・自動再起動
```

- **オンデマンド起動**: Lambda@Edge が停止中の EC2 を自動起動
- **自動停止**: 15 分間アクセスがなければ EC2 を自動停止
- **コスト最適化**: 停止中は EBS 料金のみ (~$0.64/月)

---

## 前提条件

- AWS CLI 設定済み
- Bun インストール済み
- Docker インストール済み

---

## クイックスタート

```bash
cd cdk

# 依存関係インストール
bun install

# CDK ブートストラップ（初回のみ）
bun run cdk bootstrap

# デプロイ（全自動）
./deploy.sh
```

---

## 環境変数

| 変数 | デフォルト | 説明 |
|------|-----------|------|
| `ENVIRONMENT` | prod | 環境名 |
| `IDLE_MINUTES` | 15 | 自動停止までのアイドル時間（分） |
| `AI_PROVIDER` | - | AI プロバイダー (openrouter/openai/anthropic/google/bedrock) |
| `AI_MODEL` | - | AI モデル |
| `AI_API_KEY` | - | API キー |

### AI 機能を有効にする場合

```bash
AI_PROVIDER=openrouter \
AI_MODEL=openai/gpt-4.1-mini \
AI_API_KEY=sk-or-... \
./deploy.sh
```

deploy.sh が Parameter Store に自動登録します。API キーは SecureString で暗号化されます。

---

## 手動デプロイ

### CDK のみ

```bash
bun run deploy --all
```

### コンテナイメージ更新

```bash
# ECR URI を取得
ECR_URI=$(aws cloudformation describe-stacks \
  --stack-name MarpEditorStatefulStack \
  --region us-east-1 \
  --query "Stacks[0].Outputs[?OutputKey=='ECRRepositoryUri'].OutputValue" \
  --output text)

# ビルド & プッシュ
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin "${ECR_URI%/*}"
docker build --platform linux/arm64 -t marp-editor -f ../backend/Dockerfile ..
docker tag marp-editor:latest "$ECR_URI:latest"
docker push "$ECR_URI:latest"

# EC2 でコンテナ更新 (SSM 経由)
# ※ deploy.sh を使うことを推奨（Parameter Store から AI 設定を取得するため）
./deploy.sh
```

### フロントエンド更新

```bash
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name MarpEditorComputeStack \
  --region us-east-1 \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
  --output text)
DIST_ID=$(aws cloudformation describe-stacks \
  --stack-name MarpEditorComputeStack \
  --region us-east-1 \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
  --output text)

cd ../frontend
bun run build
aws s3 sync dist/ "s3://$BUCKET/" --delete --region us-east-1
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
```

---

## スタック構成

| スタック | リソース | 削除ポリシー |
|----------|----------|--------------|
| StatefulStack | ECR, ImageBucket | RETAIN（データ保持） |
| ComputeStack | VPC, EC2, Lambda, CloudFront, FrontendBucket | DESTROY |

### ComputeStack の主要リソース

- **EC2**: t4g.small (ARM64), Amazon Linux 2023, 8GB EBS
- **Lambda**: Origin Update (EC2 起動時に CloudFront オリジン更新), IdleCheck (15 分毎)
- **Lambda@Edge**: API リクエスト時に停止中の EC2 を起動
- **CloudFront**: Frontend (S3) + Backend (EC2) の統合配信

---

## テスト

```bash
bun test
```

---

## 削除

```bash
# ComputeStack のみ削除（データは保持）
bun run destroy MarpEditorComputeStack

# 全削除
bun run destroy --all
```

**注意**: StatefulStack のリソース（ECR, ImageBucket）は `RETAIN` ポリシーのため、スタック削除後も残る。完全削除は AWS コンソールから手動で。

---

## コスト目安

| 利用パターン | 月額 |
|-------------|------|
| 停止中 | ~$0.64 (EBS 8GB のみ) |
| 月 10 時間利用 | ~$1 |
| 常時稼働 | ~$15-20 |

詳細は [docs/DEPLOY.md](../docs/DEPLOY.md#コスト設計) を参照。
