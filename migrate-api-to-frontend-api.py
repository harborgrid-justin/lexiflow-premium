#!/usr/bin/env python3
"""
Enterprise Frontend API Migration Script
Converts old API services (frontend/src/api/) to new frontend-api pattern
(frontend/src/lib/frontend-api/)

This script:
1. Scans all old API files
2. Extracts method signatures and documentation
3. Generates new frontend-api files following the enterprise pattern
4. Maps old imports to new imports
5. Identifies files that need updating
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Set, Tuple
from collections import defaultdict

# Configuration
OLD_API_DIR = Path("frontend/src/api")
NEW_API_DIR = Path("frontend/src/lib/frontend-api")
EXCLUDE_DIRS = {"types"}
EXCLUDE_FILES = {"index.ts"}

# Domain mapping
DOMAIN_MAPPING = {
    "admin": "admin",
    "analytics": "analytics",
    "auth": "auth",
    "billing": "billing",
    "litigation/cases": "cases",
    "communications": "communications",
    "compliance": "compliance",
    "data-platform": "data-platform",
    "discovery": "discovery",
    "domains": "domains",
    "enterprise": "enterprise",
    "hr": "hr",
    "integrations": "integrations",
    "intelligence": "intelligence",
    "trial": "trial",
    "workflow": "workflow",
    "docket": "docket",
    "documents": "documents",
}


class ApiFile:
    """Represents an old API file to be migrated"""

    def __init__(self, path: Path):
        self.path = path
        self.relative_path = path.relative_to(OLD_API_DIR)
        self.content = path.read_text() if path.exists() else ""
        self.domain = self._extract_domain()
        self.methods = self._extract_methods()
        self.imports = self._extract_imports()
        self.types = self._extract_types()

    def _extract_domain(self) -> str:
        """Extract domain from file path"""
        parts = str(self.relative_path).split(os.sep)
        if len(parts) > 1:
            # Check domain mapping
            for key, domain in DOMAIN_MAPPING.items():
                if key in str(self.relative_path):
                    return domain
            return parts[0]
        return "misc"

    def _extract_methods(self) -> List[Dict]:
        """Extract public methods from class or module"""
        methods = []

        # Look for class methods
        class_pattern = r"async\s+(\w+)\s*\([^)]*\)\s*:\s*Promise<([^>]+)>"
        for match in re.finditer(class_pattern, self.content):
            method_name, return_type = match.groups()
            if not method_name.startswith("_"):
                methods.append(
                    {
                        "name": method_name,
                        "async": True,
                        "return_type": return_type.strip(),
                    }
                )

        return methods

    def _extract_imports(self) -> List[str]:
        """Extract import statements"""
        import_pattern = r"^import\s+.*from\s+['\"]([^'\"]+)['\"]"
        imports = []
        for line in self.content.split("\n"):
            match = re.match(import_pattern, line)
            if match:
                imports.append(match.group(1))
        return imports

    def _extract_types(self) -> List[str]:
        """Extract exported types/interfaces"""
        type_pattern = r"^export\s+(?:interface|type|class)\s+(\w+)"
        types = []
        for line in self.content.split("\n"):
            match = re.match(type_pattern, line)
            if match:
                types.append(match.group(1))
        return types


def scan_api_files() -> List[ApiFile]:
    """Scan all API files"""
    files = []
    for root, dirs, filenames in os.walk(OLD_API_DIR):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for filename in filenames:
            if filename.endswith(".ts") and filename not in EXCLUDE_FILES:
                path = Path(root) / filename
                try:
                    api_file = ApiFile(path)
                    if api_file.methods:  # Only process files with methods
                        files.append(api_file)
                except Exception as e:
                    print(f"Error processing {path}: {e}")

    return files


def group_by_domain(files: List[ApiFile]) -> Dict[str, List[ApiFile]]:
    """Group files by domain"""
    grouped = defaultdict(list)
    for file in files:
        grouped[file.domain].append(file)
    return grouped


def find_components_using_api() -> Set[str]:
    """Find all components/files importing from old API"""
    files_to_update = set()
    import_pattern = r"from\s+['\"]@/api"

    for root, dirs, filenames in os.walk("frontend/src"):
        # Skip node_modules and old api dir
        dirs[:] = [d for d in dirs if d not in ["node_modules", "api"]]

        for filename in filenames:
            if filename.endswith(".ts") or filename.endswith(".tsx"):
                path = Path(root) / filename
                try:
                    content = path.read_text()
                    if re.search(import_pattern, content):
                        files_to_update.add(str(path.relative_to(Path("frontend/src"))))
                except Exception:
                    pass

    return files_to_update


def generate_report(grouped: Dict[str, List[ApiFile]], files_to_update: Set[str]):
    """Generate migration report"""
    report = {
        "timestamp": str(Path(__file__).stat().st_mtime),
        "summary": {
            "total_api_files": sum(len(v) for v in grouped.values()),
            "domains": len(grouped),
            "files_to_update": len(files_to_update),
        },
        "domains": {},
        "files_to_update": sorted(list(files_to_update)),
    }

    for domain, files in sorted(grouped.items()):
        report["domains"][domain] = {
            "file_count": len(files),
            "files": [str(f.relative_path) for f in files],
            "total_methods": sum(len(f.methods) for f in files),
        }

    return report


def main():
    print("🔍 Scanning API files...")
    api_files = scan_api_files()
    grouped = group_by_domain(api_files)

    print(f"✅ Found {len(api_files)} API files across {len(grouped)} domains")
    print("\n📊 Domain breakdown:")
    for domain, files in sorted(grouped.items()):
        print(f"  {domain}: {len(files)} files, {sum(len(f.methods) for f in files)} methods")

    print("\n🔍 Finding components using old API...")
    files_to_update = find_components_using_api()
    print(f"✅ Found {len(files_to_update)} files to update")

    print("\n📝 Generating migration report...")
    report = generate_report(grouped, files_to_update)

    # Save report
    report_path = Path("API_MIGRATION_REPORT.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"✅ Report saved to {report_path}")

    # Print top files to update
    print("\n📋 Top files importing from old API (first 20):")
    for file in sorted(list(files_to_update))[:20]:
        print(f"  - {file}")

    print("\n🚀 Next steps:")
    print("1. Review API_MIGRATION_REPORT.json for detailed breakdown")
    print("2. For each domain, create/update frontend-api files")
    print("3. Create normalization functions for each domain")
    print("4. Update all imports in components")
    print("5. Run type-check and tests")


if __name__ == "__main__":
    main()
