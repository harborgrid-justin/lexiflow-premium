#!/usr/bin/env python3
"""
Script to remove unused 'React' imports from TypeScript/TSX files.
Handles both 'import React from "react"' and 'import React, { ... } from "react"'
"""
import re
import sys
from pathlib import Path

def fix_react_import(content: str) -> tuple[str, bool]:
    """Remove or fix unused React imports."""
    changed = False
    
    # Pattern 1: import React from "react"; or import React from 'react';
    pattern1 = r'^import React from ["\']react["\'];?\s*$'
    if re.search(pattern1, content, re.MULTILINE):
        content = re.sub(pattern1, '', content, flags=re.MULTILINE)
        changed = True
    
    # Pattern 2: import React, { ... } from "react"; -> import { ... } from "react";
    pattern2 = r'^import React, \{([^}]+)\} from (["\'])react\2;'
    if re.search(pattern2, content, re.MULTILINE):
        content = re.sub(pattern2, r'import {\1} from \2react\2;', content, flags=re.MULTILINE)
        changed = True
    
    return content, changed

def main():
    frontend_dir = Path(__file__).parent
    
    # Find all .tsx and .ts files in src directory
    src_dir = frontend_dir / 'src'
    files = list(src_dir.rglob('*.tsx')) + list(src_dir.rglob('*.ts'))
    
    fixed_count = 0
    for file_path in files:
        try:
            content = file_path.read_text(encoding='utf-8')
            new_content, changed = fix_react_import(content)
            
            if changed:
                file_path.write_text(new_content, encoding='utf-8')
                print(f"Fixed: {file_path.relative_to(frontend_dir)}")
                fixed_count += 1
        except Exception as e:
            print(f"Error processing {file_path}: {e}", file=sys.stderr)
    
    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    main()
