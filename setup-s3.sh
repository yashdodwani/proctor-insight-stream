#!/bin/bash

# AWS S3 Bucket Configuration Script
# This script configures your S3 bucket for static website hosting

set -e  # Exit on error

BUCKET_NAME="proctoringreports"
REGION="${AWS_REGION:-us-east-1}"

echo "🔧 Configuring S3 bucket: $BUCKET_NAME"
echo "📍 Region: $REGION"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi

echo "Step 1: Enabling static website hosting..."
aws s3 website "s3://$BUCKET_NAME/" \
    --index-document index.html \
    --error-document index.html
echo "✅ Static website hosting enabled"
echo ""

echo "Step 2: Applying bucket policy for public read access..."
aws s3api put-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --policy file://bucket-policy.json
echo "✅ Bucket policy applied"
echo ""

echo "Step 3: Getting website endpoint..."
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "✅ Configuration complete!"
echo ""
echo "🌐 Your website endpoint:"
echo "   $WEBSITE_URL"
echo ""
echo "📝 Next steps:"
echo "   1. Create an IAM user for GitHub Actions (see DEPLOYMENT.md)"
echo "   2. Add GitHub Secrets for automated deployment"
echo "   3. Push to GitHub or run './deploy.sh' to deploy manually"
echo ""

