# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/68d86024-a6a1-4271-bc3d-c93ec1c59246

## How can I edit this code?

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/68d86024-a6a1-4273-c93ec1c59246) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right of the repository.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

I added a GitHub Actions workflow to deploy the built app to an S3 bucket and optionally invalidate a CloudFront distribution: `.github/workflows/deploy-to-s3.yml`.

Quick setup steps:

1. Create an S3 bucket and (optionally) a CloudFront distribution for the bucket.
2. In your repository settings -> Secrets -> Actions, add the following secrets:
   - `AWS_ACCESS_KEY_ID` — an IAM user access key with permissions to S3 (+ CloudFront if used)
   - `AWS_SECRET_ACCESS_KEY` — the IAM secret key
   - `AWS_REGION` — e.g. `us-east-1`
   - `S3_BUCKET` — the target S3 bucket name
   - `CLOUDFRONT_DISTRIBUTION_ID` — (optional) CloudFront distribution id to invalidate after deploy
3. Push to the `main` branch to trigger the workflow, or run it manually via Actions -> workflow -> Run workflow.

Security note

- Never paste real AWS credentials into public chat messages, issue trackers, or commit them into the repository. The repository and chat logs may be visible to others.
- Use GitHub Secrets, environment variables, or a secrets manager to store credentials.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.
Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
