import os
import re

def fix_files(root_dir):
    pattern = re.compile(r'^(\s*//\s*=+\s*)(.+)$')

    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith(('.tsx', '.ts')):
                filepath = os.path.join(dirpath, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()

                new_lines = []
                modified = False
                for line in lines:
                    # check if line starts with code (not comment) but contains the comment pattern
                    # Or check if line starts with comment pattern and has code

                    match = pattern.match(line)
                    if match:
                        separator = match.group(1)
                        code = match.group(2)
                        # Check if 'code' is just more equals signs or whitespace
                        if not all(c in '= \r\n' for c in code):
                            # It contains code!
                            # print(f"Fixing {filepath}: {line.strip()[:50]}...")
                            new_lines.append(separator.strip() + '\n')
                            new_lines.append(code + '\n') # The code part might not have newline if it was at end of file, but we readlines() keeps it?
                            # limit check: readlines keeps newline. match.group(2) excludes newline if regex didn't capture it?
                            # regex . matches everything except newline.
                            # so code doesn't have newline.
                            modified = True
                            continue

                    new_lines.append(line)

                if modified:
                    print(f"Fixed {filepath}")
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.writelines(new_lines)

if __name__ == '__main__':
    fix_files('/workspaces/lexiflow-premium/frontend/src')
