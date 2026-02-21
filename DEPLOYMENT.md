# AWS S3 Deployment Guide

## ✅ Step 1: S3 Bucket Created
**Bucket Name:** `proctoringreports`

## 📝 Step 2: Configure S3 Bucket for Static Website Hosting

### Option A: Using AWS Console

1. Go to your S3 bucket: https://s3.console.aws.amazon.com/s3/buckets/proctoringreports
2. Click on the **Properties** tab
3. Scroll down to **Static website hosting** section
4. Click **Edit**
5. Select **Enable**
6. Set **Index document** to: `index.html`
7. Set **Error document** to: `index.html` (for React Router support)
8. Click **Save changes**

### Option B: Using AWS CLI (Automated)

Run these commands in your terminal:

```bash
# Configure static website hosting
aws s3 website s3://proctoringreports/ --index-document index.html --error-document index.html

# Apply bucket policy for public read access
aws s3api put-bucket-policy --bucket proctoringreports --policy file://bucket-policy.json
```

## 🔐 Step 3: Set Up Bucket Policy

Create a file `bucket-policy.json` with this content (already created in your project):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::proctoringreports/*"
    }
  ]
}
```

Then apply it:
1. Go to your bucket → **Permissions** tab
2. Scroll to **Bucket policy**
3. Click **Edit**
4. Paste the policy above
5. Click **Save changes**

## 🔑 Step 4: Create IAM User for GitHub Actions

1. Go to IAM Console: https://console.aws.amazon.com/iam/
2. Click **Users** → **Create user**
3. User name: `github-actions-deployer`
4. Click **Next**
5. Select **Attach policies directly**
6. Click **Create policy** → **JSON** tab
7. Paste the IAM policy (see `iam-policy.json` in your project)
8. Name it: `GitHubActionsS3Deploy`
9. Attach this policy to the user
10. Click **Create user**
11. Go to the user → **Security credentials** tab
12. Click **Create access key**
13. Select **Other** → **Next**
14. **SAVE THE ACCESS KEY ID AND SECRET ACCESS KEY** (you won't see them again!)

## 🔒 Step 5: Add GitHub Secrets

1. Go to your GitHub repository: https://github.com/YOUR_USERNAME/YOUR_REPO
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of these:

| Name | Value |
|------|-------|
| `AWS_ACCESS_KEY_ID` | The access key ID from Step 4 |
| `AWS_SECRET_ACCESS_KEY` | The secret access key from Step 4 |
| `AWS_REGION` | `us-east-1` (or your bucket's region) |
| `S3_BUCKET` | `proctoringreports` |
| `CLOUDFRONT_DISTRIBUTION_ID` | (Optional - leave empty for now) |

## 🚀 Step 6: Deploy!

### Option A: Push to GitHub (Automatic)

```bash
git add .
git commit -m "Configure AWS deployment"
git push origin main
```

The GitHub Actions workflow will automatically build and deploy to S3!

### Option B: Manual Deploy (For Testing)

```bash
# Build the app
npm run build

# Deploy to S3 using AWS CLI
aws s3 sync dist/ s3://proctoringreports --delete --acl public-read
```

## 🌐 Step 7: Access Your Website

After deployment, your website will be available at:

**S3 Website URL:** `http://proctoringreports.s3-website-REGION.amazonaws.com`

Replace `REGION` with your bucket's region (e.g., `us-east-1`).

To find the exact URL:
1. Go to S3 bucket → **Properties** tab
2. Scroll to **Static website hosting**
3. Copy the **Bucket website endpoint**

## 🚀 Optional: Set Up CloudFront (CDN + HTTPS)

For better performance and HTTPS support:

1. Go to CloudFront Console: https://console.aws.amazon.com/cloudfront/
2. Click **Create distribution**
3. **Origin domain**: Select your S3 bucket website endpoint (NOT the bucket itself)
4. **Viewer protocol policy**: Redirect HTTP to HTTPS
5. **Default root object**: `index.html`
6. Click **Create distribution**
7. Copy the **Distribution ID** and add it to GitHub Secrets as `CLOUDFRONT_DISTRIBUTION_ID`
8. Your site will be available at the CloudFront URL (e.g., `https://d111111abcdef8.cloudfront.net`)

## 🎯 Custom Domain (Optional)

1. In CloudFront, add your domain to **Alternate domain names (CNAMEs)**
2. Request an SSL certificate in AWS Certificate Manager (ACM)
3. Update your domain's DNS to point to the CloudFront distribution

## 🔍 Troubleshooting

### Build fails in GitHub Actions
- Check the Actions logs in GitHub
- Ensure all dependencies are in `package.json`

### 403 Forbidden errors
- Check bucket policy is applied correctly
- Ensure "Block all public access" is OFF
- Verify the bucket policy allows public read access

### React Router returns 404 on refresh
- Ensure error document is set to `index.html` in static website hosting settings

## 📊 Monitoring

- **S3 Access Logs**: Can be enabled in bucket properties
- **CloudFront Logs**: Available in distribution settings
- **GitHub Actions**: Check the Actions tab in your repository

---

## Quick Reference Commands

```bash
# Build locally
npm run build

# Deploy manually
aws s3 sync dist/ s3://proctoringreports --delete --acl public-read

# View bucket website configuration
aws s3api get-bucket-website --bucket proctoringreports

# Check deployment
curl http://proctoringreports.s3-website-us-east-1.amazonaws.com
```

