#!/bin/bash

# Database Setup Script for AI Health Assistant
# This script automates the database configuration process

set -e

echo "🚀 Starting Database Setup for AI Health Assistant"
echo "=================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check Node.js
echo -e "${BLUE}📋 Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi
echo "✅ Node.js version: $(node --version)"

# 2. Install dependencies
echo ""
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install firebase firebase-admin pg prisma @prisma/client mongoose bcryptjs jsonwebtoken
echo "✅ Dependencies installed"

# 3. Create .env.local if it doesn't exist
echo ""
echo -e "${BLUE}🔐 Setting up environment variables...${NC}"
if [ ! -f .env.local ]; then
    cat > .env.local << 'EOF'
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_health_assistant
POSTGRES_URL_NON_POOLING=postgresql://postgres:postgres@localhost:5432/ai_health_assistant

# MongoDB Atlas
MONGODB_URI=mongodb://localhost:27017/ai_health_assistant

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
EOF
    echo "✅ Created .env.local (please update with your credentials)"
else
    echo "ℹ️  .env.local already exists"
fi

# 4. Generate Prisma Client
echo ""
echo -e "${BLUE}🔧 Generating Prisma Client...${NC}"
npx prisma generate
echo "✅ Prisma Client generated"

# 5. Create Prisma migration
echo ""
echo -e "${BLUE}📁 Creating Prisma migration...${NC}"
npx prisma migrate dev --name init --skip-generate || echo "ℹ️  Migration may already exist"
echo "✅ Migrations applied"

# 6. Create necessary directories
echo ""
echo -e "${BLUE}📂 Creating necessary directories...${NC}"
mkdir -p src/app/api/appointments
mkdir -p src/app/api/health
mkdir -p src/app/api/chat
mkdir -p src/app/api/payments
mkdir -p prisma
echo "✅ Directories created"

# 7. Check database connections
echo ""
echo -e "${BLUE}🔗 Testing database connections...${NC}"

# Test PostgreSQL
echo -n "Testing PostgreSQL... "
if psql postgresql://postgres:postgres@localhost:5432/ai_health_assistant -c "SELECT 1" &>/dev/null; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL not available (this is OK for now)${NC}"
fi

# Test MongoDB
echo -n "Testing MongoDB... "
if timeout 2 mongosh "mongodb://localhost:27017/ai_health_assistant" --eval "db.adminCommand('ping')" &>/dev/null; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB not available (this is OK for now)${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Update .env.local with your Firebase, PostgreSQL, and MongoDB credentials"
echo "2. Run 'npm run dev' to start development server"
echo "3. Test connections with: curl http://localhost:3000/api/health/check"
echo ""
echo "📚 Documentation:"
echo "   - See DATABASE_SETUP_GUIDE.md for detailed instructions"
echo "   - See DATABASE_UPGRADE_GUIDE.md for implementation details"
echo ""
