#!/usr/bin/env python3
"""
Comprehensive API Migration Script
Converts 197 old API files to enterprise frontend API standard

Rules:
1. All functions return Promise<Result<T>>
2. No raw errors (domain errors only)
3. Data normalization via normalizers
4. Input validation via schemas
5. No React/UI dependencies
6. Pure functions, deterministic

Output: Creates new files in frontend/src/lib/frontend-api/
Migration Log: frontend/src/lib/frontend-api/MIGRATION.log
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple
from dataclasses import dataclass
from enum import Enum

class ErrorType(Enum):
    NOTFOUND = "NotFound"
    VALIDATION = "Validation"
    CONFLICT = "Conflict"
    UNAUTHORIZED = "Unauthorized"
    FORBIDDEN = "Forbidden"
    SERVER = "Server"
    NETWORK = "Network"

@dataclass
class ApiFunction:
    name: str
    params: List[str]
    returnType: str
    description: str
    isAsync: bool

class ApiMigrator:
    def __init__(self, root_path: str):
        self.root = Path(root_path)
        self.old_api_dir = self.root / "frontend/src/api"
        self.new_api_dir = self.root / "frontend/src/lib/frontend-api"
        self.norm_dir = self.root / "frontend/src/lib/normalization"
        self.log_file = self.new_api_dir / "MIGRATION.log"
        self.processed_files = []
        self.failed_files = []
        self.new_files_created = []

    def scan_old_apis(self) -> Dict[str, List[Path]]:
        """Scan old API directory and group by domain"""
        domains = {}

        for ts_file in self.old_api_dir.rglob("*.ts"):
            # Skip types and index files
            if ts_file.name in ["index.ts"] or "types" in str(ts_file):
                continue

            # Extract domain from path
            domain = self._extract_domain(ts_file)
            if domain not in domains:
                domains[domain] = []
            domains[domain].append(ts_file)

        return domains

    def _extract_domain(self, file_path: Path) -> str:
        """Extract domain from file path"""
        relative = file_path.relative_to(self.old_api_dir)
        parts = relative.parts

        # Remove -api suffix from filename
        filename = parts[-1].replace("-api.ts", "").replace(".service.ts", "")

        # Use directory as domain if file is in subdirectory
        if len(parts) > 1:
            return parts[0]

        return filename

    def analyze_function(self, content: str, func_name: str) -> ApiFunction:
        """Extract function signature from file content"""
        # This is a simple regex-based analysis
        # More sophisticated parsing would use AST

        pattern = rf"(?:async\s+)?{func_name}\s*\(\s*([^)]*)\s*\)\s*:\s*Promise<([^>]+)>|(?:async\s+)?{func_name}\s*\(\s*([^)]*)\s*\)\s*(?::\s*([^{{]+))?"
        match = re.search(pattern, content)

        if not match:
            return None

        params = match.group(1) or match.group(3) or ""
        return_type = match.group(2) or match.group(4) or "unknown"

        return ApiFunction(
            name=func_name,
            params=[p.strip() for p in params.split(",") if p.strip()],
            returnType=return_type.strip(),
            description="",
            isAsync=True
        )

    def generate_new_api_file(self, domain: str, old_files: List[Path]) -> str:
        """Generate new frontend API file for domain"""

        # Consolidate all functions from old files into one domain file
        functions = []
        imports = set()

        for old_file in old_files:
            try:
                with open(old_file, 'r') as f:
                    content = f.read()

                # Extract class/function names
                class_matches = re.findall(r"class\s+(\w+ApiService)", content)
                func_matches = re.findall(r"(?:async\s+)?(\w+)\s*\([^)]*\)\s*:\s*Promise<", content)

                for func in func_matches[:5]:  # Limit to first 5 functions per file
                    functions.append(func)

                # Extract import statements
                import_matches = re.findall(r"^import\s+.*?from\s+['\"].*?['\"];?$", content, re.MULTILINE)
                imports.update(import_matches)

            except Exception as e:
                self.failed_files.append((str(old_file), str(e)))

        # Generate new file
        file_content = self._generate_file_header(domain, old_files)
        file_content += self._generate_imports(domain, imports)
        file_content += self._generate_functions(domain, functions)

        return file_content

    def _generate_file_header(self, domain: str, old_files: List[Path]) -> str:
        """Generate file header with documentation"""

        file_count = len(old_files)
        old_files_list = "\n".join([f" * - {f.name}" for f in old_files[:5]])
        if file_count > 5:
            old_files_list += f"\n * ... and {file_count - 5} more files"

        return f'''/**
 * {domain.capitalize()} Frontend API
 * Enterprise-grade API layer per architectural standard
 *
 * @module lib/frontend-api/{domain}
 * @description Domain-level contract for {domain} operations
 *
 * Migrated from:
{old_files_list}
 *
 * ARCHITECTURE POSITION:
 * Backend API → Frontend API → Loaders/Actions → Context → Views
 *
 * KEY PRINCIPLES:
 * 1. Frontend APIs are domain contracts, not transport wrappers
 * 2. All APIs return Result<T>, never throw exceptions
 * 3. Domain errors, not HTTP codes
 * 4. Pure functions, no React/UI dependencies
 * 5. Validation at API boundary
 * 6. Centralized normalization
 *
 * RULES:
 * - No UI imports allowed
 * - No React imports allowed
 * - No context access allowed
 * - Typed inputs only
 * - Typed outputs only
 * - Errors are data, not exceptions
 * - Pure and deterministic
 */

'''

    def _generate_imports(self, domain: str, imports: set) -> str:
        """Generate standardized imports"""

        imports_str = """import {
  client,
  failure,
  success,
  ValidationError,
  NotFoundError,
  type Result,
} from './index';
"""

        # Add normalization imports if they exist
        normalizer_file = self.norm_dir / f"{domain}.ts"
        if normalizer_file.exists():
            imports_str += f"import {{ normalize{domain.capitalize()} }} from '../normalization/{domain}';\n"

        return imports_str + "\n"

    def _generate_functions(self, domain: str, functions: List[str]) -> str:
        """Generate stub functions for each API operation"""

        content = ""

        # Add common CRUD functions
        crud_functions = [
            ("getAll", "Fetch all items"),
            ("getById", "Fetch single item by ID"),
            ("create", "Create new item"),
            ("update", "Update existing item"),
            ("delete", "Delete item"),
        ]

        for func_name, description in crud_functions:
            if func_name in functions or domain == "":  # Always add CRUD stubs
                content += self._generate_function_stub(domain, func_name, description)

        return content

    def _generate_function_stub(self, domain: str, func_name: str, description: str) -> str:
        """Generate a single function stub"""

        # Map function names to signatures
        signatures = {
            "getAll": ("filters?: Record<string, any>", "unknown[]", "GET /..."),
            "getById": ("id: string", "unknown", "GET /.../id"),
            "create": ("input: unknown", "unknown", "POST /..."),
            "update": ("id: string, input: unknown", "unknown", "PATCH /.../id"),
            "delete": ("id: string", "void", "DELETE /.../id"),
        }

        if func_name not in signatures:
            return ""

        params, return_type, example = signatures[func_name]

        return f'''/**
 * {description}
 *
 * @param {params.split(',')[0]} - Input parameter
 * @returns {{Promise<Result<{return_type}>>}} Typed result
 *
 * @example
 * ```typescript
 * const result = await {domain}.{func_name}(...);
 * if (!result.ok) {{
 *   // Handle error
 *   return;
 * }}
 * // Use result.data
 * ```
 */
export async function {func_name}(
  {params}
): Promise<Result<{return_type}>> {{
  // TODO: Implement {func_name}
  // Example: {example}

  // if (!id) return failure(new ValidationError("ID is required"));
  // const result = await client.get(`/.../...`);
  // if (!result.ok) return result;
  // return success(normalize{domain.capitalize()}(result.data));

  return failure(new ValidationError("Not implemented"));
}}

'''

    def run_migration(self):
        """Execute full migration"""

        print("Starting API Migration...")
        print(f"Old API Directory: {self.old_api_dir}")
        print(f"New API Directory: {self.new_api_dir}")

        # Scan old APIs
        domains = self.scan_old_apis()
        print(f"\nFound {len(domains)} domains with {sum(len(f) for f in domains.values())} files")

        # Generate new API files
        for domain, files in sorted(domains.items()):
            try:
                print(f"\nProcessing domain: {domain} ({len(files)} files)")

                new_file_path = self.new_api_dir / f"{domain}.ts"
                new_content = self.generate_new_api_file(domain, files)

                # Check if file already exists (don't overwrite)
                if new_file_path.exists():
                    print(f"  → Skipping (already exists): {new_file_path.name}")
                    self.processed_files.append((domain, len(files), "SKIPPED"))
                else:
                    with open(new_file_path, 'w') as f:
                        f.write(new_content)
                    print(f"  → Created: {new_file_path.name}")
                    self.new_files_created.append(str(new_file_path))
                    self.processed_files.append((domain, len(files), "CREATED"))

            except Exception as e:
                print(f"  → ERROR: {e}")
                self.failed_files.append((domain, str(e)))

        # Write migration log
        self.write_log()

    def write_log(self):
        """Write migration report"""

        with open(self.log_file, 'w') as f:
            f.write("# API Migration Report\n\n")
            f.write(f"Date: {Path('/').stat().st_mtime}\n")
            f.write(f"Total Domains: {len(self.processed_files)}\n")
            f.write(f"Files Created: {len(self.new_files_created)}\n")
            f.write(f"Files Skipped: {len(self.processed_files) - len(self.new_files_created)}\n")
            f.write(f"Failed: {len(self.failed_files)}\n\n")

            f.write("## Successfully Processed\n\n")
            for domain, count, status in self.processed_files:
                f.write(f"- **{domain}**: {count} files → {status}\n")

            if self.failed_files:
                f.write("\n## Failed Migrations\n\n")
                for domain, error in self.failed_files:
                    f.write(f"- **{domain}**: {error}\n")

            f.write("\n## New Files Created\n\n")
            for file_path in self.new_files_created:
                f.write(f"- {file_path}\n")

            f.write("\n## Next Steps\n\n")
            f.write("1. Review generated files in `frontend/src/lib/frontend-api/`\n")
            f.write("2. Complete function implementations with proper types\n")
            f.write("3. Create corresponding normalizers in `frontend/src/lib/normalization/`\n")
            f.write("4. Update imports across components to use new API layer\n")
            f.write("5. Validate with TypeScript compiler\n")

def main():
    root_path = "/workspaces/lexiflow-premium"
    migrator = ApiMigrator(root_path)
    migrator.run_migration()

    print("\n" + "="*60)
    print("Migration Complete!")
    print(f"Log: {migrator.log_file}")
    print("="*60)

if __name__ == "__main__":
    main()
