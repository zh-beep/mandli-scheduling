#!/bin/bash

# Setup Database for Mandli Scheduling System
# Requires: Supabase CLI installed
# Install: brew install supabase/tap/supabase

set -e

echo "============================================"
echo "Mandli Scheduling - Database Setup"
echo "============================================"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "Install it with:"
    echo "  brew install supabase/tap/supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Project details
PROJECT_ID="wfywbiryulnopmkwtixg"
ACCESS_TOKEN="sbp_4ad1e226d3ca8cad7b0ac93ee486b2bd74548bf8"

echo "📋 Project ID: $PROJECT_ID"
echo ""

# Link to project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref $PROJECT_ID

echo ""
echo "📄 Applying database schema..."
supabase db push

echo ""
echo "🌱 Seeding test data..."
psql "postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
  -f ../database/seed.sql

echo ""
echo "============================================"
echo "✅ Database setup complete!"
echo "============================================"
echo ""
echo "Admin credentials:"
echo "  Username: mandli"
echo "  Password: Mandli8"
echo ""
echo "Test users created: 10 (5 gents, 5 ladies)"
echo "Sample availability: 8 users for January 2025"
echo "Sample schedules: First 3 days of January"
echo ""
echo "Next steps:"
echo "1. Start backend server: cd backend && npm install && npm run dev"
echo "2. Visit: http://localhost:3001"
echo ""
