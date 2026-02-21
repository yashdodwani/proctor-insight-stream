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

# Show what will be deployed
echo "📋 Files to deploy:"
find "$BUILD_DIR" -type f | sed 's|^dist/|  - |'
echo ""

# Deploy to S3
echo "☁️  Deploying to S3 bucket: $BUCKET_NAME..."
# Note: No --acl flag because bucket has ACLs disabled (uses bucket policy for public access)
aws s3 sync "$BUILD_DIR/" "s3://$BUCKET_NAME" --delete

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

