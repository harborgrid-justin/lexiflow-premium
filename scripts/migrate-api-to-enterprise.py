#!/usr/bin/env python3
"""
Enterprise Frontend API Migration Script
Converts legacy API services to enterprise-grade frontend API pattern

Requirements from spec:
- Result<T> return type (no exceptions)
- Domain errors (not HTTP codes)
- No React/UI imports
- Pure functions
- Input validation
- Data normalization
- Stable contracts
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Set
from dataclasses import dataclass

@dataclass
class ApiMethod:
    """Represents an API method to migrate"""
    name: str
    params: List[str]
    return_type: str
    endpoint: str
    http_method: str
    body: str

@dataclass
class DomainApi:
    """Represents a domain API module"""
    domain: str
    file_path: Path
    methods: List[ApiMethod]
    types: List[str]

class EnterpriseMigrator:
    """Migrates API services to enterprise pattern"""

    def __init__(self, api_dir: str, target_dir: str, normalization_dir: str):
        self.api_dir = Path(api_dir)
        self.target_dir = Path(target_dir)
        self.normalization_dir = Path(normalization_dir)
        self.domains_processed = set()

    def scan_api_files(self) -> List[Path]:
        """Find all API service files"""
        files = []
        for pattern in ['*-api.ts', '*.api.ts']:
            files.extend(self.api_dir.rglob(pattern))
        return files

    def extract_domain_from_path(self, file_path: Path) -> str:
        """Extract domain name from file path"""
        # Get relative path from api directory
        rel_path = file_path.relative_to(self.api_dir)
        parts = rel_path.parts

        # First part is usually the domain
        if len(parts) > 1:
            return parts[0]

        # Or extract from filename
        name = file_path.stem
        name = name.replace('-api', '').replace('.api', '')
        return name

    def extract_methods_from_class(self, content: str) -> List[ApiMethod]:
        """Extract methods from class-based API service"""
        methods = []

        # Find all async methods
        method_pattern = r'async\s+(\w+)\s*\(([^)]*)\)\s*:\s*Promise<([^>]+)>\s*\{([^}]+(?:\{[^}]*\})*[^}]*)\}'

        for match in re.finditer(method_pattern, content, re.MULTILINE | re.DOTALL):
            method_name, params, return_type, body = match.groups()

            # Skip private methods
            if method_name.startswith('_') or 'private' in body[:50]:
                continue

            # Extract endpoint from body
            endpoint = self._extract_endpoint(body)
            http_method = self._extract_http_method(body)

            methods.append(ApiMethod(
                name=method_name,
                params=self._parse_params(params),
                return_type=return_type,
                endpoint=endpoint,
                http_method=http_method,
                body=body.strip()
            ))

        return methods

    def _extract_endpoint(self, body: str) -> str:
        """Extract API endpoint from method body"""
        # Look for apiClient.get/post/put/delete calls
        match = re.search(r'apiClient\.\w+[(<]\s*[\'"`]([^\'"`]+)[\'"`]', body)
        if match:
            return match.group(1)
        return ''

    def _extract_http_method(self, body: str) -> str:
        """Extract HTTP method (get/post/put/delete)"""
        match = re.search(r'apiClient\.(get|post|put|patch|delete)', body)
        if match:
            return match.group(1).upper()
        return 'GET'

    def _parse_params(self, params_str: str) -> List[str]:
        """Parse parameter string into list"""
        if not params_str.strip():
            return []
        return [p.strip() for p in params_str.split(',')]

    def generate_enterprise_api(self, domain: str, methods: List[ApiMethod]) -> str:
        """Generate enterprise-grade API module"""

        template = f'''/**
 * {domain.title()} Frontend API
 * Domain-level contract for {domain} operations
 *
 * @module lib/frontend-api/{domain}
 * @description Enterprise frontend API following architectural standard:
 * - Stable contract between UI and backend
 * - Returns Result<T>, never throws
 * - Domain errors only
 * - Input validation
 * - Data normalization
 * - No React/UI dependencies
 * - Pure and deterministic
 *
 * RESPONSIBILITIES:
 * ✓ Transport (via client)
 * ✓ Validation (via schemas)
 * ✓ Error typing (domain errors)
 * ✓ Normalization (UI-ready shapes)
 * ✓ Caching semantics (explicit)
 * ✓ Version adaptation (backend drift)
 * ✓ Retry / backoff (in client)
 *
 * FORBIDDEN:
 * ✗ React imports
 * ✗ Context access
 * ✗ UI state mutation
 * ✗ Optimistic updates
 * ✗ Throwing exceptions
 *
 * @example Loader usage
 * ```typescript
 * export async function {domain}Loader() {{
 *   const result = await {domain}.getAll();
 *   if (!result.ok) throw result.error.toResponse();
 *   return result.data;
 * }}
 * ```
 */

import {{ client, success, failure, type Result, type PaginatedResult }} from './index';
import {{ validate, validators }} from './schemas';
import {{ NotFoundError, ValidationError, BusinessLogicError }} from './errors';
// Import normalizers when available
// import {{ normalize{domain.title()} }} from '../normalization/{domain}';

'''

        # Generate methods
        for method in methods:
            template += self._generate_method(domain, method)

        return template

    def _generate_method(self, domain: str, method: ApiMethod) -> str:
        """Generate enterprise method implementation"""

        # Parse parameters
        params_def = ', '.join(method.params) if method.params else ''

        # Determine if it returns paginated or single result
        is_paginated = 'Paginated' in method.return_type or '[]' in method.return_type

        method_template = f'''
/**
 * {method.name}
 * Endpoint: {method.http_method} {method.endpoint}
 */
export async function {method.name}({params_def}): Promise<Result<{method.return_type}>> {{
  // TODO: Add input validation
  // const validation = validate(params, schema);
  // if (!validation.ok) return validation;

  const result = await client.{method.http_method.lower()}<{method.return_type}>(
    `{method.endpoint}`
  );

  if (!result.ok) {{
    return result; // Propagate error
  }}

  // TODO: Add normalization
  // return success(normalize{domain.title()}(result.data));

  return success(result.data);
}}
'''
        return method_template

    def generate_normalizer_stub(self, domain: str) -> str:
        """Generate normalizer stub if it doesn't exist"""

        template = f'''/**
 * {domain.title()} Domain Normalizers
 * Transform backend {domain} data to frontend format
 *
 * @module lib/normalization/{domain}
 * @description {domain.title()}-specific normalizers following enterprise patterns:
 * - Backend snake_case → Frontend camelCase
 * - String dates → Date objects
 * - Backend enums → Frontend enums
 * - Nested relations flattened when appropriate
 */

import {{
  normalizeArray,
  normalizeDate,
  normalizeEnum,
  normalizeId,
  normalizeString,
  type Normalizer,
}} from './index';

/**
 * Backend {domain} structure (as received from API)
 */
interface Backend{domain.title()} {{
  id: string | number;
  created_at?: string;
  updated_at?: string;
  // TODO: Add backend fields
}}

/**
 * Normalize single {domain} from backend format
 */
export function normalize{domain.title()}(backend: Backend{domain.title()}): unknown {{
  return {{
    id: normalizeId(backend.id),
    createdAt: normalizeDate(backend.created_at),
    updatedAt: normalizeDate(backend.updated_at),
    // TODO: Add field normalizations
  }};
}}

/**
 * Normalize array of {domain} items
 */
export function normalize{domain.title()}s(items: Backend{domain.title()}[]): unknown[] {{
  return normalizeArray(items, normalize{domain.title()});
}}

/**
 * Denormalize {domain} for backend submission
 */
export function denormalize{domain.title()}(frontend: unknown): Backend{domain.title()} {{
  // TODO: Implement denormalization
  return frontend as Backend{domain.title()};
}}
'''
        return template

    def migrate_domain(self, file_path: Path) -> None:
        """Migrate a single domain API file"""
        print(f"Processing: {file_path}")

        # Read file content
        with open(file_path, 'r') as f:
            content = f.read()

        # Extract domain
        domain = self.extract_domain_from_path(file_path)

        if domain in self.domains_processed:
            print(f"  Skipping {domain} (already processed)")
            return

        # Extract methods
        methods = self.extract_methods_from_class(content)

        if not methods:
            print(f"  No methods found in {file_path}")
            return

        print(f"  Domain: {domain}")
        print(f"  Methods: {len(methods)}")

        # Generate enterprise API
        enterprise_api = self.generate_enterprise_api(domain, methods)

        # Write to target directory
        target_file = self.target_dir / f"{domain}.ts"
        with open(target_file, 'w') as f:
            f.write(enterprise_api)

        print(f"  ✓ Generated: {target_file}")

        # Generate normalizer if needed
        normalizer_file = self.normalization_dir / f"{domain}.ts"
        if not normalizer_file.exists():
            normalizer_stub = self.generate_normalizer_stub(domain)
            with open(normalizer_file, 'w') as f:
                f.write(normalizer_stub)
            print(f"  ✓ Generated normalizer: {normalizer_file}")

        self.domains_processed.add(domain)

    def run(self) -> None:
        """Run the migration"""
        print("Enterprise Frontend API Migration")
        print("=" * 60)

        # Ensure target directories exist
        self.target_dir.mkdir(parents=True, exist_ok=True)
        self.normalization_dir.mkdir(parents=True, exist_ok=True)

        # Scan for API files
        api_files = self.scan_api_files()
        print(f"\nFound {len(api_files)} API files")

        # Migrate each file
        for file_path in sorted(api_files):
            try:
                self.migrate_domain(file_path)
            except Exception as e:
                print(f"  ✗ Error: {e}")

        print(f"\n{'=' * 60}")
        print(f"Migration complete!")
        print(f"Processed {len(self.domains_processed)} domains")
        print(f"\nNext steps:")
        print(f"1. Review generated files in {self.target_dir}")
        print(f"2. Complete TODO items (validation, normalization)")
        print(f"3. Update imports in components/loaders")
        print(f"4. Run tests")
        print(f"5. Remove old api/ directory once migration verified")


def main():
    """Main entry point"""
    workspace = Path("/workspaces/lexiflow-premium/frontend/src")

    migrator = EnterpriseMigrator(
        api_dir=str(workspace / "api"),
        target_dir=str(workspace / "lib" / "frontend-api"),
        normalization_dir=str(workspace / "lib" / "normalization")
    )

    migrator.run()


if __name__ == "__main__":
    main()
