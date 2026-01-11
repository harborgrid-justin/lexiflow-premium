import os
import filecmp

dir1 = '/workspaces/lexiflow-premium/frontend/src/widgets/enterprise'
dir2 = '/workspaces/lexiflow-premium/frontend/src/components/enterprise'

def compare_dirs(d1, d2):
    dcmp = filecmp.dircmp(d1, d2)
    if dcmp.left_only:
        print(f"Files only in {d1}: {dcmp.left_only}")
    # if dcmp.right_only:
    #     print(f"Files only in {d2}: {dcmp.right_only}")
    if dcmp.diff_files:
        print(f"Differing files in {d1} and {d2}: {dcmp.diff_files}")

    for sub in dcmp.subdirs:
        compare_dirs(os.path.join(d1, sub), os.path.join(d2, sub))

compare_dirs(dir1, dir2)
