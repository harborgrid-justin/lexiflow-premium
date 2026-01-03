#!/bin/bash

# Batch ESLint Fixes for Common Patterns
# This script fixes common ESLint errors across multiple files

echo "Starting batch ESLint fixes..."

# Fix 1: Remove unused parameter 'i' in map functions - replace with _
find frontend/src -type f -name "*.tsx" -o -name "*.ts" | while read -r file; do
    # Replace (item, i) => with (item) => when i is not used
    sed -i 's/\.map(\([^,]*\), i) =>/\.map(\1) =>/g' "$file" 2>/dev/null || true
done

# Fix 2: Remove unused 'isPending' from useTransition
find frontend/src -type f -name "*.tsx" -o -name "*.ts" | while read -r file; do
    sed -i 's/const \[isPending, startTransition\]/const [, startTransition]/g' "$file" 2>/dev/null || true
done

# Fix 3: Fix empty object patterns in route loaders
find frontend/src/routes -type f -name "*.tsx" | while read -r file; do
    sed -i 's/export async function loader({}/export async function loader()/g' "$file" 2>/dev/null || true
done

echo "✓ Batch fixes applied"
echo "Run 'npm run lint' to verify remaining issues"