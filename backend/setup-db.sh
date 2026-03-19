#!/bin/bash
# setup-db.sh - Database setup script

DB_NAME="ai_mentor_db"
DB_USER="postgres"
DB_HOST="localhost"

echo "🔧 AI Mentor Database Setup"
echo "============================"

# Note: You'll need to enter your PostgreSQL password when prompted

echo "📋 Step 1: Dropping existing database (if exists)..."
psql -h $DB_HOST -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Dropped $DB_NAME"
else
    echo "⚠️ Could not drop database (may already be gone)"
fi

echo ""
echo "📋 Step 2: Creating new database..."
psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Created $DB_NAME"
else
    echo "❌ Failed to create database. Check your credentials."
    exit 1
fi

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. cd backend"
echo "2. npm run dev"
echo "3. npm run seed  (in another terminal)"
