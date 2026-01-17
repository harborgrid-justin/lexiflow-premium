#!/usr/bin/env python3
"""
Enterprise Frontend API Code Generator
Generates new frontend-api files from old API structure

Handles:
1. Method extraction and conversion to functional async pattern
2. Result<T> wrapper generation
3. Error mapping
4. Normalization function stubs
5. Export aggregation
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Tuple, Set, Optional
from dataclasses import dataclass
from abc import ABC, abstractmethod


@dataclass
class MethodSignature:
    """Extracted method information"""

    name: str
    params: List[Tuple[str, str]]  # (param_name, type)
    return_type: str
    is_async: bool
    doc: Optional[str] = None


class ApiExtractor:
    """Extracts method signatures from old API files"""

    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.content = file_path.read_text() if file_path.exists() else ""
        self.methods: List[MethodSignature] = []
        self.extract()

    def extract(self):
        """Extract all public methods"""
        # Match async methods in classes
        class_method_pattern = r"async\s+(\w+)\s*\(([^)]*)\)\s*:\s*Promise<([^>]+)>"

        for match in re.finditer(class_method_pattern, self.content):
            method_name, params_str, return_type = match.groups()

            # Skip private methods
            if method_name.startswith("_"):
                continue

            # Parse parameters
            params = self._parse_params(params_str)

            self.methods.append(
                MethodSignature(
                    name=method_name,
                    params=params,
                    return_type=return_type.strip(),
                    is_async=True,
                )
            )

    def _parse_params(self, params_str: str) -> List[Tuple[str, str]]:
        """Parse parameter string into (name, type) tuples"""
        if not params_str.strip():
            return []

        params = []
        # Simple parser for common patterns
        for param in params_str.split(","):
            param = param.strip()
            if ":" in param:
                name, type_part = param.split(":", 1)
                params.append((name.strip(), type_part.strip()))
            else:
                params.append((param, "unknown"))

        return params

    def get_methods(self) -> List[MethodSignature]:
        """Return extracted methods"""
        return self.methods


class CodeGenerator:
    """Generates new frontend-api code"""

    TEMPLATE_IMPORT = '''import {{
  normalizeData,
}} from "../normalization/{domain}";
import {{
  client,
  failure,
  type Result,
  success,
  ValidationError,
}} from "./index";
'''

    TEMPLATE_FUNCTION = '''
export async function {method_name}({params}): Promise<Result<{return_type}>> {{
  // TODO: Implement {method_name}
  // See {file_ref} for old implementation

  const result = await client.get<{return_type}>("/api/{domain}/{method_name}");

  if (!result.ok) return result;

  return success(result.data);
}}
'''

    @staticmethod
    def generate_frontend_api_file(
        domain: str, methods: List[MethodSignature]
    ) -> str:
        """Generate a complete frontend-api domain file"""

        imports = CodeGenerator.TEMPLATE_IMPORT.format(domain=domain)

        functions = []
        for method in methods:
            # Format parameters
            params_str = ", ".join(f"{name}: {type_}" for name, type_ in method.params)
            if not params_str:
                params_str = ""

            # Generate function
            func = f'''export async function {method.name}({params_str}): Promise<Result<{method.return_type}>> {{
  // TODO: Implement {method.name}
  return failure(new ValidationError('{method.name} not yet implemented'));
}}
'''
            functions.append(func)

        # Generate export object
        method_names = [m.name for m in methods]
        export_obj = f"\nexport const {domain}Api = {{\n"
        export_obj += ",\n".join(f"  {name}" for name in method_names)
        export_obj += "\n};\n"

        content = imports + "\n" + "\n".join(functions) + export_obj

        return content


class FileMigrator:
    """Orchestrates migration of API files"""

    def __init__(self, old_api_dir: Path, new_api_dir: Path):
        self.old_api_dir = old_api_dir
        self.new_api_dir = new_api_dir

    def get_domains_needing_migration(self) -> Dict[str, List[Path]]:
        """Identify which domains need new frontend-api files"""
        domain_files = {}

        for root, dirs, files in os.walk(self.old_api_dir):
            dirs[:] = [d for d in dirs if d != "types"]

            for file in files:
                if file.endswith(".ts") and file not in ["index.ts"]:
                    path = Path(root) / file
                    domain = self._extract_domain(path)

                    if domain not in domain_files:
                        domain_files[domain] = []
                    domain_files[domain].append(path)

        return domain_files

    def _extract_domain(self, path: Path) -> str:
        """Extract domain from file path"""
        parts = path.relative_to(self.old_api_dir).parts
        return parts[0] if parts else "misc"

    def generate_migration_plan(self) -> Dict:
        """Generate detailed migration plan"""
        domains = self.get_domains_needing_migration()

        plan = {
            "total_domains": len(domains),
            "total_files": sum(len(v) for v in domains.values()),
            "domains": {},
        }

        for domain, files in sorted(domains.items()):
            existing_file = self.new_api_dir / f"{domain}.ts"
            plan["domains"][domain] = {
                "file_count": len(files),
                "old_files": [str(f.relative_to(self.old_api_dir)) for f in files],
                "new_file": f"{domain}.ts",
                "needs_creation": not existing_file.exists(),
                "existing_methods_count": self._count_existing_methods(domain),
            }

        return plan

    def _count_existing_methods(self, domain: str) -> int:
        """Count existing methods in new frontend-api file"""
        new_file = self.new_api_dir / f"{domain}.ts"
        if not new_file.exists():
            return 0

        content = new_file.read_text()
        return len(re.findall(r"export async function", content))


def main():
    old_api_dir = Path("frontend/src/api")
    new_api_dir = Path("frontend/src/lib/frontend-api")

    migrator = FileMigrator(old_api_dir, new_api_dir)

    print("📊 Generating migration plan...")
    plan = migrator.generate_migration_plan()

    print(f"\n✅ Total domains: {plan['total_domains']}")
    print(f"✅ Total old API files: {plan['total_files']}\n")

    # Print domains needing creation
    needs_creation = [
        d for d, info in plan["domains"].items() if info["needs_creation"]
    ]
    if needs_creation:
        print(f"🚀 Domains needing new frontend-api files ({len(needs_creation)}):")
        for domain in sorted(needs_creation):
            count = plan["domains"][domain]["file_count"]
            print(f"  - {domain}: {count} old API files")

    # Print domains needing updates
    needs_update = [
        d for d, info in plan["domains"].items() if not info["needs_creation"]
    ]
    if needs_update:
        print(
            f"\n📝 Domains needing updates ({len(needs_update)}):"
        )
        for domain in sorted(needs_update):
            existing = plan["domains"][domain]["existing_methods_count"]
            total_files = plan["domains"][domain]["file_count"]
            print(f"  - {domain}: {existing} existing methods, {total_files} old files")

    # Save plan
    plan_path = Path("API_MIGRATION_PLAN.json")
    with open(plan_path, "w") as f:
        json.dump(plan, f, indent=2)
    print(f"\n📄 Migration plan saved to {plan_path}")

    print("\n📋 Next steps:")
    print("1. Review API_MIGRATION_PLAN.json for detailed breakdown")
    print("2. Generate new frontend-api files using code generator")
    print("3. Update imports across codebase")
    print("4. Run type checks and tests")


if __name__ == "__main__":
    main()
