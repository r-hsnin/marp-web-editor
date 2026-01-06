#!/bin/bash
set -euo pipefail

REGION="us-east-1"  # Lambda@Edge requires us-east-1
ENVIRONMENT="${ENVIRONMENT:-prod}"
IDLE_MINUTES="${IDLE_MINUTES:-15}"

# AI settings (optional)
AI_PROVIDER="${AI_PROVIDER:-}"
AI_MODEL="${AI_MODEL:-}"
AI_API_KEY="${AI_API_KEY:-}"

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
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='$key'].OutputValue" \
    --output text 2>/dev/null || echo ""
}

# Register AI settings to Parameter Store (if provided)
if [ -n "$AI_PROVIDER" ]; then
  echo "Registering AI settings to Parameter Store..."
  aws ssm put-parameter --name "/marp-editor/ai-provider" --value "$AI_PROVIDER" --type String --overwrite --region "$REGION" > /dev/null
  aws ssm put-parameter --name "/marp-editor/ai-model" --value "$AI_MODEL" --type String --overwrite --region "$REGION" > /dev/null
  if [ -n "$AI_API_KEY" ]; then
    case "$AI_PROVIDER" in
      bedrock) ;; # No API key needed (uses IAM role)
      openrouter) KEY_NAME="OPENROUTER_API_KEY" ;;
      openai) KEY_NAME="OPENAI_API_KEY" ;;
      anthropic) KEY_NAME="ANTHROPIC_API_KEY" ;;
      google) KEY_NAME="GOOGLE_GENERATIVE_AI_API_KEY" ;;
      *) KEY_NAME="${AI_PROVIDER^^}_API_KEY" ;;
    esac
    [ -n "$KEY_NAME" ] && aws ssm put-parameter --name "/marp-editor/$KEY_NAME" --value "$AI_API_KEY" --type SecureString --overwrite --region "$REGION" > /dev/null
  fi
  echo ""
fi

# Step 1: CDK Deploy
echo "[1/5] Deploying CDK stacks..."
bun run cdk deploy --all --require-approval never \
  -c environment="$ENVIRONMENT" \
  -c idleMinutes="$IDLE_MINUTES"

STATEFUL_STACK="MarpEditorStatefulStack"
COMPUTE_STACK="MarpEditorComputeStack"

ECR_URI=$(get_output "$STATEFUL_STACK" "ECRRepositoryUri")
FRONTEND_BUCKET=$(get_output "$COMPUTE_STACK" "FrontendBucketName")
CLOUDFRONT_ID=$(get_output "$COMPUTE_STACK" "CloudFrontDistributionId")
CLOUDFRONT_DOMAIN=$(get_output "$COMPUTE_STACK" "CloudFrontDomain")
INSTANCE_ID=$(get_output "$COMPUTE_STACK" "InstanceId")

echo "ECR: $ECR_URI"
echo "Frontend: $FRONTEND_BUCKET"
echo "CloudFront: $CLOUDFRONT_DOMAIN"
echo "Instance: $INSTANCE_ID"
echo ""

# Step 2: Build and push backend image (ARM64)
echo "[2/5] Building and pushing backend image (ARM64)..."
cd ..
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "${ECR_URI%/*}"
docker build --platform linux/arm64 -t marp-editor -f backend/Dockerfile .
docker tag marp-editor:latest "$ECR_URI:latest"
docker push "$ECR_URI:latest"
cd cdk
echo ""

# Step 3: Update container on EC2 via SSM
echo "[3/5] Updating container on EC2..."
INSTANCE_STATE=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --region "$REGION" --query 'Reservations[0].Instances[0].State.Name' --output text)

if [ "$INSTANCE_STATE" = "stopped" ]; then
  echo "Instance is stopped. Starting..."
  aws ec2 start-instances --instance-ids "$INSTANCE_ID" --region "$REGION" > /dev/null
  aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region "$REGION"
  echo "Waiting for SSM agent to be ready..."
  sleep 30
fi

# Update container via SSM Run Command (restart systemd service)
echo "Restarting marp-editor service..."
aws ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["systemctl restart marp-editor"]' \
  --region "$REGION" > /dev/null

echo "Container update initiated (runs in background)"
echo ""

# Step 4: Build and deploy frontend
echo "[4/5] Building and deploying frontend..."
cd ../frontend
bun install --frozen-lockfile
VITE_API_URL="https://$CLOUDFRONT_DOMAIN" bun run build
aws s3 sync dist/ "s3://$FRONTEND_BUCKET/" --delete --region "$REGION"
cd ../cdk
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
echo "Wait 2-3 minutes for EC2 to start and container to run."
