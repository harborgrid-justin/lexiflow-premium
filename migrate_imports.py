
import os
import re

def migrate_imports(root_dir):
    replacements = [
        # Special cases first (longer matches)
        (r'from [\'"]@/shared/ui/layouts(.*)[\'"]', r"from '@/layouts\1'"),
        (r'from [\'"]@/shared/ui/layouts(.*)[\'"]', r"from '@/layouts\1'"), # In case quote style differs in replacement? No, I'll control replacement quote.

        # UI mapping
        (r'from [\'"]@/shared/ui(.*)[\'"]', r"from '@/components\1'"),

        # Lib/Hooks/etc
        (r'from [\'"]@/shared/lib(.*)[\'"]', r"from '@/lib\1'"),
        (r'from [\'"]@/shared/hooks(.*)[\'"]', r"from '@/hooks\1'"),
        (r'from [\'"]@/shared/utils(.*)[\'"]', r"from '@/utils\1'"),
        (r'from [\'"]@/shared/services(.*)[\'"]', r"from '@/services\1'"),
        (r'from [\'"]@/shared/theme(.*)[\'"]', r"from '@/theme\1'"),
        (r'from [\'"]@/shared/types(.*)[\'"]', r"from '@/types\1'"),

        # Generic components
        (r'from [\'"]@/shared/components(.*)[\'"]', r"from '@/components\1'"),

        # Maybe handle relative paths too? (unsafe without resolution context, but I can check for ../shared/...)
        # (r'from [\'"]\.\./shared/(.*)[\'"]', ... ) -> NO, risky.
    ]

    for subdir, dirs, files in os.walk(root_dir):
        if 'node_modules' in subdir:
            continue

        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                filepath = os.path.join(subdir, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    original_content = content

                    for pattern, replacement in replacements:
                        # Use regex sub. Note: pattern captures the part AFTER the prefix
                        # Using a lambda or simple sub?
                        # Pattern: r'from [\'"]@/shared/ui/layouts(.*)[\'"]'
                        # Replacement: r"from '@/layouts\1'"
                        # This works if I construct the regex to handle both quote types

                        # Better regex to preserve quote type:
                        # r'(from )([\'"])@/shared/ui/layouts(.*)\2'
                        # Replacement: r"\1\2@/layouts\3\2"

                        pass

                    # Let's rebuild loops with better regex logic
                except Exception as e:
                    print(f"Error reading {filepath}: {e}")

def run_migration():
    root = '/workspaces/lexiflow-premium/frontend/src'

    # Improved list of precise replacements
    # (pattern, replacement_template)
    # Using quote capturing group \2

    mappings = [
        (r'(from\s+)([\'"])@/shared/ui/layouts', r'\1\2@/layouts'),
        (r'(from\s+)([\'"])@/shared/ui', r'\1\2@/components'),
        (r'(from\s+)([\'"])@/shared/lib', r'\1\2@/lib'),
        (r'(from\s+)([\'"])@/shared/hooks', r'\1\2@/hooks'),
        (r'(from\s+)([\'"])@/shared/utils', r'\1\2@/utils'),
        (r'(from\s+)([\'"])@/shared/services', r'\1\2@/services'),
        (r'(from\s+)([\'"])@/shared/theme', r'\1\2@/theme'),
        (r'(from\s+)([\'"])@/shared/types', r'\1\2@/types'),
        (r'(from\s+)([\'"])@/shared/components', r'\1\2@/components'),
    ]

    for subdir, dirs, files in os.walk(root):
        if 'node_modules' in subdir or '.git' in subdir:
            continue

        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                filepath = os.path.join(subdir, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                new_content = content
                for pattern, replacement in mappings:
                    # We match strictly the prefix of the import path
                    # pattern matches: from ' @/shared/ui/layouts...
                    # we want to replace @/shared/ui/layouts with @/layouts in that string

                    # Regex: (from\s+['"])@/shared/ui/layouts
                    # SUB: \1@/layouts

                    regex = re.compile(pattern)
                    new_content = regex.sub(replacement, new_content)

                if new_content != content:
                    print(f"Updating {filepath}")
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)

if __name__ == '__main__':
    run_migration()
