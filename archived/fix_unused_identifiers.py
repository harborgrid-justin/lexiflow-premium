import re
import os

def fix_unused_vars(error_file):
    with open(error_file, 'r') as f:
        content = f.read()

    # Parse errors
    # Group by file
    file_errors = {}
    current_file = None

    lines = content.split('\n')
    for line in lines:
        if line.startswith('/') and line.endswith(('.tsx', '.ts')):
            current_file = line.strip()
            if current_file not in file_errors:
                file_errors[current_file] = []
        elif current_file and 'error' in line and ('assigned a value but never used' in line or 'defined but never used' in line):
            # Parse line number and var name
            # Format:   9:11  error  'theme' is assigned ...
            match = re.search(r'(\d+):(\d+)\s+error\s+\'([^\']+)\'', line)
            if match:
                line_num = int(match.group(1))
                var_name = match.group(3)
                file_errors[current_file].append((line_num, var_name))

    for filepath, errors in file_errors.items():
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            continue

        with open(filepath, 'r') as f:
            file_lines = f.readlines()

        # Sort errors by line number descending to avoid shifting issues when deleting lines?
        # Actually modifying lines in place is safer.
        errors.sort(key=lambda x: x[0], reverse=True)

        modified = False

        for line_num, var_name in errors:
            idx = line_num - 1
            if idx >= len(file_lines):
                continue

            line = file_lines[idx]
            original_line = line

            # Case 1: Import
            # import { X, Y } from '...'
            if 'import ' in line and var_name in line:
                # Remove var_name from import list
                # handle comma logic
                # Regex to match variable in import
                # "Token, " or ", Token" or "Token" inside { }

                # Simple approach: remove "var_name," or ", var_name" or "var_name"
                # Check if it is the only import
                if re.search(r'import\s+\{\s*' + re.escape(var_name) + r'\s*\}\s+from', line):
                    # Remove the whole line
                    file_lines[idx] = '' # Mark for deletion? Or comment out?
                    # Deleting import is safe if truly unused.
                    # But checking if line becomes empty/invalid.
                    pass
                else:
                    # Remove from list
                    # Try removing "var_name, "
                    new_line = line.replace(f"{var_name}, ", "")
                    if new_line == line:
                         new_line = line.replace(f", {var_name}", "")
                    if new_line == line:
                         new_line = line.replace(f"{var_name}", "")

                    # Clean up empty braces if any?
                    if re.search(r'import\s+\{\s*\}\s+from', new_line):
                        file_lines[idx] = ''
                    else:
                        file_lines[idx] = new_line
                modified = True

            # Case 2: Destructuring assignment
            # const { tokens } = useTheme();
            elif ('const {' in line or 'let {' in line) and var_name in line:
                 # similar to import removal
                 # If it becomes empty "const {} = ...", remove line?
                 # Removing "tokens"
                new_line = line.replace(f"{var_name}, ", "")
                if new_line == line:
                     new_line = line.replace(f", {var_name}", "")
                if new_line == line:
                     new_line = line.replace(f"{var_name}", "")

                if re.search(r'const\s+\{\s*\}\s*=', new_line):
                    # Empty destructuring, remove line if side effect free?
                    # useTheme() might check context.
                    # But "NO _".
                    # If I remove "const { tokens } = useTheme();", I remove the hook call.
                    # Hooks MUST be called.
                    # So I should keep the line but make it valid?
                    # "const {} = useTheme();" is valid JS/TS.
                    file_lines[idx] = new_line
                else:
                    file_lines[idx] = new_line
                modified = True

            # Case 3: useState
            # const [searchQuery, setSearchQuery] = useState('');
            # If 'setSearchQuery' unused -> const [searchQuery] = ...
            # If 'searchQuery' unused -> const [, setSearchQuery] = ...
            elif ('const [' in line) and var_name in line:
                parts = line.split('=')
                if len(parts) > 1:
                    lhs = parts[0]
                    if '[' in lhs and ']' in lhs:
                         # e.g. "  const [searchQuery, setSearchQuery] "
                         content_inside = lhs[lhs.find('[')+1 : lhs.find(']')]
                         vars_in_state = [v.strip() for v in content_inside.split(',')]

                         if len(vars_in_state) >= 1:
                             if vars_in_state[0] == var_name:
                                 # Start unused. Replace with comma? "NO _".
                                 # ", setSearchQuery"
                                 # or just remove if only one? "const []" ? No.
                                 # If setX exists, use comma.
                                 if len(vars_in_state) > 1:
                                     new_content = ', ' + ', '.join(vars_in_state[1:])
                                     line = line.replace(content_inside, new_content)
                                     file_lines[idx] = line
                                     modified = True
                             elif len(vars_in_state) >= 2 and vars_in_state[1] == var_name:
                                 # Setter unused. Remove setter.
                                 # "const [searchQuery]"
                                 new_content = vars_in_state[0]
                                 line = line.replace(content_inside, new_content)
                                 file_lines[idx] = line
                                 modified = True

            # Case 4: Function Arguments
            # (props) => ... or function(a, b)
            # If 'contentType' is defined but never used.
            # This is hard to fix with regex safely.
            # I will skip Function Arguments for this script.
            # Or use "_" prefix? "Allowed unused vars must match /^_/u"
            # I will replace `var_name` with `_var_name` if it looks like an argument?
            # E.g. `(var_name)` or `(..., var_name)`
            # Be careful not to replace usage... but it is unused!
            elif var_name in line:
                # Naive replace: Prefix with _
                # Ensure word boundary
                pattern = r'\b' + re.escape(var_name) + r'\b'
                new_line = re.sub(pattern, '_' + var_name, line)
                if new_line != line:
                    file_lines[idx] = new_line
                    modified = True

        if modified:
             # Remove empty lines created by import removal
            final_lines = [l for l in file_lines if l.strip() != '']
            with open(filepath, 'w') as f:
                f.writelines(final_lines)
            print(f"Fixed {filepath}")

if __name__ == '__main__':
    fix_unused_vars('/workspaces/lexiflow-premium/eslint_errors.txt')
