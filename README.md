# Proctor Insight Stream

A real-time monitoring and reporting dashboard for proctoring insights.

## 🚀 Live Demo

**Production**: http://proctoringreports.s3-website-us-east-1.amazonaws.com

## 📋 Quick Start

### Environment Setup

1. Copy the environment template:
```sh
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
VITE_API_BASE_URL=https://proctoring.formapply.in
```

### Development

```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```sh
# Build for production
npm run build

# Deploy to AWS S3
./deploy.sh
```

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Deployment**: AWS S3 + GitHub Actions

## 🌐 Deployment

### Manual Deployment

```sh
# Configure S3 bucket (one-time setup)
./setup-s3.sh

# Deploy to S3
./deploy.sh
```

### Automatic Deployment (GitHub Actions)

Push to `main` branch triggers automatic deployment to AWS S3.

**Required GitHub Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (us-east-1)
- `S3_BUCKET` (proctoringreports)

See `.github/workflows/deploy-to-s3.yml` for workflow details.

## 📝 Documentation

- **CHANGELOG.md** - All project changes and deployment configuration
- Deployment scripts: `deploy.sh`, `setup-s3.sh`, `fix-404.sh`
- AWS configurations: `bucket-policy.json`, `iam-policy.json`

## 📂 Project Structure

```
src/
  ├── components/     # React components
  ├── pages/         # Page components
  ├── hooks/         # Custom hooks
  └── lib/           # Utilities

public/            # Static assets
dist/              # Production build
```

## 🔧 Available Scripts

```sh
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

**For detailed deployment information and all changes, see [CHANGELOG.md](./CHANGELOG.md)**
