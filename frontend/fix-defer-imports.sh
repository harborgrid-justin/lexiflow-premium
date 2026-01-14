#!/bin/bash
# Fix React Router v7 defer() pattern
# Remove defer imports and calls - RRv7 handles promises automatically

echo "🔧 Fixing React Router v7 defer() pattern..."
echo "📋 React Router v7 Best Practice: Return promises directly from loaders"
echo ""

# Find all files importing defer
files=$(find src/routes -name "*.ts" -o -name "*.tsx" | xargs grep -l "import.*defer" 2>/dev/null)

count=0
for file in $files; do
  echo "  Processing: $file"

  # Remove defer import statement
  sed -i '/^import { defer } from "react-router";$/d' "$file"
  sed -i '/^import { defer } from '\''react-router'\'';$/d' "$file"

  # Remove defer from combined imports like: import type { LoaderFunctionArgs } from "react-router"; import { defer } from "react-router";
  # This becomes just: import type { LoaderFunctionArgs } from "react-router";

  # Unwrap defer() calls: return defer({ ... }) -> return { ... }
  # This preserves the object structure but removes defer wrapper
  perl -0777 -i -pe 's/return defer\(\{/return {/g' "$file"

  # Clean up any defer references in comments (update pattern description)
  sed -i 's/ENTERPRISE PATTERN: defer() for streaming/ENTERPRISE PATTERN: Direct promise return for streaming/g' "$file"
  sed -i 's/Use defer() for Suspense/Return promises directly for Suspense/g' "$file"

  count=$((count + 1))
done

echo ""
echo "✅ Fixed $count files"
echo "📖 React Router v7 automatically handles promise streaming"
echo "🎯 Use <Await> + <Suspense> in components for progressive rendering"
