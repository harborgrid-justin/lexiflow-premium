#!/bin/bash
# Update all imports to new architecture

find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Skip node_modules and build artifacts
  if [[ "$file" =~ node_modules|dist|build ]]; then
    continue
  fi
  
  # Update Auth imports
  sed -i "s|from ['\"]@/contexts['\"]|from '@/providers/application/AuthProvider'|g" "$file"
  sed -i "s|from ['\"]@/contexts/auth/AuthProvider['\"]|from '@/providers/application/AuthProvider'|g" "$file"
  sed -i "s|import { useAuth } from ['\"]@/contexts['\"]|import { useAuth } from '@/hooks/useAuth'|g" "$file"
  sed -i "s|import { useAuthState } from ['\"]@/contexts['\"]|import { useAuthState } from '@/hooks/useAuth'|g" "$file"
  sed -i "s|import { useAuthActions } from ['\"]@/contexts['\"]|import { useAuthActions } from '@/hooks/useAuth'|g" "$file"
  
  # Update Theme imports
  sed -i "s|from ['\"]@/theme['\"]|from '@/lib/theme'|g" "$file"
  sed -i "s|import { useTheme } from ['\"]@/theme['\"]|import { useTheme } from '@/hooks/useTheme'|g" "$file"
  sed -i "s|import { ThemeProvider } from ['\"]@/theme['\"]|import { ThemeProvider } from '@/providers/infrastructure/ThemeProvider'|g" "$file"
  
  # Update Toast imports
  sed -i "s|import { useToast } from ['\"]@/contexts['\"]|import { useToast } from '@/hooks/useToast'|g" "$file"
  sed -i "s|import { ToastProvider } from ['\"]@/contexts['\"]|import { ToastProvider } from '@/providers/infrastructure/ToastProvider'|g" "$file"
done

echo "Import updates complete"
