# AWS CLI Installation Guide

## 🔧 Install AWS CLI

AWS CLI is required to deploy your app. Choose your installation method:

### Linux (Recommended)

```bash
# Download and install
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version
```

### Alternative: Using pip

```bash
pip install awscli

# Verify installation
aws --version
```

---

## ⚙️ Configure AWS CLI

After installation, configure with your credentials:

```bash
aws configure
```

You'll be prompted for:

1. **AWS Access Key ID**: Get from AWS IAM Console
2. **AWS Secret Access Key**: Get from AWS IAM Console  
3. **Default region name**: `us-east-1` (or your bucket's region)
4. **Default output format**: `json`

---

## 🔑 Getting AWS Credentials

### For Testing (Quick but less secure):

1. Log into AWS Console with your user (Yash)
2. Click your name (top right) → **Security credentials**
3. Scroll to **Access keys**
4. Click **Create access key**
5. Select **Command Line Interface (CLI)**
6. Click **Create access key**
7. **SAVE BOTH KEYS** - you won't see the secret again!

### For Production (Recommended):

Create a dedicated IAM user:

1. Go to: https://console.aws.amazon.com/iam/home#/users
2. Click **Create user**
3. Username: `s3-deployer` or `github-actions-deployer`
4. Click **Next**
5. Select **Attach policies directly**
6. For quick setup: attach `AmazonS3FullAccess`  
   For minimal permissions: use custom policy from `iam-policy.json`
7. Click **Create user**
8. Go to the user → **Security credentials** tab
9. Click **Create access key** → **Command Line Interface (CLI)**
10. **SAVE BOTH KEYS!**

---

## ✅ Verify Setup

```bash
# Test AWS CLI is configured
aws sts get-caller-identity

# Should show your AWS account info
```

---

## 🚀 Next Steps

Once AWS CLI is installed and configured:

1. Run the setup script:
   ```bash
   ./setup-s3.sh
   ```

2. Deploy your app:
   ```bash
   ./deploy.sh
   ```

Your site will be live! 🎉

