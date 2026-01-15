import os

def fix_parsing_headers(root_dir):
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith(('.ts', '.tsx')):
                filepath = os.path.join(dirpath, filename)
                with open(filepath, 'r') as f:
                    lines = f.readlines()

                modified = False
                for i, line in enumerate(lines):
                    stripped = line.strip()
                    if '====' in stripped:
                        if stripped.startswith('//'):
                            continue
                        if stripped.startswith('*'):
                            continue
                        if stripped.startswith('/*'):
                            continue

                        # Crude check for string literals to avoid corrupting code
                        if '"' in stripped or "'" in stripped or '`' in stripped:
                            # Might be code: const x = "===="
                            continue

                        # Assuming it's a broken header
                        # Preserve indentation? Usually these are at column 0
                        # But if indented, // should validly comment it.
                        lines[i] = '// ' + line
                        modified = True
                        print(f"Fixed line {i+1} in {filepath}: {stripped}")

                if modified:
                    with open(filepath, 'w') as f:
                        f.writelines(lines)

if __name__ == '__main__':
    fix_parsing_headers('/workspaces/lexiflow-premium/frontend/src')
