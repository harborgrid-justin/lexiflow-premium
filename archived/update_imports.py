import os
import re

def process_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Regex to find imports from @/lib/api-config
    pattern = re.compile(r'import\s+\{([^}]+)\}\s+from\s+[\'"]@/lib/api-config[\'"];?')

    matches = list(pattern.finditer(content))
    if not matches:
        return

    new_content = content
    offset = 0

    for match in matches:
        full_match = match.group(0)
        imports_str = match.group(1)

        # Split imports by comma and clean whitespace
        imports = [i.strip() for i in imports_str.split(',')]
        imports = [i for i in imports if i] # remove empty strings

        if 'apiFetch' in imports:
            # It needs modification
            imports.remove('apiFetch')

            replacement = ""

            # Reconstruct original import if there are leftovers
            if imports:
                new_imports_str = ', '.join(imports)
                replacement += f"import {{ {new_imports_str} }} from '@/lib/api-config';\n"

            # Add new import
            replacement += "import { apiFetch } from '@/lib/api-server';"

            # Calculate where to replace in the modified string
            start, end = match.span()
            # Adjust for changes made so far?
            # Actually, string replacement is easier if we replace text.
            # But duplicate imports might exist (unlikely in valid code)
            pass

    # Re-impl with replace to be simpler (assuming one import per file usually)
    lines = content.split('\n')
    new_lines = []
    modified = False

    for line in lines:
        match = pattern.search(line)
        if match:
            imports_str = match.group(1)
            imports = [i.strip() for i in imports_str.split(',')]
            imports = [i for i in imports if i]

            if 'apiFetch' in imports:
                modified = True
                imports.remove('apiFetch')

                parts = []
                if imports:
                    if len(imports) > 0:
                         parts.append(f"import {{ {', '.join(imports)} }} from '@/lib/api-config';")

                parts.append("import { apiFetch } from '@/lib/api-server';")
                new_lines.append('\n'.join(parts))
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)

    if modified:
        print(f"Updating {file_path}")
        with open(file_path, 'w') as f:
            f.write('\n'.join(new_lines))

def main():
    root_dir = '/workspaces/lexiflow-premium/nextjs/src'
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
