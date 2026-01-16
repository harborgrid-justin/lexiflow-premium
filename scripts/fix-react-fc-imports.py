#!/usr/bin/env python3
"""
Fix React.FC Import Issues - Batch Processor
============================================

Fixes components using React.FC without importing React.
Supports two modes:
  1. Quick Fix: Just add React import
  2. Full Fix: Add React import + convert to function declaration (React 18 best practice)

Usage:
  python scripts/fix-react-fc-imports.py --mode quick --dry-run
  python scripts/fix-react-fc-imports.py --mode full --apply
"""

import os
import re
import argparse
from pathlib import Path
from typing import List, Tuple, Optional

# Configuration
FRONTEND_SRC = Path(__file__).parent.parent / "frontend" / "src"
EXCLUDE_DIRS = {"node_modules", "dist", "build", ".git", "coverage"}
INCLUDE_EXTENSIONS = {".tsx", ".ts"}


class ReactFCFixer:
    def __init__(self, dry_run: bool = True, mode: str = "quick"):
        self.dry_run = dry_run
        self.mode = mode  # 'quick' or 'full'
        self.files_fixed = 0
        self.files_skipped = 0
        self.files_with_errors = []

    def find_affected_files(self) -> List[Path]:
        """Find all files using React.FC without importing React."""
        affected_files = []

        for root, dirs, files in os.walk(FRONTEND_SRC):
            # Skip excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            for file in files:
                if not any(file.endswith(ext) for ext in INCLUDE_EXTENSIONS):
                    continue

                file_path = Path(root) / file

                try:
                    content = file_path.read_text(encoding='utf-8')

                    # Check if file uses React.FC
                    if not re.search(r'React\.FC', content):
                        continue

                    # Check if React is already imported
                    has_react_import = bool(re.search(r'^import\s+React', content, re.MULTILINE))
                    has_star_import = bool(re.search(r'^import\s+\*\s+as\s+React', content, re.MULTILINE))

                    if not has_react_import and not has_star_import:
                        affected_files.append(file_path)

                except Exception as e:
                    print(f"⚠️  Error reading {file_path}: {e}")

        return affected_files

    def add_react_import(self, content: str) -> Tuple[str, bool]:
        """Add React import to existing imports section."""
        lines = content.split('\n')

        # Find first import statement
        first_import_idx = None
        for idx, line in enumerate(lines):
            if line.strip().startswith('import '):
                first_import_idx = idx
                break

        if first_import_idx is None:
            # No imports found, add at top after comments
            insert_idx = 0
            for idx, line in enumerate(lines):
                if not line.strip().startswith('//') and not line.strip().startswith('/*') and not line.strip().startswith('*'):
                    if line.strip() != '':
                        insert_idx = idx
                        break
            lines.insert(insert_idx, "import React from 'react';")
            return '\n'.join(lines), True

        # Check if we can modify existing react import
        react_import_idx = None
        for idx in range(first_import_idx, min(first_import_idx + 20, len(lines))):
            if re.match(r"^import\s+\{[^}]*\}\s+from\s+['\"]react['\"];?", lines[idx]):
                react_import_idx = idx
                break

        if react_import_idx is not None:
            # Modify existing import to add React namespace
            old_import = lines[react_import_idx]
            # Extract the named imports
            match = re.match(r"^import\s+\{([^}]*)\}\s+from\s+['\"]react['\"];?", old_import)
            if match:
                named_imports = match.group(1).strip()
                lines[react_import_idx] = f"import React, {{ {named_imports} }} from 'react';"
                return '\n'.join(lines), True
        else:
            # Insert new React import before first import
            lines.insert(first_import_idx, "import React from 'react';")
            return '\n'.join(lines), True

        return content, False

    def convert_component_declaration(self, content: str) -> Tuple[str, bool]:
        """Convert React.FC arrow function to function declaration."""
        # Pattern: export const ComponentName: React.FC<Props> = ({ props }) => {
        pattern = r'export\s+const\s+(\w+):\s*React\.FC(?:<([^>]+)>)?\s*=\s*\(([^)]*)\)\s*=>\s*\{'

        def replace_func(match):
            component_name = match.group(1)
            props_type = match.group(2) or ''
            params = match.group(3)

            if props_type:
                return f'export function {component_name}({params}: {props_type}) {{'
            else:
                return f'export function {component_name}({params}) {{'

        new_content, count = re.subn(pattern, replace_func, content)

        if count > 0:
            # Also need to fix closing }; to just }
            # This is tricky - we need to find the matching closing brace
            # For now, just flag it for manual review
            return new_content, True

        return content, False

    def fix_file(self, file_path: Path) -> bool:
        """Fix a single file."""
        try:
            content = file_path.read_text(encoding='utf-8')
            original_content = content
            modified = False

            # Step 1: Add React import
            content, import_added = self.add_react_import(content)
            if import_added:
                modified = True
                print(f"  ✓ Added React import")

            # Step 2: Convert to function declaration (if full mode)
            if self.mode == 'full':
                content, converted = self.convert_component_declaration(content)
                if converted:
                    modified = True
                    print(f"  ✓ Converted to function declaration")
                    print(f"  ⚠️  NOTE: You may need to manually change closing '}}' to '}}'")

            if not modified:
                return False

            # Apply changes
            if not self.dry_run:
                file_path.write_text(content, encoding='utf-8')
                print(f"  💾 Saved changes")
            else:
                print(f"  🔍 DRY RUN - No changes written")

            return True

        except Exception as e:
            print(f"  ❌ Error: {e}")
            self.files_with_errors.append((file_path, str(e)))
            return False

    def process_files(self, files: List[Path]):
        """Process all affected files."""
        total = len(files)
        print(f"\n{'='*60}")
        print(f"Found {total} files with React.FC but no React import")
        print(f"Mode: {self.mode.upper()}")
        print(f"Dry Run: {self.dry_run}")
        print(f"{'='*60}\n")

        for idx, file_path in enumerate(files, 1):
            rel_path = file_path.relative_to(FRONTEND_SRC.parent.parent)
            print(f"\n[{idx}/{total}] Processing: {rel_path}")

            if self.fix_file(file_path):
                self.files_fixed += 1
            else:
                self.files_skipped += 1

        self.print_summary()

    def print_summary(self):
        """Print summary of operations."""
        print(f"\n{'='*60}")
        print("SUMMARY")
        print(f"{'='*60}")
        print(f"✓ Files fixed: {self.files_fixed}")
        print(f"⊘ Files skipped: {self.files_skipped}")
        print(f"❌ Files with errors: {len(self.files_with_errors)}")

        if self.files_with_errors:
            print(f"\nFiles with errors:")
            for file_path, error in self.files_with_errors:
                rel_path = file_path.relative_to(FRONTEND_SRC.parent.parent)
                print(f"  - {rel_path}")
                print(f"    Error: {error}")

        if self.dry_run:
            print(f"\n⚠️  This was a DRY RUN - no files were modified")
            print(f"   Run with --apply to make actual changes")
        else:
            print(f"\n✅ All changes have been applied!")
            print(f"   Review the changes and test thoroughly")


