import os

def list_files(startpath):
    with open('file_list.txt', 'w') as f:
        for root, dirs, files in os.walk(startpath):
            if 'node_modules' in dirs:
                dirs.remove('node_modules')
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.css', '.scss')):
                    # Get absolute path
                    abs_path = os.path.join(root, file)
                    # Make it relative to the startpath (frontend/src) for easier matching
                    rel_path = os.path.relpath(abs_path, startpath)
                    # Normalize to forward slashes
                    rel_path = rel_path.replace('\\', '/')
                    f.write(f"{rel_path}\n")

if __name__ == "__main__":
    # Assuming the script is run from the root, and we want to list frontend/src
    target_dir = os.path.join(os.getcwd(), 'frontend', 'src')
    if os.path.exists(target_dir):
        print(f"Scanning {target_dir}...")
        list_files(target_dir)
        print("File list saved to file_list.txt")
    else:
        print(f"Directory {target_dir} not found.")
