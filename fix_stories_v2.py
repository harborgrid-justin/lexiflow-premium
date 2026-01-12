#!/usr/bin/env python3
"""
Script to remove ThemeProvider and ToastProvider from story files decorators.
More aggressive version that removes all decorator usages.
"""

import os
import re
from pathlib import Path

stories_dir = Path("/workspaces/lexiflow-premium/frontend/src")
stories_files = list(stories_dir.glob("**/*.stories.tsx")) + list(stories_dir.glob("**/*.stories.ts"))

print(f"Found {len(stories_files)} stories files")

updated = 0
for file_path in sorted(stories_files):
    try:
        content = file_path.read_text()
        original_content = content

        # Check if file has ThemeProvider or ToastProvider
        if "ThemeProvider" not in content and "ToastProvider" not in content:
            continue

        # Pattern 1: Remove entire decorators array with ThemeProvider/ToastProvider
        # This handles complex nested patterns
        content = re.sub(
            r',?\s*decorators:\s*\[\s*\(Story[^)]*\)\s*=>\s*\([^)]*(?:<ThemeProvider|<ToastProvider)[^}]*\),\s*\],?',
            "",
            content,
            flags=re.MULTILINE | re.DOTALL
        )

        # Pattern 2: Try with simple regex for closing tags
        content = re.sub(
            r',?\s*decorators:\s*\[\s*[^[\]]*<(?:ThemeProvider|ToastProvider)[^[\]]*</(?:ThemeProvider|ToastProvider)>[^[\]]*\],?',
            "",
            content,
            flags=re.MULTILINE | re.DOTALL
        )

        # Remove imports if file no longer uses ThemeProvider or ToastProvider in code
        if "import { ThemeProvider }" in content:
            # Only remove if ThemeProvider tag is not in JSX
            if "<ThemeProvider>" not in content:
                content = re.sub(
                    r"import { ThemeProvider } from '@/features/theme';\n",
                    "",
                    content
                )

        if "import { ToastProvider }" in content:
            if "<ToastProvider>" not in content:
                content = re.sub(
                    r"import { ToastProvider } from '@providers.*?;\n",
                    "",
                    content
                )

        if content != original_content:
            file_path.write_text(content)
            updated += 1
            print(f"✓ {file_path.relative_to(stories_dir.parent)}")

    except Exception as e:
        print(f"✗ Error in {file_path}: {e}")

print(f"\nTotal files updated: {updated}")
