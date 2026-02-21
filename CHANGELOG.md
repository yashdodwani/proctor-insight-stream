# Changelog

All notable changes to this project will be documented in this file.

## [2025-02-21] - AWS S3 Deployment

### Added
- AWS S3 static website hosting deployment
- Deployment scripts (`deploy.sh`, `setup-s3.sh`, `fix-404.sh`)
- GitHub Actions workflow for CI/CD (`.github/workflows/deploy-to-s3.yml`)
- S3 bucket policy configuration (`bucket-policy.json`)
- IAM policy for GitHub Actions (`iam-policy.json`)

### Configuration
- **S3 Bucket**: `proctoringreports`
- **Region**: `us-east-1`
- **Website URL**: http://proctoringreports.s3-website-us-east-1.amazonaws.com
- **Bucket Settings**: 
  - ACLs disabled (recommended)
  - Public access via bucket policy
  - Static website hosting enabled
  - Index document: `index.html`
  - Error document: `index.html`

### Deployment
- Build command: `npm run build`
- Deploy command: `./deploy.sh` or `aws s3 sync dist/ s3://proctoringreports --delete`
- CI/CD: Automatic deployment on push to `main` branch (requires GitHub secrets)

### GitHub Secrets Required (for CI/CD)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (us-east-1)
- `S3_BUCKET` (proctoringreports)
- `CLOUDFRONT_DISTRIBUTION_ID` (optional)

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Deployment**: AWS S3 + (optional) CloudFront

### Files Structure
```
dist/
  ├── index.html (1.09 kB)
  ├── assets/
  │   ├── index-[hash].css (60.24 kB)
  │   └── index-[hash].js (319.24 kB)
  ├── favicon.ico
  ├── placeholder.svg
  └── robots.txt
```

### Deployment Scripts
- `deploy.sh` - Build and deploy to S3
- `setup-s3.sh` - Configure S3 bucket for static hosting
- `fix-404.sh` - Troubleshoot and fix deployment issues

### Notes
- All deployment scripts work without ACL flags (bucket uses bucket policy)
- React Router support via error document configuration
- Gzip compression available (CSS: 10.61 kB, JS: 101.76 kB)

---

## Future Changes
Document all codebase changes here with date, description, and affected files.

