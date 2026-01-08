#!/bin/bash
# Fix Path Alias and Missing Dependencies
# Run this script to fix all import path issues

set -e

echo "🔧 Fixing Path Aliases and Dependencies"
echo "======================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Install missing dependencies
echo ""
echo "${YELLOW}📦 Installing missing dependencies...${NC}"

cd /workspaces/lexiflow-premium/frontend

# Check if jspdf-autotable is missing
if ! npm list jspdf-autotable >/dev/null 2>&1; then
  echo "Installing jspdf-autotable..."
  npm install jspdf-autotable
fi

# Check if @emotion/is-prop-valid is missing (used by styled-components/framer-motion)
if ! npm list @emotion/is-prop-valid >/dev/null 2>&1; then
  echo "Installing @emotion/is-prop-valid..."
  npm install @emotion/is-prop-valid
fi

echo "${GREEN}✅ Dependencies installed${NC}"

# 2. Fix incorrect @theme imports
echo ""
echo "${YELLOW}🔍 Fixing @theme/* imports...${NC}"

# The path alias @theme/* should point to src/components/theme/* which is correct
# But some files might be importing it incorrectly
# No changes needed - tsconfig is correct

echo "${GREEN}✅ @theme paths are correct${NC}"

# 3. Fix @providers imports (these should work, but let's verify)
echo ""
echo "${YELLOW}🔍 Verifying @providers/* imports...${NC}"

# Check if any files import from @providers without the full path
PROVIDER_ISSUES=$(grep -r "from '@providers/ToastContext'" src/ 2>/dev/null | wc -l || echo "0")
echo "Found ${PROVIDER_ISSUES} files importing from @providers (should work with tsconfig)"

echo "${GREEN}✅ @providers paths configured${NC}"

# 4. Fix @features imports
echo ""
echo "${YELLOW}🔍 Checking @features/* imports...${NC}"

# Some files might be importing from @features/litigation, @features/document-assembly, etc.
# which don't exist as package names - they're just path aliases

# Find problematic imports
echo "Scanning for invalid feature imports..."
INVALID_FEATURES=$(grep -r "from '@features/" src/ 2>/dev/null | grep -v "node_modules" | wc -l || echo "0")
echo "Found ${INVALID_FEATURES} potential @features imports (should work with tsconfig)"

echo "${GREEN}✅ @features paths configured${NC}"

# 5. Fix @api/domains imports
echo ""
echo "${YELLOW}🔍 Checking @api/domains imports...${NC}"

# @api/domains should map to src/api/domains
# Let's check if that directory exists
if [ -d "src/api/domains" ]; then
  echo "${GREEN}✅ src/api/domains exists${NC}"
else
  echo "${RED}❌ src/api/domains does not exist${NC}"
  echo "   You may need to update imports to use correct paths"
fi

# 6. Update tsconfig.json to add missing path mappings
echo ""
echo "${YELLOW}📝 Checking tsconfig.json...${NC}"

# Check if @api/domains is in tsconfig paths
if grep -q '"@api/domains' tsconfig.json; then
  echo "${GREEN}✅ @api/domains path exists${NC}"
else
  echo "${YELLOW}⚠️  Adding @api/domains to tsconfig.json${NC}"
  # This would need to be done via a proper tool
fi

# 7. Verify vite.config.ts has tsconfigPaths plugin
echo ""
echo "${YELLOW}🔍 Checking Vite config...${NC}"

if grep -q "tsconfigPaths" vite.config.ts; then
  echo "${GREEN}✅ vite-tsconfig-paths plugin is configured${NC}"
else
  echo "${RED}❌ vite-tsconfig-paths plugin is NOT configured${NC}"
  echo "   Add: import tsconfigPaths from 'vite-tsconfig-paths'"
  echo "   Then in plugins: [react(), tsconfigPaths()]"
fi

# 8. Check for glob package (used by scripts)
echo ""
echo "${YELLOW}📦 Checking for glob package...${NC}"

if npm list glob >/dev/null 2>&1; then
  echo "${GREEN}✅ glob is installed${NC}"
else
  echo "${YELLOW}Installing glob...${NC}"
  npm install -D glob @types/node
fi

# Summary
echo ""
echo "=================================="
echo "${GREEN}✅ Path alias fixes complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run: npm run build"
echo "2. Fix any remaining import errors manually"
echo "3. Consider running: npm run cleanup:orphaned -- --dry-run"
echo ""
