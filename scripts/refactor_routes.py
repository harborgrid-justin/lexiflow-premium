import os
import re

TARGET_DIR = "nextjs/src/app/api"
HEADER_IMPORT = 'import { CORS_HEADERS, SECURITY_HEADERS } from "@/lib/api-headers";'

def process_file(file_path):
    with open(file_path, "r") as f:
        content = f.read()

    # Check if already refactored
    if '@/lib/api-headers' in content:
        print(f"Skipping {file_path} (already refactored)")
        return

    # Check for body.title validation
    if 'if (!body.title' in content:
        print(f"WARNING: {file_path} contains potential copy-paste validation error: '!body.title'")

    # Remove local constant definitions
    # Regex to match const CORS_HEADERS = { ... }; handling multiline
    content = re.sub(r'const\s+CORS_HEADERS\s*=\s*{[^}]*};', '', content, flags=re.DOTALL)
    content = re.sub(r'const\s+SECURITY_HEADERS\s*=\s*{[^}]*};', '', content, flags=re.DOTALL)

    # Insert import
    # Look for the last import and add ours after it
    lines = content.split('\n')
    last_import_idx = -1
    for i, line in enumerate(lines):
        if line.startswith('import '):
            last_import_idx = i

    if last_import_idx != -1:
        lines.insert(last_import_idx + 1, HEADER_IMPORT)
    else:
        lines.insert(0, HEADER_IMPORT)

    # Clean up multiple blank lines
    new_content = '\n'.join(lines)
    new_content = re.sub(r'\n{3,}', '\n\n', new_content)

    with open(file_path, "w") as f:
        f.write(new_content)
    print(f"Updated {file_path}")

def main():
    if not os.path.exists(TARGET_DIR):
        print(f"Directory {TARGET_DIR} not found.")
        return

    for root, dirs, files in os.walk(TARGET_DIR):
        for file in files:
            if file == "route.ts":
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
