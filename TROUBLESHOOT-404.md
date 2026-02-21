# 🔧 404 ERROR TROUBLESHOOTING GUIDE

## Current Issue
You're seeing: **404 Not Found - NoSuchKey: index.html**

This means the S3 bucket is empty - no files were uploaded.

---

## ✅ SOLUTION - Run This Command:

Copy and paste this into your terminal:

```bash
cd /home/voyager4/projects/proctor-insight-stream && npm run build && aws s3 sync dist/ s3://proctoringreports --delete && aws s3 ls s3://proctoringreports/
```

### What this does:
1. Goes to your project directory
2. Builds the React app
3. Uploads all files to S3 (without ACL flag - bucket uses bucket policy for public access)
4. Shows you what was uploaded

---

## 📋 Expected Output

After running the command, you should see:

### Build Output:
```
vite v5.4.19 building for production...
✓ 1671 modules transformed.
dist/index.html                   1.09 kB
dist/assets/index-xxx.css        60.24 kB
dist/assets/index-xxx.js        319.24 kB
✓ built in 1.64s
```

### Upload Output:
```
upload: dist/index.html to s3://proctoringreports/index.html
upload: dist/assets/index-xxx.css to s3://proctoringreports/assets/index-xxx.css
upload: dist/assets/index-xxx.js to s3://proctoringreports/assets/index-xxx.js
upload: dist/favicon.ico to s3://proctoringreports/favicon.ico
upload: dist/placeholder.svg to s3://proctoringreports/placeholder.svg
upload: dist/robots.txt to s3://proctoringreports/robots.txt
```

### Verification:
```
2025-XX-XX XX:XX:XX       1234 index.html
2025-XX-XX XX:XX:XX      12345 assets/index-xxx.css
2025-XX-XX XX:XX:XX     123456 assets/index-xxx.js
```

---

## ✅ After Upload Completes

1. **Wait 30-60 seconds** for S3 to process
2. **Clear browser cache** or use incognito/private mode
3. **Visit:** http://proctoringreports.s3-website-us-east-1.amazonaws.com
4. **Refresh** if needed (Ctrl+F5 or Cmd+Shift+R)

---

## 🆘 If Still Not Working

### Check 1: Verify Files Are in S3
```bash
aws s3 ls s3://proctoringreports/ --recursive
```

Should show multiple files, including `index.html`

### Check 2: Verify Static Website Hosting
```bash
aws s3api get-bucket-website --bucket proctoringreports
```

Should show:
```json
{
    "IndexDocument": {
        "Suffix": "index.html"
    },
    "ErrorDocument": {
        "Key": "index.html"
    }
}
```

### Check 3: Verify Bucket Policy
```bash
aws s3api get-bucket-policy --bucket proctoringreports
```

Should show a policy allowing public read access.

---

## 🔄 Alternative: Use Fix Script

I created a comprehensive fix script:

```bash
cd /home/voyager4/projects/proctor-insight-stream
./fix-404.sh
```

This script:
- ✅ Cleans old builds
- ✅ Rebuilds from scratch
- ✅ Uploads to S3 with verbose output
- ✅ Verifies deployment

---

## 🐛 Common Issues & Fixes

### Issue: "npm: command not found"
**Fix:** Install Node.js first
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

### Issue: "aws: command not found"
**Fix:** Install AWS CLI
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Issue: "Unable to locate credentials"
**Fix:** Configure AWS
```bash
aws configure
```

### Issue: Build succeeds but upload fails
**Fix:** Check IAM permissions
- Ensure your AWS user has `s3:PutObject` permission
- Add `AmazonS3FullAccess` policy to your user

### Issue: Upload succeeds but still 404
**Fix:** Check bucket name and region
```bash
# Verify bucket exists
aws s3 ls | grep proctoringreports

# Check bucket region
aws s3api get-bucket-location --bucket proctoringreports
```

---

## 📊 Diagnostic Commands

Run these to diagnose the issue:

```bash
# 1. Check your AWS identity
aws sts get-caller-identity

# 2. List your S3 buckets
aws s3 ls

# 3. Check bucket contents
aws s3 ls s3://proctoringreports/ --recursive

# 4. Check if dist folder exists locally
ls -la dist/

# 5. Check if index.html exists locally
test -f dist/index.html && echo "EXISTS" || echo "MISSING"

# 6. Test bucket is accessible
curl -I http://proctoringreports.s3-website-us-east-1.amazonaws.com
```

---

## 🎯 Quick Fix Checklist

- [ ] Run: `cd /home/voyager4/projects/proctor-insight-stream`
- [ ] Run: `npm run build`
- [ ] Verify: `ls dist/index.html` (should exist)
- [ ] Run: `aws s3 sync dist/ s3://proctoringreports --delete`
- [ ] Verify: `aws s3 ls s3://proctoringreports/` (should show files)
- [ ] Wait: 30-60 seconds
- [ ] Test: http://proctoringreports.s3-website-us-east-1.amazonaws.com
- [ ] Clear browser cache if needed

---

## 💡 Prevention

To avoid this in the future:

1. **Always verify build:**
   ```bash
   npm run build && ls -la dist/
   ```

2. **Always verify upload:**
   ```bash
   aws s3 sync dist/ s3://proctoringreports --delete
   aws s3 ls s3://proctoringreports/ --recursive
   ```

3. **Use the deploy script:**
   ```bash
   ./deploy.sh
   ```
   (Now updated with better error checking!)

---

## 🚀 After Fix

Once working:
- Bookmark your site URL
- Set up GitHub Actions for easier deployments
- Consider CloudFront for HTTPS
- Monitor S3 costs (should be very low)

---

**RUN THE COMMAND AT THE TOP OF THIS DOCUMENT NOW!**

Your site should be live within 2 minutes.

