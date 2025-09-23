# 🚀 LeetCode Nexus Deployment Guide

This guide will help you deploy your simplified LeetCode Nexus application to production. The application now works entirely client-side with local storage, making deployment much simpler.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier is sufficient)
- Node.js 18+ installed locally

## 🌟 Simplified Architecture

The application has been simplified to remove complexity:
- ✅ **No Database Required**: Progress stored in browser's local storage
- ✅ **No Authentication**: No sign-up or login needed
- ✅ **No External Dependencies**: Just static files and data sync
- ✅ **Fast Deployment**: Deploy in minutes, not hours

## 🚀 Quick Deployment (Vercel)

### 1. Prepare Your Repository

1. Push your code to GitHub
2. Ensure your repository includes the `/public/data` directory with company CSV files

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### 3. Environment Variables (Optional)

Add these environment variables in Vercel dashboard if you want data sync functionality:

```env
WEBHOOK_SECRET=your-secure-webhook-secret
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
```

**Note**: These are only needed if you want automated data sync from the source repository.

### 4. Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (usually 1-2 minutes)
3. Your app will be available at `https://your-app-name.vercel.app`

## 🐳 Docker Deployment

### 1. Build Docker Image

```bash
docker build -t leetcode-nexus .
```

### 2. Run Container

```bash
docker run -p 3000:3000 leetcode-nexus
```

### 3. Access Application

Visit `http://localhost:3000`

## 🔄 Data Sync Pipeline (Optional)

If you want to keep the problem data updated automatically:

### 1. Set Up Webhook Secret

```bash
# Generate a secure secret
openssl rand -base64 32
```

### 2. Configure GitHub Webhook

1. Go to your repository settings
2. Add webhook: `https://your-app.vercel.app/api/sync-data`
3. Use the secret from step 1
4. Select "Push" events

### 3. Add Environment Variables

In Vercel dashboard, add:

```env
WEBHOOK_SECRET=your-generated-secret
```

## 📱 Features Available Immediately

After deployment, users can:

- ✅ Browse problems by company
- ✅ Filter by difficulty and time period
- ✅ Search problems and topics
- ✅ Track progress locally
- ✅ View completion statistics
- ✅ Switch between dark/light themes
- ✅ Export/import progress (browser features)

## 🔧 Maintenance

### Regular Updates

The app is self-maintaining with the data sync pipeline. Manual updates are rarely needed.

### Monitoring

- Use Vercel Analytics (free) for basic metrics
- Monitor API routes `/api/companies` and `/api/sync-data`
- Check browser console for any client-side errors

## 🌍 Custom Domain (Optional)

1. In Vercel dashboard, go to **Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## 📊 Performance Optimization

The app is already optimized with:
- ✅ Next.js static generation
- ✅ Client-side caching
- ✅ Efficient CSV parsing
- ✅ Local storage for instant updates
- ✅ Responsive design for all devices

## 🛠️ Troubleshooting

### Common Issues

1. **Build Fails**: Ensure all dependencies are in `package.json`
2. **Data Not Loading**: Check `/public/data` directory exists
3. **Progress Not Saving**: Check browser's local storage isn't disabled

### Support

- Check application logs in Vercel dashboard
- Test locally with `npm run dev`
- Verify CSV files are properly formatted

## 🎉 That's It!

Your LeetCode Nexus is now deployed and ready to use. Users can start tracking their progress immediately without any account setup! 