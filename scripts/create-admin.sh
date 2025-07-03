#!/bin/bash

# Obscura Labs Admin Setup Script
# This script creates an admin user for the Obscura Labs application

echo "🔐 Obscura Labs Admin Setup"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if database is running
echo "🔄 Checking database connection..."
if ! docker-compose ps | grep -q "obscura-postgres.*Up"; then
    echo "⚠️  Database container is not running"
    echo "Starting database..."
    docker-compose up -d postgres
    echo "Waiting for database to be ready..."
    sleep 10
fi

# Load environment variables
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Run the admin creation script
echo "🚀 Starting admin creation process..."
node scripts/create-admin.js

echo ""
echo "✅ Admin setup completed!"
echo "You can now access the application at: ${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
