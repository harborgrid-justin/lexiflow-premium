#!/usr/bin/env python3
"""
Script to remove verbose console.error statements from Next.js pages
These are causing console spam when backend is unavailable
"""

import os
import re
from pathlib import Path

def fix_console_errors(file_path):
    """Remove console.error lines that log 'Failed to load' messages"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Pattern 1: console.error('Failed to load ...', error);
    pattern1 = r"\s*console\.error\(['\"]Failed to load[^;]+;\n"
    content = re.sub(pattern1, "    // Silent error handling (logging disabled to reduce console noise)\n", content)

    # Pattern 2: console.error("Failed to load ...", error);
    pattern2 = r'\s*console\.error\("Failed to load[^;]+;\n'
    content = re.sub(pattern2, "    // Silent error handling (logging disabled to reduce console noise)\n", content)

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Find all page.tsx files and fix console.error statements"""
    app_dir = Path("/workspaces/lexiflow-premium/nextjs/src/app")

    fixed_count = 0
    for page_file in app_dir.rglob("page.tsx"):
        if fix_console_errors(page_file):
            print(f"Fixed: {page_file.relative_to(app_dir)}")
            fixed_count += 1

    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == "__main__":
    main()
