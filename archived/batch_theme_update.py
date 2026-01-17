#!/usr/bin/env python3
"""
Batch Theme Update Script
Replaces hardcoded colors with theme provider tokens across all component files
"""

import re
import sys
from pathlib import Path

# Define color replacement mappings
COLOR_REPLACEMENTS = {
    # Background colors
    r'bg-white': '{backgroundColor: theme.surface.elevated}',
    r'bg-gray-50(?!\d)': '{backgroundColor: theme.surface.elevated}',
    r'bg-gray-100(?!\d)': '{backgroundColor: theme.surface.raised}',
    r'bg-gray-200(?!\d)': '{backgroundColor: theme.surface.muted}',
    r'bg-gray-700(?!\d)': '{backgroundColor: theme.surface.raised}',
    r'bg-gray-800(?!\d)': '{backgroundColor: theme.surface.elevated}',
    r'bg-gray-900(?!\d)': '{backgroundColor: theme.surface.elevated}',
    r'bg-slate-50(?!\d)': '{backgroundColor: theme.surface.elevated}',
    r'bg-slate-100(?!\d)': '{backgroundColor: theme.surface.raised}',
    r'bg-slate-200(?!\d)': '{backgroundColor: theme.surface.muted}',
    r'bg-slate-700(?!\d)': '{backgroundColor: theme.surface.raised}',
    r'bg-slate-800(?!\d)': '{backgroundColor: theme.surface.elevated}',
    r'bg-slate-900(?!\d)': '{backgroundColor: theme.surface.elevated}',

    # Text colors
    r'text-white(?!\-)': '{color: theme.text.inverse}',
    r'text-gray-300(?!\d)': '{color: theme.text.muted}',
    r'text-gray-400(?!\d)': '{color: theme.text.muted}',
    r'text-gray-500(?!\d)': '{color: theme.text.secondary}',
    r'text-gray-600(?!\d)': '{color: theme.text.secondary}',
    r'text-gray-700(?!\d)': '{color: theme.text.primary}',
    r'text-gray-800(?!\d)': '{color: theme.text.primary}',
    r'text-gray-900(?!\d)': '{color: theme.text.primary}',
    r'text-slate-300(?!\d)': '{color: theme.text.muted}',
    r'text-slate-400(?!\d)': '{color: theme.text.muted}',
    r'text-slate-500(?!\d)': '{color: theme.text.secondary}',
    r'text-slate-600(?!\d)': '{color: theme.text.secondary}',
    r'text-slate-700(?!\d)': '{color: theme.text.primary}',

    # Border colors
    r'border-gray-200(?!\d)': '{borderColor: theme.border.light}',
    r'border-gray-300(?!\d)': '{borderColor: theme.border.default}',
    r'border-gray-600(?!\d)': '{borderColor: theme.border.default}',
    r'border-gray-700(?!\d)': '{borderColor: theme.border.default}',
    r'border-slate-600(?!\d)': '{borderColor: theme.border.default}',
    r'border-slate-700(?!\d)': '{borderColor: theme.border.default}',
}

# Button-specific patterns to wire
BUTTON_PATTERNS = [
    (r'className="([^"]*?)bg-blue-600([^"]*?)"', 'style={{backgroundColor: theme.primary.DEFAULT, color: theme.text.inverse}} className="\\1\\2"'),
    (r'className="([^"]*?)bg-green-600([^"]*?)"', 'style={{backgroundColor: theme.status.success.bg, color: theme.text.inverse}} className="\\1\\2"'),
    (r'className="([^"]*?)bg-red-600([^"]*?)"', 'style={{backgroundColor: theme.status.error.bg, color: theme.text.inverse}} className="\\1\\2"'),
    (r'className="([^"]*?)bg-yellow-600([^"]*?)"', 'style={{backgroundColor: theme.status.warning.bg, color: theme.text.inverse}} className="\\1\\2"'),
]

def process_file(file_path: Path) -> tuple[int, int]:
    """Process a single file for theme updates"""
    try:
        content = file_path.read_text()
        original_content = content

        replacements = 0

        # Apply color replacements
        for pattern, replacement in COLOR_REPLACEMENTS.items():
            matches = len(re.findall(pattern, content))
            if matches > 0:
                content = re.sub(pattern, replacement, content)
                replacements += matches

        # Apply button-specific patterns
        for pattern, replacement in BUTTON_PATTERNS:
            matches = len(re.findall(pattern, content))
            if matches > 0:
                content = re.sub(pattern, replacement, content)
                replacements += matches

        if content != original_content:
            file_path.write_text(content)
            return (1, replacements)
        return (0, 0)

    except Exception as e:
        print(f"Error processing {file_path}: {e}", file=sys.stderr)
        return (0, 0)

def main():
    frontend_path = Path("/workspaces/lexiflow-premium/frontend")

    # Find all TSX files in components and routes
    tsx_files = []
    tsx_files.extend(frontend_path.glob("src/components/**/*.tsx"))
    tsx_files.extend(frontend_path.glob("src/routes/**/*.tsx"))

    # Exclude test and story files
    tsx_files = [
        f for f in tsx_files
        if not any(x in str(f) for x in ['.test.', '.stories.', '.spec.'])
    ]

    print(f"Processing {len(tsx_files)} TSX files...")

    total_files = 0
    total_replacements = 0

    for file_path in sorted(tsx_files):
        files_changed, replacements = process_file(file_path)
        if files_changed > 0:
            total_files += files_changed
            total_replacements += replacements
            print(f"✓ {file_path.relative_to(frontend_path)}: {replacements} replacements")

    print(f"\n✅ Complete! Updated {total_files} files with {total_replacements} replacements")

if __name__ == "__main__":
    main()
