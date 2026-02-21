#!/bin/bash

# Fix 404 Error - Complete Rebuild and Deploy
# This script rebuilds and redeploys your app to fix the missing files error

set -e  # Exit on error

BUCKET_NAME="proctoringreports"
BUILD_DIR="dist"

echo "🔧 Fixing 404 Error - Rebuilding and Redeploying..."
echo ""

# Step 1: Clean old build
echo "🧹 Cleaning old build files..."
rm -rf "$BUILD_DIR"
echo "✅ Clean complete"
echo ""

# Step 2: Build the app
echo "📦 Building React application..."
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ ERROR: Build failed - dist directory not created!"
    exit 1
fi

if [ ! -f "$BUILD_DIR/index.html" ]; then
    echo "❌ ERROR: Build failed - index.html not found!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Step 3: List what will be deployed
echo "📋 Files to deploy:"
find "$BUILD_DIR" -type f
echo ""

# Step 4: Deploy to S3
echo "☁️  Deploying to S3 bucket: $BUCKET_NAME..."
# Note: No --acl flag because bucket has ACLs disabled (uses bucket policy for public access)
aws s3 sync "$BUILD_DIR/" "s3://$BUCKET_NAME" --delete

echo ""
echo "✅ Deployment complete!"
echo ""

# Step 5: Verify deployment
echo "🔍 Verifying files in S3..."
aws s3 ls "s3://$BUCKET_NAME/" --recursive

echo ""
echo "✅ All done!"
echo ""
echo "🌐 Your website should now be accessible at:"
echo "   http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"
echo ""
echo "⏳ If you still see 404, wait 30-60 seconds and refresh (or clear cache)"

