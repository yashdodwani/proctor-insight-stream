# 🔑 AWS IAM Access Key Creation Guide

## Step-by-Step Visual Guide

### 🎯 Quick Navigation

**Direct Link to IAM Users:** https://console.aws.amazon.com/iam/home#/users

---

## Method 1: Create Access Key for Existing User (Yash)

### ✅ Best for: Quick testing and initial setup

### Steps:

1. **Go to IAM Console**
   ```
   AWS Console → Search "IAM" → Click IAM
   OR
   https://console.aws.amazon.com/iam/
   ```

2. **Click "Users" in Left Sidebar**
   - You should see your user "Yash" in the list

3. **Click on "Yash" User**

4. **Click "Security credentials" Tab**

5. **Scroll to "Access keys" Section**
   - You'll see existing access keys (if any)
   - Click **"Create access key"** button

6. **Select Use Case**
   - Choose: **"Command Line Interface (CLI)"**
   - Check the confirmation checkbox
   - Click **"Next"**

7. **Add Description (Optional)**
   - Description tag: "S3 Deployment" or "CLI Access"
   - Click **"Create access key"**

8. **⚠️ SAVE YOUR CREDENTIALS!**
   ```
   Access key ID:     AKIAXXXXXXXXXXXXXXXX
   Secret access key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYXXXXXXXXXX
   ```
   
   **Options to save:**
   - ✅ Click **"Download .csv file"** (RECOMMENDED)
   - ✅ Copy and paste to a secure location
   - ⚠️ You CANNOT retrieve the secret key again!

9. **Click "Done"**

---

## Method 2: Create New IAM User (Recommended for Production)

### ✅ Best for: GitHub Actions, production deployments, team access

### Steps:

1. **Go to IAM Users**
   ```
   https://console.aws.amazon.com/iam/home#/users
   ```

2. **Click "Create user" Button** (top right, orange button)

3. **Enter User Details**
   - User name: `github-actions-deployer` (or `s3-deployer`)
   - ❌ Do NOT check "Provide user access to AWS Management Console"
   - Click **"Next"**

4. **Set Permissions**
   
   **Option A: Quick Setup (Full S3 Access)**
   - Select: **"Attach policies directly"**
   - Search: `AmazonS3FullAccess`
   - Check the box next to it
   - Click **"Next"**

   **Option B: Minimal Permissions (Better Security)**
   - Select: **"Attach policies directly"**
   - Click **"Create policy"** (opens new tab)
   - Click **"JSON"** tab
   - Copy the policy from `iam-policy.json` in your project
   - Click **"Next"**
   - Policy name: `GitHubActionsS3Deploy`
   - Click **"Create policy"**
   - Go back to user creation tab
   - Refresh policies and search for `GitHubActionsS3Deploy`
   - Check the box
   - Click **"Next"**

5. **Review and Create**
   - Review the details
   - Click **"Create user"**

6. **Create Access Key for New User**
   - Click on the newly created user
   - Click **"Security credentials"** tab
   - Scroll to **"Access keys"**
   - Click **"Create access key"**
   - Select: **"Command Line Interface (CLI)"**
   - Check confirmation
   - Click **"Next"** → **"Create access key"**

7. **⚠️ SAVE YOUR CREDENTIALS!**
   - Download CSV file OR copy both keys
   - You won't see the secret key again!
   - Click **"Done"**

---

## 📝 What to Do With Your Access Keys

### For AWS CLI Configuration:

```bash
aws configure
```

Enter when prompted:
```
AWS Access Key ID [None]: AKIAXXXXXXXXXXXXXXXX
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYXXXXXXXXXX
Default region name [None]: us-east-1
Default output format [None]: json
```

### For GitHub Actions:

Add these as **GitHub Secrets**:

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add each secret:

| Secret Name | Value |
|-------------|-------|
| `AWS_ACCESS_KEY_ID` | Your Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | Your Secret Access Key |
| `AWS_REGION` | `us-east-1` |
| `S3_BUCKET` | `proctoringreports` |

---

## 🔒 Security Best Practices

✅ **DO:**
- Create separate IAM users for different purposes
- Use minimal required permissions
- Rotate access keys regularly (every 90 days)
- Download and save keys immediately
- Store keys in secure password manager
- Delete unused access keys

❌ **DON'T:**
- Share access keys with anyone
- Commit keys to Git repositories
- Use root account access keys
- Give more permissions than needed
- Leave keys in plain text files

---

## 🆘 Troubleshooting

### "Access denied" when creating user
→ Your current user (Yash) needs IAM permissions
→ Contact your AWS administrator

### Lost secret access key
→ You cannot retrieve it again
→ Delete the old key and create a new one

### Key not working
→ Verify you copied the entire key
→ Check for extra spaces
→ Ensure the user has correct permissions

---

## ✅ Next Steps After Creating Access Key

1. **Configure AWS CLI:**
   ```bash
   aws configure
   ```

2. **Test the credentials:**
   ```bash
   aws sts get-caller-identity
   ```
   
   Should show your user info!

3. **Run setup script:**
   ```bash
   ./setup-s3.sh
   ```

4. **Deploy your app:**
   ```bash
   ./deploy.sh
   ```

🎉 Your site goes live!

---

## 📋 Quick Reference

**IAM Users Console:**
```
https://console.aws.amazon.com/iam/home#/users
```

**Your S3 Bucket:**
```
https://s3.console.aws.amazon.com/s3/buckets/proctoringreports
```

**After deployment, your site:**
```
http://proctoringreports.s3-website-us-east-1.amazonaws.com
```

---

## 🎬 Video Tutorials (AWS Official)

- [Creating IAM Users](https://www.youtube.com/results?search_query=aws+iam+create+access+key)
- [AWS CLI Setup](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

---

**Need help?** Check `DEPLOYMENT.md` for more details!

