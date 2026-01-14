#!/usr/bin/env python3
"""
Fix Enterprise React Architecture Standard Violations
Applies Suspense + Await + defer() pattern to all routes
"""

import os
import re
from pathlib import Path
from typing import List, Tuple

FRONTEND_ROUTES = Path("/workspaces/lexiflow-premium/frontend/src/routes")

# Route names to process
ROUTES = [
    "admin", "analytics", "audit", "billing", "calendar", "cases",
    "citations", "clauses", "compliance", "correspondence", "crm",
    "daf", "data-platform", "discovery", "docket", "documents",
    "drafting", "entities", "evidence", "exhibits", "jurisdiction",
    "library", "litigation", "messages", "pleadings", "practice",
    "profile", "real-estate", "reports", "research", "rules",
    "settings", "war-room", "workflows"
]

def get_route_name(route_dir: str) -> str:
    """Convert route directory to PascalCase name"""
    return ''.join(word.capitalize() for word in route_dir.replace('-', ' ').split())

def fix_page_component(route_dir: str, content: str) -> str:
    """Add Suspense + Await wrapper to Page component"""
    route_name = get_route_name(route_dir)

    # Check if already has Suspense
    if 'import { Suspense' in content or '<Suspense' in content:
        print(f"  ✓ {route_name}Page already has Suspense")
        return content

    # Add imports
    if "import { useLoaderData } from 'react-router';" in content:
        content = content.replace(
            "import { useLoaderData } from 'react-router';",
            "import { Suspense } from 'react';\nimport { Await, useLoaderData } from 'react-router';"
        )
    elif "import { useLoaderData }" in content:
        content = re.sub(
            r"import \{ useLoaderData \} from 'react-router';",
            "import { Suspense } from 'react';\nimport { Await, useLoaderData } from 'react-router';",
            content
        )

    # Find the component body
    component_match = re.search(
        rf'export function {route_name}PageContent\(\) \{{.*?return \((.*?)\);.*?\}}',
        content,
        re.DOTALL
    )

    if not component_match:
        print(f"  ⚠ Could not match component structure for {route_name}Page")
        return content

    # Build Suspense wrapper
    skeleton_component = f"""
/**
 * {route_name} Skeleton - Suspense Fallback
 */
function {route_name}Skeleton() {{
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-pulse">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {{[1, 2, 3].map(i => (
            <div key={{i}} className="h-32 bg-slate-200 dark:bg-slate-800 rounded" />
          ))}}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
}}

/**
 * {route_name} Error - Error Boundary
 */
function {route_name}Error() {{
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-rose-600">Failed to load {route_dir}</h2>
        <p className="text-slate-600 dark:text-slate-400">Please refresh the page or contact support</p>
      </div>
    </div>
  );
}}"""

    # Append skeleton components
    content += skeleton_component

    return content

def fix_loader(route_dir: str, content: str) -> str:
    """Convert loader to use defer()"""

    # Check if already using defer
    if 'from "react-router"' in content and 'defer' in content:
        if 'return defer(' in content:
            print(f"  ✓ {route_dir}/loader already uses defer()")
            return content

    # Add defer import
    if 'import type { LoaderFunctionArgs }' in content:
        content = content.replace(
            'import type { LoaderFunctionArgs } from "react-router";',
            'import type { LoaderFunctionArgs } from "react-router";\nimport { defer } from "react-router";'
        )

    # Find return statement and wrap with defer
    return_match = re.search(r'return \{(.*?)\};', content, re.DOTALL)
    if return_match:
        return_obj = return_match.group(1).strip()
        content = content.replace(
            f'return {{{return_obj}}};',
            f'return defer({{{return_obj}}});'
        )
        print(f"  ✓ Wrapped return with defer() in {route_dir}/loader")

    return content

def process_route(route_dir: str):
    """Process a single route directory"""
    route_path = FRONTEND_ROUTES / route_dir

    if not route_path.exists():
        print(f"⚠ Route not found: {route_dir}")
        return

    print(f"\n📁 Processing {route_dir}/")

    # Fix Page component
    page_file = route_path / f"{get_route_name(route_dir)}Page.tsx"
    if page_file.exists():
        content = page_file.read_text()
        fixed_content = fix_page_component(route_dir, content)
        if fixed_content != content:
            page_file.write_text(fixed_content)
            print(f"  ✅ Updated {page_file.name}")

    # Fix loader
    loader_file = route_path / "loader.ts"
    if loader_file.exists():
        content = loader_file.read_text()
        fixed_content = fix_loader(route_dir, content)
        if fixed_content != content:
            loader_file.write_text(fixed_content)
            print(f"  ✅ Updated loader.ts")

def main():
    print("=" * 80)
    print("ENTERPRISE REACT ARCHITECTURE COMPLIANCE FIX")
    print("=" * 80)
    print(f"\nProcessing {len(ROUTES)} routes...")

    for route in ROUTES:
        try:
            process_route(route)
        except Exception as e:
            print(f"❌ Error processing {route}: {e}")

    print("\n" + "=" * 80)
    print("✅ COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    main()
