# 🔄 Repository Sync Solutions

## Overview
This document explains how to keep your LeetCode Tracker app synchronized with the latest data from the [leetcode-company-wise-problems](https://github.com/liquidslr/leetcode-company-wise-problems) repository.

## 🛠️ Available Sync Methods

### 1. Manual Sync Script
**File**: `sync-leetcode-data.sh`

**Usage**:
```bash
./sync-leetcode-data.sh
```

**What it does**:
- Checks if the leetcode repository exists
- Updates the repository with `git pull`
- Copies updated data to `public/data/`
- Optionally restarts the development server

### 2. GitHub Actions (Automated)
**File**: `.github/workflows/sync-leetcode-data.yml`

**Triggers**:
- Daily at 2 AM UTC (cron schedule)
- Manual trigger via GitHub UI
- On push to main branch

**Features**:
- Automatically syncs data daily
- Commits changes if data is updated
- Optional Vercel deployment integration
- Manual trigger capability

### 3. Webhook API (Real-time)
**Endpoint**: `/api/sync-data`

**Usage**:
```bash
# Manual sync via API
curl -X POST http://localhost:3000/api/sync-data \
  -H "x-webhook-secret: your-webhook-secret"

# Check endpoint status
curl http://localhost:3000/api/sync-data
```

**Features**:
- Real-time sync via HTTP requests
- Webhook secret authentication
- Can be triggered by external services
- Returns sync status and output

## 🚀 Deployment Strategies

### Option 1: GitHub Actions + Vercel
1. **Set up GitHub Actions**:
   - Push your code to GitHub
   - The workflow will run automatically
   - Set up Vercel secrets in GitHub

2. **Required Secrets** (in GitHub repository settings):
   ```
   VERCEL_TOKEN=your-vercel-token
   ORG_ID=your-vercel-org-id
   PROJECT_ID=your-vercel-project-id
   VERCEL_ORG_ID=your-vercel-org-id
   ```

3. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - The GitHub Action will automatically deploy updates

### Option 2: Manual Deployment
1. **Run sync script**:
   ```bash
   ./sync-leetcode-data.sh
   ```

2. **Deploy manually**:
   ```bash
   npm run build
   # Deploy to your preferred platform
   ```

### Option 3: Webhook + External Service
1. **Set up webhook endpoint**:
   - Deploy your app with the webhook API
   - Set `WEBHOOK_SECRET` environment variable

2. **Trigger from external service**:
   - Use GitHub webhooks to trigger your API
   - Set up cron jobs on external services
   - Use services like Zapier or IFTTT

## 🔧 Configuration

### Environment Variables
Add to your `.env` file:
```env
WEBHOOK_SECRET=your-secure-webhook-secret
```

### GitHub Secrets (for Actions)
- `VERCEL_TOKEN`: Your Vercel API token
- `ORG_ID`: Your Vercel organization ID
- `PROJECT_ID`: Your Vercel project ID
- `VERCEL_ORG_ID`: Your Vercel organization ID

## 📋 Setup Instructions

### For GitHub Actions:
1. Push your code to GitHub
2. Go to repository Settings → Secrets and variables → Actions
3. Add the required Vercel secrets
4. The workflow will run automatically

### For Webhook API:
1. Deploy your application
2. Set the `WEBHOOK_SECRET` environment variable
3. Use the `/api/sync-data` endpoint to trigger syncs

### For Manual Sync:
1. Make the script executable: `chmod +x sync-leetcode-data.sh`
2. Run the script: `./sync-leetcode-data.sh`

## 🔍 Monitoring

### Check Sync Status:
- **GitHub Actions**: Check the Actions tab in your repository
- **Webhook API**: Check the response from the API endpoint
- **Manual Script**: Check the console output

### Logs:
- GitHub Actions logs are available in the Actions tab
- Webhook API logs are in your application logs
- Manual script output is shown in the terminal

## 🚨 Troubleshooting

### Common Issues:
1. **Permission denied**: Make sure the sync script is executable
2. **Git authentication**: Ensure proper Git credentials are set up
3. **Webhook secret mismatch**: Verify the secret in environment variables
4. **Vercel deployment fails**: Check that all required secrets are set

### Debug Commands:
```bash
# Check if script is executable
ls -la sync-leetcode-data.sh

# Test webhook endpoint
curl -X GET http://localhost:3000/api/sync-data

# Check GitHub Actions logs
# Go to repository → Actions tab → Click on failed workflow
```

## 📈 Recommended Approach

For production deployment, we recommend:

1. **Use GitHub Actions** for automatic daily syncs
2. **Set up Vercel deployment** for automatic deployments
3. **Keep the webhook API** for manual triggers when needed
4. **Monitor the Actions tab** to ensure syncs are working

This provides a robust, automated solution that keeps your app up-to-date with the latest LeetCode data!
