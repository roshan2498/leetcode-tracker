# LeetCode Tracker

A simple Next.js application that helps you track your LeetCode progress by company. This app uses the [leetcode-company-wise-problems](https://github.com/liquidslr/leetcode-company-wise-problems) repository to provide company-specific problem lists and stores your progress locally in your browser.

## Features

- 📊 Progress tracking by company (stored locally)
- 📈 Visual progress statistics
- 🏢 Company-wise problem organization
- ⏰ Time-based problem filtering (30 days, 3 months, 6 months, etc.)
- 💾 Local storage for progress (no account needed)
- 🔄 Automated data sync pipeline to keep problem lists updated

## Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd leetcode-tracker
npm install
```

### 2. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Usage

1. **Select Company**: Choose a company from the dropdown to view their problems
2. **Track Progress**: Use the dropdown next to each problem to mark your progress:
   - Not Started
   - In Progress
   - Completed
3. **View Stats**: See your completion rate and progress statistics in the sidebar
4. **Filter & Search**: Use the search bar and filters to find specific problems
5. **Local Storage**: Your progress is automatically saved in your browser's local storage

## Data Source

This application uses data from the [leetcode-company-wise-problems](https://github.com/liquidslr/leetcode-company-wise-problems) repository, which contains curated lists of LeetCode questions grouped by companies.

## Data Sync Pipeline

The application includes a sync pipeline that automatically updates the problem lists from the source repository. This ensures you always have the latest company-specific problems without needing to manually update.

### Pipeline Configuration

For production deployments, you can set up automatic data synchronization by configuring:

```env
WEBHOOK_SECRET="your-webhook-secret"
VERCEL_TOKEN="your-vercel-token"
VERCEL_ORG_ID="your-vercel-org-id"
VERCEL_PROJECT_ID="your-vercel-project-id"
```

## Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Data Storage**: Browser Local Storage (no database required)
- **Data Source**: CSV files from leetcode-company-wise-problems repository
- **Sync Pipeline**: Automated scripts to update problem data

## No Authentication Required

This version has been simplified to work without any authentication. Your progress is stored locally in your browser, making it:
- ✅ **Simple**: No account creation needed
- ✅ **Private**: Data stays on your device
- ✅ **Fast**: No server round-trips for progress updates
- ⚠️ **Note**: Progress is tied to your browser/device

## Development

The application includes several helpful scripts:

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linting
npm run sync         # Manually sync data from source repository
```
