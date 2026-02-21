# Changelog

All notable changes to this project will be documented in this file.

## [2025-02-21] - API Testing Tools

### Added
- Created comprehensive API test page (`api-test.html` and `public/api-test.html`)
- Interactive testing interface for all API endpoints
- CORS debugging tools
- Network information display
- Real-time error reporting

### Testing Features
- **Test Candidate Reports**: `/reports/candidate/{id}` endpoint
- **Test Session Reports**: `/reports/report/{session_id}` endpoint
- **CORS Check**: Verifies CORS headers
- **Network Info**: Shows connection details
- **Response Time**: Measures API performance
- **Error Details**: Shows full error stack traces

### Access Test Page
```
http://proctoringreports.s3-website-us-east-1.amazonaws.com/api-test.html
```

### Current Status
⚠️ **CORS Issue**: Backend needs to add CORS headers for origin:
```
http://proctoringreports.s3-website-us-east-1.amazonaws.com
```

---

## [2025-02-21] - Fix Routing for /reports/candidate/:candidateId

### Fixed
- Added route `/reports/candidate/:candidateId` to match API URL structure
- Now both `/report/:candidateId` and `/reports/candidate/:candidateId` work

### Files Affected
- `src/App.tsx` - Added new route pattern

### Why This Was Needed
The API uses the path pattern `/reports/candidate/{id}` but the frontend only had `/report/{id}`, causing 404 errors when accessing URLs with the full API path structure.

---

## [2025-02-21] - Backend URL Update

### Changed
- Updated backend API URL from `https://proctoring-reports-4.onrender.com` to `https://proctoring.formapply.in`
- Refactored API configuration to use centralized config file

### Added
- Created `src/config/api.ts` for centralized API endpoint management
- Added `.env` and `.env.example` files for environment-based configuration
- Added support for `VITE_API_BASE_URL` environment variable

### Files Affected
- `src/pages/Report.tsx` - Updated to use API config instead of hardcoded URL
- `src/config/api.ts` - New API configuration file
- `.env` - Environment configuration
- `.env.example` - Environment template for developers
- `.gitignore` - Added .env files to prevent committing sensitive data

### API Endpoints
- **Base URL**: `https://proctoring.formapply.in`
- **Get Report**: `/reports/report/{session_id}`
- **Get Candidate Reports**: `/reports/candidate/{candidate_id}`

---

## [2025-02-21] - Repository Cleanup

### Removed
- AWS CLI installer file (`awscliv2.zip` - 63.69 MB) - was accidentally committed
- 8 documentation markdown files to reduce repository noise
  - AWS-SETUP.md
  - CHECKLIST.md
  - DEPLOYMENT.md
  - DEPLOYMENT-SUCCESS.md
  - IAM-ACCESS-KEY-GUIDE.md
  - NEXT-STEPS-YOUR-KEY.md
  - TROUBLESHOOT-404.md
  - QUICKSTART.md

### Changed
- Updated `.gitignore` to exclude AWS CLI installer files
- Simplified README.md to focus on project overview
- Created single CHANGELOG.md as source of truth for all documentation

### Documentation Structure
- **README.md** - Project overview, quick start, deployment commands
- **CHANGELOG.md** - All changes, deployment details, configuration (this file)

---

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

## Template for Future Changes

When making changes to the codebase, add new entries at the top using this format:

```markdown
## [YYYY-MM-DD] - Short Description

### Added
- New features or files

### Changed
- Modified features or files

### Fixed
- Bug fixes

### Removed
- Deleted features or files

### Files Affected
- List of modified files
```

**Keep the most recent changes at the top of this file.**

