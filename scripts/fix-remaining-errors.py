#!/usr/bin/env python3
"""
Fix remaining critical linting errors:
- no-case-declarations (add block scopes in switch cases)
- no-constant-binary-expression
- no-constant-condition
- rules-of-hooks
"""

import re
from pathlib import Path

def fix_case_declarations(content):
    """Fix no-case-declarations by adding block scopes"""
    # Pattern: case X: \n  const/let/class
    pattern = r'(case\s+[^:]+:\s*\n\s*)(const|let|class|function)\s'
    replacement = r'\1{\n      \2 '
    
    # Add closing braces before break/return/next case
    content = re.sub(pattern, replacement, content)
    
    # Need to add closing braces - this is complex, will do specific files
    return content

def fix_file(file_path, fixes):
    """Apply fixes to a specific file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        modified = False
        for search, replace in fixes:
            if isinstance(search, str):
                if search in content:
                    content = content.replace(search, replace)
                    modified = True
            else:  # regex
                new_content = search.sub(replace, content)
                if new_content != content:
                    content = new_content
                    modified = True
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

# Specific file fixes
FIXES = {
    'frontend/src/routes/reports/$id.tsx': [
        # Fix case declaration at line 123
        (
            "    case 'time_entries':\n      const timeData",
            "    case 'time_entries': {\n      const timeData"
        ),
        (
            "      break;\n    case 'expenses':",
            "      break;\n    }\n    case 'expenses':"
        ),
    ],
    'frontend/src/services/features/bluebook/bluebookFormatter.ts': [
        # Fix case declaration at line 294
        (
            "      case 'Book':\n        const",
            "      case 'Book': {\n        const"
        ),
    ],
    'frontend/src/features/cases/components/list/CaseDetail.tsx': [
        # Fix rules-of-hooks error - move useEffect before early return
        # This needs manual inspection
    ],
    'frontend/src/services/data/repositories/DiscoveryRepository.ts': [
        # Fix no-constant-binary-expression at line 160
        (
            re.compile(r'(\|\|)\s+\[\]'),
            r'?? []'
        ),
    ],
    'frontend/src/services/data/repositories/TaskRepository.ts': [
        # Fix no-constant-binary-expression at line 413
        (
            re.compile(r'(\|\|)\s+\[\]'),
            r'?? []'
        ),
    ],
    'frontend/src/services/data/repositories/TrialRepository.ts': [
        # Fix no-constant-binary-expression at line 134
        (
            re.compile(r'(\|\|)\s+\[\]'),
            r'?? []'
        ),
    ],
    'frontend/src/services/domain/CalendarDomain.ts': [
        # Fix no-constant-binary-expression at line 426
        (
            re.compile(r'(\|\|)\s+\[\]'),
            r'?? []'
        ),
    ],
    'frontend/src/services/domain/SecurityDomain.ts': [
        # Fix no-constant-binary-expression at lines 279, 283
        (
            re.compile(r'(\|\|)\s+\[\]'),
            r'?? []'
        ),
    ],
    'frontend/src/services/infrastructure/CacheManager.ts': [
        # Fix no-constant-binary-expression at line 71
        (
            re.compile(r'(\|\|)\s+null'),
            r'?? null'
        ),
    ],
    'frontend/src/services/infrastructure/cryptoService.ts': [
        # Fix no-constant-binary-expression
        (
            re.compile(r'(\|\|)\s+(null|undefined|\[\])'),
            r'?? \2'
        ),
        # Fix no-constant-condition at line 342
        (
            'if (true || ',
            'if ('
        ),
    ],
    'frontend/src/services/infrastructure/queryClient.ts': [
        # Fix no-constant-binary-expression at line 229
        (
            re.compile(r'(\|\|)\s+\[\]'),
            r'?? []'
        ),
    ],
    'frontend/src/services/validation/schemas/billing-filters-schema.ts': [
        # Fix no-constant-binary-expression
        (
            re.compile(r'(\|\|)\s+0'),
            r'?? 0'
        ),
    ],
    'frontend/src/services/validation/validators/common-validators.ts': [
        # Fix no-constant-binary-expression
        (
            re.compile(r'&&\s+true'),
            ''
        ),
    ],
    'frontend/src/services/validation/validators/financial-validators.ts': [
        # Fix no-constant-binary-expression
        (
            re.compile(r'(\|\|)\s+(0|false)'),
            r'?? \2'
        ),
        (
            re.compile(r'&&\s+true'),
            ''
        ),
    ],
    'frontend/src/utils/docketValidation.ts': [
        # Fix no-constant-binary-expression at line 250
        (
            re.compile(r'(\|\|)\s+\[\]'),
            r'?? []'
        ),
    ],
    'frontend/src/utils/errorHandler.ts': [
        # Fix no-constant-condition at line 157
        (
            'if (true) {',
            'if (error) {'
        ),
    ],
    'frontend/src/utils/type-mapping.ts': [
        # Fix no-constant-condition at line 57
        (
            'if (true) {',
            '{'
        ),
    ],
}

def main():
    """Apply all fixes"""
    root = Path.cwd()
    fixed_count = 0
    
    print("Applying remaining linting fixes...\n")
    
    for file_rel, fixes in FIXES.items():
        file_path = root / file_rel
        
        if not file_path.exists():
            print(f"⚠️  File not found: {file_rel}")
            continue
        
        if fix_file(file_path, fixes):
            print(f"✓ {file_rel}")
            fixed_count += 1
    
    print(f"\n✓ Applied fixes to {fixed_count} files")

if __name__ == '__main__':
    main()