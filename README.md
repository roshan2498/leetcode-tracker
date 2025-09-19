# LeetCode Tracker

A Next.js application that helps you track your LeetCode progress by company. This app uses the [leetcode-company-wise-problems](https://github.com/liquidslr/leetcode-company-wise-problems) repository to provide company-specific problem lists.

## Features

- 🔐 Google OAuth authentication
- 📊 Progress tracking by company
- 📈 Visual progress statistics
- 🏢 Company-wise problem organization
- ⏰ Time-based problem filtering (30 days, 3 months, 6 months, etc.)
- �� Persistent progress storage

## Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd leetcode-tracker
npm install
```

### 2. Set up Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Usage

1. **Sign In**: Click "Sign in with Google" to authenticate
2. **Select Company**: Choose a company from the sidebar to view their problems
3. **Track Progress**: Use the dropdown next to each problem to mark your progress:
   - Not Started
   - In Progress
   - Completed
4. **View Stats**: See your completion rate and progress statistics in the sidebar

## Data Source

This application uses data from the [leetcode-company-wise-problems](https://github.com/liquidslr/leetcode-company-wise-problems) repository, which contains curated lists of LeetCode questions grouped by companies.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: SQLite with Prisma ORM
- **Data**: CSV files from leetcode-company-wise-problems repository

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
