# 🚀 Quick Start - Deploy to AWS S3

Your bucket **"proctoringreports"** is ready! Follow these steps to complete the deployment.

## Option 1: Automated Setup (Recommended)

### Step 1: Configure AWS CLI

First, configure AWS CLI with your credentials:

```bash
aws configure
```

Enter when prompted:
- **AWS Access Key ID**: [Your access key from AWS IAM]
- **AWS Secret Access Key**: [Your secret key from AWS IAM]
- **Default region name**: `us-east-1` (or your bucket's region)
- **Default output format**: `json`

**📖 How to get access keys?** See: `IAM-ACCESS-KEY-GUIDE.md`  
**🔗 Direct link:** https://console.aws.amazon.com/iam/home#/users

### Step 2: Run the Setup Script

```bash
./setup-s3.sh
```

This will:
- ✅ Enable static website hosting
- ✅ Apply the public read bucket policy
- ✅ Show your website URL

### Step 3: Deploy Your App

```bash
./deploy.sh
```

This will:
- 📦 Build your React app
- ☁️ Upload to S3
- 🌐 Show your live website URL

---

## Option 2: Manual Setup via AWS Console

### 1. Enable Static Website Hosting

1. Go to: https://s3.console.aws.amazon.com/s3/buckets/proctoringreports?tab=properties
2. Scroll to **Static website hosting**
3. Click **Edit**
4. Select **Enable**
5. Index document: `index.html`
6. Error document: `index.html`
7. Click **Save changes**

### 2. Add Bucket Policy

1. Go to: https://s3.console.aws.amazon.com/s3/buckets/proctoringreports?tab=permissions
2. Scroll to **Bucket policy**
3. Click **Edit**
4. Copy and paste this policy:

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

5. Click **Save changes**

### 3. Deploy Manually

```bash
npm run build
aws s3 sync dist/ s3://proctoringreports --delete --acl public-read
```

---

## Option 3: GitHub Actions (CI/CD)

For automatic deployment on every push to `main`:

### 1. Create IAM User

1. Go to: https://console.aws.amazon.com/iam/home#/users
2. Click **Create user**
3. Name: `github-actions-deployer`
4. Click **Next** → **Attach policies directly** → **Create policy**
5. Use the JSON policy from `iam-policy.json`
6. Name it: `GitHubActionsS3Deploy`
7. Attach to user and create
8. Go to **Security credentials** → **Create access key**
9. Select **Other** → Create
10. **SAVE THE KEYS!** ⚠️ You won't see them again

### 2. Add GitHub Secrets

Go to your repository settings: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `AWS_ACCESS_KEY_ID` | From step 1 |
| `AWS_SECRET_ACCESS_KEY` | From step 1 |
| `AWS_REGION` | `us-east-1` |
| `S3_BUCKET` | `proctoringreports` |

### 3. Push to Deploy

```bash
git add .
git commit -m "Deploy to AWS S3"
git push origin main
```

✅ Your app will automatically build and deploy!

---

## 🌐 Access Your Website

After deployment, your website will be at:

**http://proctoringreports.s3-website-us-east-1.amazonaws.com**

(Replace `us-east-1` with your actual region if different)

---

## 🔒 Security Checklist

✅ Bucket policy allows public read access  
✅ Static website hosting is enabled  
✅ AWS credentials are NOT committed to Git  
✅ GitHub Secrets are configured (for CI/CD)  

---

## 📚 Additional Resources

- **Full Deployment Guide**: See `DEPLOYMENT.md`
- **Bucket Policy**: `bucket-policy.json`
- **IAM Policy**: `iam-policy.json`
- **Deploy Script**: `./deploy.sh`
- **Setup Script**: `./setup-s3.sh`

---

## 🆘 Need Help?

Common issues and solutions in `DEPLOYMENT.md` → Troubleshooting section.

