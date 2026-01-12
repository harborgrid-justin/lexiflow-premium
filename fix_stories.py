#!/usr/bin/env python3
"""
Script to remove ThemeProvider and ToastProvider imports and decorators from story files.
"""

import os
import re
from pathlib import Path

# Get all stories files with ThemeProvider
stories_dir = Path("/workspaces/lexiflow-premium/frontend/src")
stories_files = list(stories_dir.glob("**/*.stories.tsx")) + list(stories_dir.glob("**/*.stories.ts"))

print(f"Found {len(stories_files)} stories files")

updated = 0
for file_path in stories_files:
    try:
        content = file_path.read_text()
        original_content = content

        # Check if file has ThemeProvider import
        if "import { ThemeProvider }" not in content and "import { useTheme }" not in content:
            continue

        # Remove ThemeProvider import if not used for hooks
        if "import { ThemeProvider }" in content and "<ThemeProvider>" not in content:
            content = re.sub(
                r"import { ThemeProvider } from '@/features/theme';\n",
                "",
                content
            )

        # Remove ToastProvider import if present and no decorator
        if "import { ToastProvider }" in content and "<ToastProvider>" not in content:
            content = re.sub(
                r"import { ToastProvider } from '@providers.*?;\n",
                "",
                content
            )

        # Remove decorator pattern 1: ThemeProvider wrapping with ToastProvider
        content = re.sub(
            r"\s*\(Story\) => \(\s*<ThemeProvider>\s*<ToastProvider>\s*(?:<div className=\"h-screen w-screen\">)?\s*<Story />\s*(?:</div>)?\s*</ToastProvider>\s*</ThemeProvider>\s*\),?",
            "",
            content,
            flags=re.MULTILINE | re.DOTALL
        )

        # Remove decorator pattern 2: ThemeProvider only with div
        content = re.sub(
            r"\s*\(Story[:\s]*\w*\) => \(\s*<ThemeProvider>\s*<div className=\"p-8 bg-white dark:bg-slate-900\">\s*<Story />\s*</div>\s*</ThemeProvider>\s*\),?",
            "",
            content,
            flags=re.MULTILINE | re.DOTALL
        )

        # Remove decorator pattern 3: ThemeProvider only simple
        content = re.sub(
            r"\s*\(Story[:\s]*\w*\) => \(\s*<ThemeProvider>\s*<Story />\s*</ThemeProvider>\s*\),?",
            "",
            content,
            flags=re.MULTILINE | re.DOTALL
        )

        # Clean up decorators array if it becomes empty or only has whitespace
        content = re.sub(
            r",?\s*decorators:\s*\[\s*\],?",
            "",
            content,
            flags=re.MULTILINE
        )

        if content != original_content:
            file_path.write_text(content)
            updated += 1
            print(f"✓ Updated: {file_path.relative_to(stories_dir.parent)}")

    except Exception as e:
        print(f"✗ Error processing {file_path}: {e}")

print(f"\nTotal files updated: {updated}")
