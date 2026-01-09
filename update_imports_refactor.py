import os
import re

# Refactoring Import Mappings
MAPPINGS = [
    # Shared UI
    (r'@/components/atoms', '@/shared/ui/atoms'),
    (r'@/components/molecules', '@/shared/ui/molecules'),
    (r'@/components/organisms', '@/shared/ui/organisms'),
    (r'@/components/theme', '@/shared/ui/theme'),

    # Generic Libs
    (r'@/lib', '@/shared/lib'),
    (r'@/utils/cn', '@/shared/lib/cn'),
    (r'@/utils/dateUtils', '@/shared/lib/dateUtils'),
    (r'@/utils/formatDate', '@/shared/lib/formatDate'),
    (r'@/utils/formatUtils', '@/shared/lib/formatUtils'),
    (r'@/utils/stringUtils', '@/shared/lib/stringUtils'),
    (r'@/utils/idGenerator', '@/shared/lib/idGenerator'),
    (r'@/utils/valdiation', '@/shared/lib/validation'), # typo fix safe check
    (r'@/utils/validation', '@/shared/lib/validation'),
    (r'@/utils/sanitize', '@/shared/lib/sanitize'),

    # Generic Hooks
    (r'@/hooks/useDebounce', '@/shared/hooks/useDebounce'),
    (r'@/hooks/useToggle', '@/shared/hooks/useToggle'),
    (r'@/hooks/useClickOutside', '@/shared/hooks/useClickOutside'),
    (r'@/hooks/useInterval', '@/shared/hooks/useInterval'),
    (r'@/hooks/useResizeObserver', '@/shared/hooks/useResizeObserver'),
    (r'@/hooks/useIntersectionObserver', '@/shared/hooks/useIntersectionObserver'),
    (r'@/hooks/useFormId', '@/shared/hooks/useFormId'),
    (r'@/hooks/useKeyboardNav', '@/shared/hooks/useKeyboardNav'),
    (r'@/hooks/useScrollLock', '@/shared/hooks/useScrollLock'),
    (r'@/hooks/useHoverIntent', '@/shared/hooks/useHoverIntent'),
    (r'@/hooks/useArrayState', '@/shared/hooks/useArrayState'),
    (r'@/hooks/useMemoized', '@/shared/hooks/useMemoized'),

    # Domains (Moved completely)
    (r'@/components/features/calendar', '@/features/calendar'),
    (r'@/components/features/collaboration', '@/features/collaboration'),
    (r'@/components/features/messaging', '@/features/messaging'),
    (r'@/components/features/navigation', '@/features/navigation'),
    (r'@/components/features/notifications', '@/features/notifications'),
    (r'@/components/features/search', '@/features/search'),
    (r'@/components/features/user', '@/features/user'),
    (r'@/components/features/core', '@/features/core'),

    # Domains (Merged to ui/)
    (r'@/components/features/admin', '@/features/admin/ui'),
    (r'@/components/features/billing', '@/features/billing/ui'),
    (r'@/components/features/cases', '@/features/cases/ui'),
    (r'@/components/features/discovery', '@/features/discovery/ui'),
    (r'@/components/features/documents', '@/features/documents/ui'),
    (r'@/components/features/knowledge', '@/features/knowledge/ui'),
    (r'@/components/features/litigation', '@/features/litigation/ui'),
    (r'@/components/features/operations', '@/features/operations/ui'),

    # Dashboard - Special Case
    (r'@/components/dashboard', '@/features/dashboard'),
    (r'@/components/features/dashboard', '@/features/dashboard'),
]

ROOT_DIR = '/workspaces/lexiflow-premium/frontend/src'

def update_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        for old, new in MAPPINGS:
            # Simple string replace for import paths
            # We look for: from 'old...' or import 'old...'
            # But straightforward string replacement is usually safe for these specific long paths
            # provided we check context or just simple replace since these are absolute paths in aliased imports

            if old in content:
                content = content.replace(old, new)

        if content != original_content:
            print(f"Updating {filepath}")
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def main():
    print("Starting import update...")
    for root, dirs, files in os.walk(ROOT_DIR):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                update_file(os.path.join(root, file))
    print("Done.")

if __name__ == '__main__':
    main()
