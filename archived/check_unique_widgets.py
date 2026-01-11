
import os

widgets_dir = 'frontend/src/widgets/enterprise'
components_dir = 'frontend/src/components/enterprise'

widgets_files = set()
for root, dirs, files in os.walk(widgets_dir):
    for file in files:
        rel_path = os.path.relpath(os.path.join(root, file), widgets_dir)
        widgets_files.add(rel_path)

components_files = set()
for root, dirs, files in os.walk(components_dir):
    for file in files:
        rel_path = os.path.relpath(os.path.join(root, file), components_dir)
        components_files.add(rel_path)

unique_to_widgets = widgets_files - components_files

if unique_to_widgets:
    print("Files unique to widgets:")
    for f in unique_to_widgets:
        print(f)
else:
    print("No unique files in widgets.")
