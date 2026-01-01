import re
import os

routes_file = '/workspaces/lexiflow-premium/frontend/src/routes.ts'
base_dir = '/workspaces/lexiflow-premium/frontend/src'

try:
    with open(routes_file, 'r') as f:
        content = f.read()

    # Extract file paths from route definitions
    # Matches: route('path', 'file/path.tsx') or index('file/path.tsx') or layout('file/path.tsx', ...)
    # We need to handle cases like route("path", "file.tsx") and index("file.tsx")
    # The regex needs to be robust enough.

    # Regex explanation:
    # (?:route|index|layout|prefix)  - match function name
    # \s*\(\s*                       - match opening parenthesis and whitespace
    # (?:['"][^'"]*['"]\s*,\s*)?     - optionally match the first argument (path string) and comma
    # ['"]([^'"]+)['"]               - match the file path (captured group 1)

    matches = re.findall(r'(?:route|index|layout)\s*\(\s*(?:[\'"][^\'"]*[\'"]\s*,\s*)?[\'"]([^\'"]+)[\'"]', content)

    print(f"Found {len(matches)} route definitions.")

    missing_files = []
    for file_path in matches:
        full_path = os.path.join(base_dir, file_path)
        if not os.path.exists(full_path):
            missing_files.append(file_path)

    if missing_files:
        print('Missing files:')
        for f in missing_files:
            print(f)
    else:
        print('All route files exist.')

except Exception as e:
    print(f"Error: {e}")
