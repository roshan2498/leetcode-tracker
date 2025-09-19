#!/bin/bash

echo "🚀 Setting up LeetCode Tracker..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it with your Google OAuth credentials."
    echo "Required variables:"
    echo "- DATABASE_URL"
    echo "- NEXTAUTH_URL"
    echo "- NEXTAUTH_SECRET"
    echo "- GOOGLE_CLIENT_ID"
    echo "- GOOGLE_CLIENT_SECRET"
    exit 1
fi

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Setting up database..."
npx prisma migrate dev --name init

echo "✅ Setup complete! Run npm run dev to start the application."
echo "📝 Don't forget to:"
echo "   1. Set up Google OAuth credentials"
echo "   2. Update your .env file with the correct values"
echo "   3. Visit http://localhost:3000 to see the app"