def main():
    parser = argparse.ArgumentParser(
        description="Fix React.FC import issues in TypeScript/React files",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Preview what would be fixed (quick mode - just add imports)
  python scripts/fix-react-fc-imports.py --mode quick --dry-run

  # Apply quick fix (add React imports)
  python scripts/fix-react-fc-imports.py --mode quick --apply

  # Preview full fix (add imports + convert to function declarations)
  python scripts/fix-react-fc-imports.py --mode full --dry-run

  # Apply full fix
  python scripts/fix-react-fc-imports.py --mode full --apply
        """
    )

    parser.add_argument(
        '--mode',
        choices=['quick', 'full'],
        default='quick',
        help='Quick: Just add React import. Full: Add import + convert to function declaration'
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without modifying files (default)'
    )

    parser.add_argument(
        '--apply',
        action='store_true',
        help='Actually apply the changes to files'
    )

    args = parser.parse_args()

    # Default to dry-run if neither --dry-run nor --apply specified
    dry_run = not args.apply

    fixer = ReactFCFixer(dry_run=dry_run, mode=args.mode)

    print("🔍 Scanning for files with React.FC but no React import...")
    affected_files = fixer.find_affected_files()

    if not affected_files:
        print("\n✅ No files found with React.FC import issues!")
        return

    fixer.process_files(affected_files)


if __name__ == '__main__':
    main()
