# 🚀 LeetCode Nexus Deployment Guide

This guide will help you deploy your LeetCode Nexus application to production using **Vercel + Vercel Postgres** with GitHub Actions.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier is sufficient)
- Google Cloud Console account (for OAuth)
- Node.js 18+ installed locally

## 🗄️ Database Setup (Vercel Postgres)

### 1. Create Vercel Postgres Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Postgres"** 
5. Choose **"Create"** (free tier: 60k rows, 256MB)
6. Name your database: `leetcode-nexus-db`

### 2. Get Database Connection String

1. Go to your database in Vercel Dashboard
2. Click **".env.local"** tab
3. Copy the `DATABASE_URL` (starts with `postgresql://`)

## 🔐 Authentication Setup (Google OAuth)

### 1. Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure OAuth consent screen:
   - Application name: "LeetCode Nexus"
   - User support email: your email
   - Developer contact: your email
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: "LeetCode Nexus Web"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://your-app-name.vercel.app/api/auth/callback/google` (production)

### 2. Save OAuth Credentials

- Copy **Client ID** and **Client Secret**
- You'll need these for environment variables

## 🚀 Vercel Deployment Setup

### 1. Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `./` (if monorepo, adjust accordingly)

### 2. Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Authentication
NEXTAUTH_SECRET=your-super-secret-32-char-string
NEXTAUTH_URL=https://your-app-name.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: GitHub OAuth
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-secret
```

### 3. Generate NextAuth Secret

```bash
# Run this command to generate a secure secret
openssl rand -base64 32
```

## ⚙️ GitHub Actions Setup

### 1. Create Vercel Token

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create new token with scope: **Full Account**
3. Copy the token

### 2. Get Vercel Project IDs

```bash
# Install Vercel CLI
npm i -g vercel@latest

# Login to Vercel
vercel login

# Link your project (run in project directory)
vercel link

# Get project and org IDs
cat .vercel/project.json
```

### 3. Add GitHub Secrets

Go to GitHub Repository → Settings → Secrets and Variables → Actions

Add these **Repository Secrets**:

```bash
# Vercel Configuration
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id

# Database (same as Vercel env vars)
DATABASE_URL=your-database-url

# The GITHUB_TOKEN is automatically provided by GitHub
```

## 🗃️ Database Migration

### 1. Run Initial Migration

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma migrate deploy
```

### 2. Seed Database (Optional)

If you have seed data:

```bash
npx prisma db seed
```

## 🚀 Deployment Process

### 1. Automatic Deployment

The GitHub Actions workflow will automatically:

- **On Pull Request**: Deploy preview to `https://leetcode-nexus-git-branch-username.vercel.app`
- **On Main Push**: Deploy to production `https://your-app-name.vercel.app`

### 2. Manual Deployment

```bash
# Deploy to production manually
vercel --prod

# Deploy preview
vercel
```

## 🛠️ Post-Deployment Setup

### 1. Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update `NEXTAUTH_URL` environment variable
4. Update Google OAuth redirect URIs

### 2. Update OAuth Redirect URIs

Update your Google OAuth application with the production URL:
- Add: `https://your-domain.com/api/auth/callback/google`

### 3. Test Deployment

Visit your deployed application and test:

- [ ] Authentication flow
- [ ] Company selection
- [ ] Problem list loading
- [ ] Search and pagination
- [ ] Progress tracking
- [ ] Theme toggle

## 📊 Monitoring & Analytics

### 1. Vercel Analytics (Optional)

1. Go to Vercel Dashboard → Your Project → Analytics
2. Enable Web Analytics
3. Add environment variable: `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`

### 2. Error Tracking with Sentry (Optional)

1. Create account at [Sentry.io](https://sentry.io/)
2. Create new project for Next.js
3. Add environment variables:
   ```bash
   SENTRY_DSN=your-sentry-dsn
   SENTRY_AUTH_TOKEN=your-auth-token
   ```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify `DATABASE_URL` is correct
   - Ensure database is accessible from Vercel

2. **OAuth Redirect Mismatch**
   - Check Google Console redirect URIs
   - Verify `NEXTAUTH_URL` matches deployment URL

3. **Build Failures**
   - Check GitHub Actions logs
   - Verify all environment variables are set

4. **CSVData Loading Issues**
   - Ensure `/public/data` directory is included in deployment
   - Check file paths in API routes

### Support Commands

```bash
# Check Vercel logs
vercel logs your-deployment-url

# Check database connection
npx prisma studio

# Reset database (caution!)
npx prisma migrate reset
```

## 🎯 Performance Optimization

1. **Enable Vercel Edge Functions** (if needed)
2. **Configure CDN caching** for static assets
3. **Optimize images** with Next.js Image component
4. **Enable compression** for API responses

## 🔒 Security Checklist

- [ ] Environment variables properly configured
- [ ] OAuth redirect URIs restricted to your domains
- [ ] HTTPS enforced in production
- [ ] Security headers configured (via `vercel.json`)
- [ ] Database access restricted to Vercel

---

## 🎉 Congratulations!

Your LeetCode Nexus application is now deployed to production with:

- ✅ **Automatic deployments** via GitHub Actions
- ✅ **Serverless database** with Vercel Postgres
- ✅ **Secure authentication** with Google OAuth
- ✅ **Preview deployments** for pull requests
- ✅ **Production monitoring** and analytics

**Live URL**: `https://your-app-name.vercel.app`

Happy coding! 🚀 