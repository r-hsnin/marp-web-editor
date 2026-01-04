# Marp Web Editor - AWS CDK デプロイ

ECS EC2 + S3/CloudFront によるデプロイ。オンデマンド起動・自動停止機能付き。

> **設計思想・技術選定は [docs/DEPLOY.md](../docs/DEPLOY.md) を参照**

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
| `IDLE_MINUTES` | 30 | 自動停止までのアイドル時間（分） |
| `AI_PROVIDER` | - | AI プロバイダー |
| `AI_MODEL` | - | AI モデル |

### AI 機能を有効にする場合

```bash
export AI_PROVIDER=openrouter
export AI_MODEL=openai/gpt-4.1-mini
./deploy.sh
```

**注意**: API キーは CDK でデプロイされません。AWS Console で ECS タスク定義の環境変数に手動追加してください。

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
  --query "Stacks[0].Outputs[?OutputKey=='ECRRepositoryUri'].OutputValue" \
  --output text)

# ビルド & プッシュ
aws ecr get-login-password | docker login --username AWS --password-stdin "${ECR_URI%/*}"
docker build --platform linux/arm64 -t marp-editor -f ../backend/Dockerfile ..
docker tag marp-editor:latest "$ECR_URI:latest"
docker push "$ECR_URI:latest"

# ECS サービス更新
CLUSTER=$(aws cloudformation describe-stacks \
  --stack-name MarpEditorComputeStack \
  --query "Stacks[0].Outputs[?OutputKey=='ECSClusterName'].OutputValue" \
  --output text)
SERVICE_ARN=$(aws ecs list-services --cluster "$CLUSTER" --query 'serviceArns[0]' --output text)
aws ecs update-service --cluster "$CLUSTER" --service "$SERVICE_ARN" --force-new-deployment
```

### フロントエンド更新

```bash
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name MarpEditorComputeStack \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
  --output text)
DIST_ID=$(aws cloudformation describe-stacks \
  --stack-name MarpEditorComputeStack \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
  --output text)

cd ../frontend
bun run build
aws s3 sync dist/ "s3://$BUCKET/" --delete
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
```

---

## スタック構成

| スタック | リソース | 削除ポリシー |
|----------|----------|--------------|
| StatefulStack | ECR, ImageBucket | RETAIN（データ保持） |
| ComputeStack | VPC, ECS, EC2, Lambda, CloudFront, FrontendBucket | DESTROY |

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
| 停止中 | ~$0.64 (EBS のみ) |
| 月10時間利用 | ~$1 |
| 常時稼働 | ~$15-20 |

詳細は [docs/DEPLOY.md](../docs/DEPLOY.md#コスト設計) を参照。
