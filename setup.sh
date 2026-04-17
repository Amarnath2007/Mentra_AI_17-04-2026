#!/bin/bash

# ─────────────────────────────────────────────────────────────────
#  Mentra AI — Quick Setup Script
# ─────────────────────────────────────────────────────────────────

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        🎓 Mentra AI Setup              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
echo ""

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js 18+ first."
  exit 1
fi

NODE_VERSION=$(node -v | cut -d. -f1 | tr -d 'v')
if [ "$NODE_VERSION" -lt 16 ]; then
  echo "❌ Node.js 16+ required. Current: $(node -v)"
  exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) found${NC}"

# Server setup
echo ""
echo -e "${YELLOW}📦 Installing server dependencies...${NC}"
cd server
npm install --silent

if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "${GREEN}✅ Created server/.env from example${NC}"
  echo -e "${YELLOW}⚠️  Edit server/.env to add your OPENAI_API_KEY and MONGODB_URI${NC}"
else
  echo -e "${GREEN}✅ server/.env already exists${NC}"
fi

cd ..

# Client setup
echo ""
echo -e "${YELLOW}📦 Installing client dependencies...${NC}"
cd client
npm install --silent

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo -e "${GREEN}✅ Created client/.env.local from example${NC}"
else
  echo -e "${GREEN}✅ client/.env.local already exists${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Setup complete! Ready to launch.       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo "Start the app with two terminal windows:"
echo ""
echo -e "  ${BLUE}Terminal 1 (Server):${NC}"
echo -e "    cd server && npm run dev"
echo ""
echo -e "  ${BLUE}Terminal 2 (Client):${NC}"
echo -e "    cd client && npm run dev"
echo ""
echo -e "  ${GREEN}🌐 Open: http://localhost:3000${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  💡 App works WITHOUT MongoDB or OpenAI"
echo "     (uses in-memory storage + mock AI)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
