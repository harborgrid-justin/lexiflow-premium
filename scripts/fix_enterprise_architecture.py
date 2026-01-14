#!/usr/bin/env python3
"""
Enterprise React Architecture Compliance - Batch Update
Adds Suspense + Await + defer() to all route components
"""

import re
from pathlib import Path
from typing import Dict, List

FRONTEND_ROUTES = Path("/workspaces/lexiflow-premium/frontend/src/routes")

# Pages that use loaders
LOADER_PAGES = [
    "admin", "analytics", "billing", "cases", "compliance",
    "correspondence", "crm", "discovery", "docket", "documents"
]

def update_page_with_suspense(filepath: Path) -> bool:
    """Add Suspense + Await wrapper to Page component"""
    content = filepath.read_text()

    # Skip if already has Suspense
    if '<Suspense' in content or 'Suspense } from' in content:
        print(f"  ✓ Already has Suspense: {filepath.name}")
        return False

    # Skip if no useLoaderData
    if 'useLoaderData' not in content:
        print(f"  ⊘ No loader data: {filepath.name}")
        return False

    route_name = filepath.parent.name
    pascal_name = ''.join(word.capitalize() for word in route_name.replace('-', ' ').split())

    # Update imports
    old_import = "import { useLoaderData } from 'react-router';"
    new_import = "import { Suspense } from 'react';\nimport { Await, useLoaderData } from 'react-router';\nimport { RouteSkeleton, RouteError } from '../_shared/RouteSkeletons';"

    if old_import in content:
        content = content.replace(old_import, new_import)
    else:
        # Try alternate import pattern
        content = re.sub(
            r"import \{ useLoaderData \} from 'react-router';",
            new_import,
            content
        )

    # Find the return statement and wrap it
    # Pattern: return ( <Provider ... > <View /> </Provider> );
    pattern = r'(\s+return \()(.*?)(Provider.*?</.*?Provider>)(\s+\);)'

    def replace_return(match):
        indent = match.group(1)
        provider_content = match.group(3)
        closing = match.group(4)

        # Extract provider props
        provider_match = re.search(r'<(\w+Provider)\s+(.*?)>', provider_content, re.DOTALL)
        if not provider_match:
            return match.group(0)

        provider_name = provider_match.group(1)
        provider_props = provider_match.group(2)

        # Convert data.prop to resolved.prop
        new_props = re.sub(r'data\.(\w+)', r'resolved.\1', provider_props)

        # Build new return
        new_return = f'''{indent}
    <Suspense fallback={{<RouteSkeleton title="Loading {pascal_name}" />}}>
      <Await resolve={{data}} errorElement={{<RouteError title="Failed to load {route_name}" />}}>
        {{(resolved) => (
          <{provider_name} {new_props}>
            <{pascal_name}View />
          </{provider_name}>
        )}}
      </Await>
    </Suspense>
  );'''
        return new_return

    new_content = re.sub(pattern, replace_return, content, flags=re.DOTALL)

    if new_content != content:
        filepath.write_text(new_content)
        print(f"  ✅ Updated: {filepath.name}")
        return True
    else:
        print(f"  ⚠ No changes: {filepath.name}")
        return False

def update_loader_with_defer(filepath: Path) -> bool:
    """Add defer() to loader return"""
    content = filepath.read_text()

    # Skip if already has defer
    if 'return defer(' in content:
        print(f"  ✓ Already uses defer: {filepath.name}")
        return False

    # Add defer import
    if 'from "react-router"' in content and 'defer' not in content:
        content = re.sub(
            r'(import type \{ LoaderFunctionArgs \} from "react-router";)',
            r'\1\nimport { defer } from "react-router";',
            content
        )

    # Wrap return statement with defer()
    # Pattern: return { ... };
    content = re.sub(
        r'return \{(.*?)\};',
        r'return defer({\1});',
        content,
        flags=re.DOTALL
    )

    filepath.write_text(content)
    print(f"  ✅ Updated loader: {filepath.name}")
    return True

def main():
    print("=" * 80)
    print("ENTERPRISE REACT ARCHITECTURE - BATCH UPDATE")
    print("=" * 80)

    updated_pages = 0
    updated_loaders = 0

    # Process each route directory
    for route_dir in FRONTEND_ROUTES.iterdir():
        if not route_dir.is_dir() or route_dir.name.startswith('_'):
            continue

        route_name = route_dir.name
        pascal_name = ''.join(word.capitalize() for word in route_name.replace('-', ' ').split())

        print(f"\n📁 {route_name}/")

        # Update Page component
        page_file = route_dir / f"{pascal_name}Page.tsx"
        if page_file.exists():
            if update_page_with_suspense(page_file):
                updated_pages += 1

        # Update loader
        loader_file = route_dir / "loader.ts"
        if loader_file.exists():
            if update_loader_with_defer(loader_file):
                updated_loaders += 1

    print("\n" + "=" * 80)
    print(f"✅ COMPLETE: Updated {updated_pages} pages, {updated_loaders} loaders")
    print("=" * 80)

if __name__ == "__main__":
    main()
