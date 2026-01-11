import os
import re

def update_route_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # 1. Add "export const dynamic = 'force-dynamic';" if missing
    if "export const dynamic" not in content:
        # Find the last import statement
        last_import_match = None
        for match in re.finditer(r'^import .*?;', content, re.MULTILINE | re.DOTALL):
            last_import_match = match

        if last_import_match:
            end_idx = last_import_match.end()
            # Check if there is a newline after
            insertion = "\n\nexport const dynamic = 'force-dynamic';"
            content = content[:end_idx] + insertion + content[end_idx:]
        else:
            # No imports? Insert at top
            content = "export const dynamic = 'force-dynamic';\n\n" + content

    # 2. Fix unawaited params in dynamic routes
    # Pattern: export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> })
    # And body uses params.id

    # We will search for the function signature and modify it.
    # We want to change `{ params }: { params: Promise<T> }` to `props: { params: Promise<T> }`
    # and then add `const params = await props.params;` at the start of the function.

    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

    for method in methods:
        # Regex to find the function signature with destructured params as promise
        # Look for: export async function METHOD(req, { params }: { params: Promise<...> })
        pattern = r'(export\s+async\s+function\s+' + method + r'\s*\(\s*[^,]+,\s*)(\{\s*params\s*\}\s*:\s*\{\s*params:\s*Promise<[^>]+>\s*\}\s*)(\))'

        # This regex is tricky because of nested braces.
        # Let's try a simpler heuristic.
        # usage of params: Promise
        if "params: Promise" in content and f"export async function {method}" in content:
            # Check if we are already awaiting
            func_start_idx = content.find(f"export async function {method}")
            func_body_start = content.find("{", func_start_idx)
            if func_body_start != -1:
                func_body_sample = content[func_body_start:func_body_start+200]
                if "await params" not in func_body_sample and "await props.params" not in func_body_sample:
                   # Need to fix.
                   # We will attempt to replace the destructuring with `props` and inject valid code.

                   # Find the param definition part
                   # We look for the closing parenthesis of the function arguments
                   args_end = content.find(")", func_body_start - 30) # search backwards from body start

                   # Just a heuristic replace for the specific pattern we saw in jurisdictions/[id]
                   # `{ params }: { params: Promise<{ id: string }> }`
                   # We want to replace `{ params }` with `props`
                   # But keeping the type definition ` { params: Promise<{ id: string }> }`

                   # Re-reading pattern: `request: NextRequest, { params }: { params: Promise<{ id: string }> }`
                   # We can replace `{ params }:` with `props:`
                   # And then inside the function, `const { params } = props; const resolvedParams = await params;`
                   # And replace usages of `params.` with `resolvedParams.`?
                   # That's too risky for a regex script on many files.

                   # Alternative: Just insert `const params = await (arguments[1].params);`? No, 'arguments' is not available in strict mode/arrow funcs usually (though these are function declarations).
                   # But Typescript might complain.

                   # Let's stick to adding 'dynamic' export first.
                   pass

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")
        return True
    return False

# Scan directories
count = 0
for root, dirs, files in os.walk("nextjs/src/app/api"):
    for file in files:
        if file == "route.ts":
            path = os.path.join(root, file)
            if update_route_file(path):
                count += 1

print(f"Total files updated: {count}")
