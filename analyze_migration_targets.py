
import os
import re
import glob

# Patterns from apply_theme_tokens.py
COLOR_PATTERNS = [
    r'\bbg-white\b',
    r'\bbg-gray-\d+\b',
    r'\bbg-slate-\d+\b',
    r'\btext-white\b',
    r'\btext-gray-\d+\b',
    r'\btext-slate-\d+\b',
    r'\bborder-gray-\d+\b',
    r'\bborder-slate-\d+\b',
]

def analyze_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    score = 0
    issues = []

    # Check for hardcoded colors
    for pattern in COLOR_PATTERNS:
        matches = re.findall(pattern, content)
        if matches:
            score += len(matches)
            issues.append(f"Found {len(matches)} hardcoded colors matching {pattern}")

    # Check for unwired buttons (simple heuristic: Button without onClick, or onClick={() => {}})
    # This is a bit rough, but helps identify UI without logic.
    button_matches = re.findall(r'<Button[^>]*>', content)
    for btn in button_matches:
        if 'onClick' not in btn:
             score += 1
             issues.append("Button missing visible onClick")

    empty_onclick = re.findall(r'onClick=\{\(\)\s*=>\s*\{\}\}', content)
    if empty_onclick:
        score += len(empty_onclick) * 2 # Higher weight for explicitly empty
        issues.append(f"Found {len(empty_onclick)} empty onClick handlers")

    return score, issues

def main():
    root_dir = '/workspaces/lexiflow-premium/frontend/src'
    results = []

    for filepath in glob.glob(f'{root_dir}/**/*.tsx', recursive=True):
        if 'node_modules' in filepath:
            continue

        score, issues = analyze_file(filepath)
        if score > 0:
            results.append((score, filepath, issues))

    # Sort by score descending
    results.sort(key=lambda x: x[0], reverse=True)

    print(f"Found {len(results)} files with potential issues.")
    print("Top 55 candidates:")

    for i, (score, filepath, issues) in enumerate(results[:55]):
        rel_path = os.path.relpath(filepath, root_dir)
        print(f"{i+1}. {rel_path} (Score: {score})")
        # print(f"   Issues: {issues[:3]} ...")

if __name__ == '__main__':
    main()
