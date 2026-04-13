#!/bin/bash

# Deployment script for proctoringreports S3 bucket
# This script builds and deploys your React app to AWS S3

set -e  # Exit on error

BUCKET_NAME="proctoringreports"
BUILD_DIR="dist"
REGION="us-east-1"

echo "🚀 Starting deployment to S3..."
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS credentials are configured
echo "🔐 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi
echo "✅ AWS credentials verified"
echo ""

# Clean old build
echo "🧹 Cleaning old build..."
rm -rf "$BUILD_DIR"
echo "✅ Clean complete"
echo ""

# Build the application
echo "📦 Building application..."

# Prefer .env.production for deploy builds. Fall back to .env for backward compatibility.
ENV_FILE=""
if [ -f ".env.production" ]; then
  ENV_FILE=".env.production"
elif [ -f ".env" ]; then
  ENV_FILE=".env"
  echo "⚠️  .env.production not found, falling back to .env"
fi

if [ -n "$ENV_FILE" ]; then
  # Export only VITE_* variables (these are intentionally inlined into client JS by Vite).
  set -a
  # shellcheck disable=SC1091
  source <(grep -E '^VITE_[A-Z0-9_]*=' "$ENV_FILE")
  set +a
  echo "✅ Loaded VITE_* vars from $ENV_FILE"
fi

if [ -z "${VITE_API_BASE_URL:-}" ]; then
  echo "❌ VITE_API_BASE_URL is not set. Add it in .env.production (recommended) or .env"
  exit 1
fi

if [[ "$VITE_API_BASE_URL" == *"localhost"* || "$VITE_API_BASE_URL" == *"127.0.0.1"* ]]; then
  echo "❌ Refusing production deploy with local API URL: $VITE_API_BASE_URL"
  echo "   Set VITE_API_BASE_URL=https://testproctoring.formapply.in in .env.production"
  exit 1
fi

echo "🌐 Using API base URL: $VITE_API_BASE_URL"

npm run build

if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory '$BUILD_DIR' not found!"
    exit 1
fi

if [ ! -f "$BUILD_DIR/index.html" ]; then
    echo "❌ index.html not found in build directory!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Guardrail: ensure report API endpoint URLs were not inlined with localhost.
if grep -RInE "http://(127\.0\.0\.1|localhost):8001/reports" "$BUILD_DIR" > /dev/null; then
    echo "❌ Build output still contains local report API URLs. Check VITE_API_BASE_URL and rebuild."
    exit 1
fi

# Show what will be deployed
echo "📋 Files to deploy:"
find "$BUILD_DIR" -type f | sed 's|^dist/|  - |'
echo ""

# Deploy to S3
echo "☁️  Deploying to S3 bucket: $BUCKET_NAME..."
# Note: No --acl flag because bucket has ACLs disabled (uses bucket policy for public access)
aws s3 sync "$BUILD_DIR/" "s3://$BUCKET_NAME" --delete

# Configure S3 website: index.html for root, 404.html as error doc so any
# non-hash URL (e.g. /{candidateId} from the backend redirect) gets caught
# by 404.html which rewrites it into the correct /#/report/{candidateId} hash URL.
echo "⚙️  Configuring S3 website routing..."
aws s3 website "s3://$BUCKET_NAME" \
  --index-document index.html \
  --error-document 404.html

echo ""
echo "🔍 Verifying deployment..."
aws s3 ls "s3://$BUCKET_NAME/" --recursive | head -10

echo ""
echo "✅ Deployment successful!"
echo ""
echo "🌐 Your website is available at:"
echo "   http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo ""
echo "⏳ If you see a 404 error, wait 30-60 seconds and refresh your browser."
echo ""
echo "📝 Note: If you're using CloudFront, you may need to invalidate the cache:"
echo "   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths '/*'"

