#!/bin/bash
set -euo pipefail

ENVIRONMENT="${ENVIRONMENT:-prod}"
IDLE_MINUTES="${IDLE_MINUTES:-30}"

# AI settings (optional)
AI_PROVIDER="${AI_PROVIDER:-}"
AI_MODEL="${AI_MODEL:-}"

cd "$(dirname "$0")"

echo "=== Marp Editor - CDK Deploy ==="
[ -n "$AI_PROVIDER" ] && echo "AI: $AI_PROVIDER / $AI_MODEL"
echo ""

# Helper function
get_output() {
  local stack="$1"
  local key="$2"
  aws cloudformation describe-stacks \
    --stack-name "$stack" \
    --region us-east-1 \
    --query "Stacks[0].Outputs[?OutputKey=='$key'].OutputValue" \
    --output text 2>/dev/null || echo ""
}

# Step 1: CDK Deploy
echo "[1/5] Deploying CDK stacks..."
bun run cdk deploy --all --require-approval never \
  -c environment="$ENVIRONMENT" \
  -c idleMinutes="$IDLE_MINUTES" \
  -c aiProvider="$AI_PROVIDER" \
  -c aiModel="$AI_MODEL"

STATEFUL_STACK="MarpEditorStatefulStack"
COMPUTE_STACK="MarpEditorComputeStack"

ECR_URI=$(get_output "$STATEFUL_STACK" "ECRRepositoryUri")
FRONTEND_BUCKET=$(get_output "$COMPUTE_STACK" "FrontendBucketName")
CLOUDFRONT_ID=$(get_output "$COMPUTE_STACK" "CloudFrontDistributionId")
CLOUDFRONT_DOMAIN=$(get_output "$COMPUTE_STACK" "CloudFrontDomain")
CLUSTER_NAME=$(get_output "$COMPUTE_STACK" "ECSClusterName")

echo "ECR: $ECR_URI"
echo "Frontend: $FRONTEND_BUCKET"
echo "CloudFront: $CLOUDFRONT_DOMAIN"
echo ""

# Step 2: Build and push backend image (ARM64)
echo "[2/5] Building and pushing backend image (ARM64)..."
cd ..
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin "${ECR_URI%/*}"
docker build --platform linux/arm64 -t marp-editor -f backend/Dockerfile .
docker tag marp-editor:latest "$ECR_URI:latest"
docker push "$ECR_URI:latest"
cd deploy-cdk
echo ""

# Step 3: Update ECS service with real image
echo "[3/5] Updating ECS service..."
bun run cdk deploy "$COMPUTE_STACK" --require-approval never \
  -c environment="$ENVIRONMENT" \
  -c idleMinutes="$IDLE_MINUTES" \
  -c containerImage="$ECR_URI:latest" \
  -c aiProvider="$AI_PROVIDER" \
  -c aiModel="$AI_MODEL"

# Find ECS service name
SERVICE_ARN=$(aws ecs list-services --cluster "$CLUSTER_NAME" --region us-east-1 --query 'serviceArns[0]' --output text)
if [ -n "$SERVICE_ARN" ] && [ "$SERVICE_ARN" != "None" ]; then
  aws ecs update-service --cluster "$CLUSTER_NAME" --service "$SERVICE_ARN" --force-new-deployment --region us-east-1 > /dev/null
fi
echo ""

# Step 4: Build and deploy frontend
echo "[4/5] Building and deploying frontend..."
cd ../frontend
bun install --frozen-lockfile
VITE_API_URL="https://$CLOUDFRONT_DOMAIN" bun run build
aws s3 sync dist/ "s3://$FRONTEND_BUCKET/" --delete --region us-east-1
cd ../deploy-cdk
echo ""

# Step 5: Invalidate CloudFront cache
echo "[5/5] Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_ID" --paths "/*" > /dev/null

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "URL: https://$CLOUDFRONT_DOMAIN"
echo ""
echo "Features:"
echo "  - On-demand start: Access triggers auto-start"
echo "  - Auto-stop: After ${IDLE_MINUTES} minutes of inactivity"
echo ""
echo "Wait 2-3 minutes for ECS task to start."
