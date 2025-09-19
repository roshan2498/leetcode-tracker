#!/bin/bash

# Script to sync leetcode-company-wise-problems repository
# This script can be run manually or set up as a cron job

echo "�� Syncing leetcode-company-wise-problems repository..."

# Navigate to the parent directory
cd "$(dirname "$0")/.."

# Check if the repository exists
if [ -d "leetcode-company-wise-problems" ]; then
    echo "📁 Repository found, updating..."
    cd leetcode-company-wise-problems
    git pull origin main
    echo "✅ Repository updated successfully"
    
    # Copy updated data to the app
    echo "📋 Copying updated data to app..."
    cd ../leetcode-tracker
    cp -r ../leetcode-company-wise-problems ./public/data
    echo "✅ Data synced to app"
    
    # Optional: Restart the application if running
    if pgrep -f "npm run dev" > /dev/null; then
        echo "🔄 Restarting development server..."
        pkill -f "npm run dev"
        npm run dev &
        echo "✅ Development server restarted"
    fi
    
else
    echo "📥 Repository not found, cloning..."
    git clone https://github.com/liquidslr/leetcode-company-wise-problems.git
    echo "✅ Repository cloned successfully"
    
    # Copy data to the app
    echo "📋 Copying data to app..."
    cd leetcode-tracker
    cp -r ../leetcode-company-wise-problems ./public/data
    echo "✅ Data synced to app"
fi

echo "🎉 Sync completed successfully!"
