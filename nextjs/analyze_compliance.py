#!/usr/bin/env python3
"""
Next.js 16 Enterprise Compliance Gap Analysis
Analyzes all page.tsx files for compliance issues
"""

import os
import re
from pathlib import Path
from collections import defaultdict
import json

def analyze_file(page_path):
    """Analyze a single page.tsx file for compliance issues"""
    issues = []

    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()

    dirname = os.path.dirname(page_path)
    is_dynamic = '[' in page_path and ']' in page_path

    # 1. Check metadata
    has_metadata = 'export const metadata' in content
    has_generateMetadata = 'generateMetadata' in content
    if not has_metadata and not has_generateMetadata:
        issues.append({
            'category': 'Metadata API',
            'severity': 'CRITICAL',
            'issue': 'Missing metadata export or generateMetadata function',
            'details': 'All pages should export metadata for SEO'
        })
    elif has_metadata:
        # Check if metadata has proper fields
        if 'title:' not in content or 'description:' not in content:
            issues.append({
                'category': 'Metadata API',
                'severity': 'HIGH',
                'issue': 'Incomplete metadata',
                'details': 'Metadata should include title and description'
            })

    # 2. Check for unnecessary "use client"
    if '"use client"' in content or "'use client'" in content:
        # Check if it really needs to be client
        needs_client = any(hook in content for hook in ['useState', 'useEffect', 'useContext', 'useReducer', 'onClick', 'onChange'])
        if not needs_client:
            issues.append({
                'category': 'Server vs Client',
                'severity': 'MEDIUM',
                'issue': 'Unnecessary "use client" directive',
                'details': 'Page uses "use client" but has no client-side hooks or event handlers'
            })

    # 3. Check error.tsx
    if not os.path.exists(os.path.join(dirname, 'error.tsx')):
        issues.append({
            'category': 'Error Boundaries',
            'severity': 'HIGH',
            'issue': 'Missing error.tsx',
            'details': f'No error boundary at {dirname}'
        })

    # 4. Check loading.tsx
    if not os.path.exists(os.path.join(dirname, 'loading.tsx')):
        issues.append({
            'category': 'Loading States',
            'severity': 'MEDIUM',
            'issue': 'Missing loading.tsx',
            'details': f'No loading state at {dirname}'
        })

    # 5. Dynamic route checks
    if is_dynamic:
        if 'generateStaticParams' not in content:
            issues.append({
                'category': 'Dynamic Routes',
                'severity': 'HIGH',
                'issue': 'Missing generateStaticParams',
                'details': 'Dynamic routes should export generateStaticParams for SSG'
            })

        # Check params typing
        if 'params: Promise<{' not in content and 'params: Promise<' not in content:
            issues.append({
                'category': 'TypeScript',
                'severity': 'HIGH',
                'issue': 'Incorrect params typing',
                'details': 'In Next.js 15+, params should be Promise<{ id: string }>'
            })

    # 6. TypeScript compliance
    if not any(x in content for x in ['PageProps', 'Props', 'interface']):
        issues.append({
            'category': 'TypeScript',
            'severity': 'MEDIUM',
            'issue': 'Missing TypeScript interfaces',
            'details': 'No Props types defined'
        })

    # 7. Data fetching anti-patterns
    if 'useEffect' in content and '"use client"' in content:
        if 'fetch' in content or 'apiFetch' in content:
            issues.append({
                'category': 'Data Fetching',
                'severity': 'HIGH',
                'issue': 'Using useEffect for data fetching',
                'details': 'Should use server-side data fetching instead'
            })

    # 8. Check for async server component
    if 'export default async function' not in content and '"use client"' not in content:
        if 'apiFetch' in content or 'await' in content:
            issues.append({
                'category': 'Data Fetching',
                'severity': 'MEDIUM',
                'issue': 'Server component not marked as async',
                'details': 'Server components with data fetching should be async'
            })

    # 9. Suspense boundaries
    if 'export default async function' in content and 'Suspense' not in content:
        issues.append({
            'category': 'Performance',
            'severity': 'LOW',
            'issue': 'Missing Suspense boundary',
            'details': 'Async components should use Suspense for streaming'
        })

    # 10. Check for cache/revalidate options
    if 'apiFetch' in content or 'fetch' in content:
        if 'revalidate' not in content and 'cache' not in content:
            issues.append({
                'category': 'Performance',
                'severity': 'LOW',
                'issue': 'No caching strategy',
                'details': 'Data fetching should specify cache or revalidate options'
            })

    return issues

def main():
    # Find all page.tsx files
    pages = []
    for root, dirs, files in os.walk('src/app'):
        for file in files:
            if file == 'page.tsx':
                pages.append(os.path.join(root, file))

    pages.sort()

    print(f"# Next.js 16 Enterprise Compliance Gap Analysis")
    print(f"\n**Analysis Date:** {os.popen('date').read().strip()}")
    print(f"**Total Pages Analyzed:** {len(pages)}")
    print(f"\n---\n")

    # Collect all issues
    all_issues = []
    issue_counts = defaultdict(int)
    severity_counts = {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0}

    for page_path in pages:
        issues = analyze_file(page_path)
        if issues:
            all_issues.append({
                'file': page_path,
                'issues': issues
            })
            for issue in issues:
                issue_counts[issue['category']] += 1
                severity_counts[issue['severity']] += 1

    # Print Executive Summary
    print("## Executive Summary\n")
    print(f"- **Total Issues Found:** {sum(severity_counts.values())}")
    print(f"- **Critical Issues:** {severity_counts['CRITICAL']}")
    print(f"- **High Priority:** {severity_counts['HIGH']}")
    print(f"- **Medium Priority:** {severity_counts['MEDIUM']}")
    print(f"- **Low Priority:** {severity_counts['LOW']}")
    print(f"- **Pages with Issues:** {len(all_issues)} out of {len(pages)} ({len(all_issues)/len(pages)*100:.1f}%)")
    print(f"\n### Issues by Category:\n")
    for category, count in sorted(issue_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"- **{category}:** {count} issues")

    print(f"\n---\n")

    # Detailed breakdown by file
    print("## Detailed Analysis by File\n")

    for idx, item in enumerate(all_issues, 1):
        file_path = item['file']
        issues = item['issues']

        print(f"### {idx}. {file_path}\n")
        print(f"**Total Issues:** {len(issues)}\n")

        # Group by severity
        critical = [i for i in issues if i['severity'] == 'CRITICAL']
        high = [i for i in issues if i['severity'] == 'HIGH']
        medium = [i for i in issues if i['severity'] == 'MEDIUM']
        low = [i for i in issues if i['severity'] == 'LOW']

        if critical:
            print("#### 🔴 CRITICAL Issues:\n")
            for issue in critical:
                print(f"- **{issue['category']}:** {issue['issue']}")
                print(f"  - {issue['details']}\n")

        if high:
            print("#### 🟠 HIGH Priority:\n")
            for issue in high:
                print(f"- **{issue['category']}:** {issue['issue']}")
                print(f"  - {issue['details']}\n")

        if medium:
            print("#### 🟡 MEDIUM Priority:\n")
            for issue in medium:
                print(f"- **{issue['category']}:** {issue['issue']}")
                print(f"  - {issue['details']}\n")

        if low:
            print("#### 🔵 LOW Priority:\n")
            for issue in low:
                print(f"- **{issue['category']}:** {issue['issue']}")
                print(f"  - {issue['details']}\n")

        print("---\n")

    # Files with no issues
    clean_files = [p for p in pages if not any(item['file'] == p for item in all_issues)]
    if clean_files:
        print(f"## ✅ Compliant Files ({len(clean_files)} files)\n")
        print("These files have no compliance issues:\n")
        for file in clean_files[:20]:  # Show first 20
            print(f"- {file}")
        if len(clean_files) > 20:
            print(f"\n... and {len(clean_files) - 20} more")

    print(f"\n---\n")
    print(f"\n## Summary Statistics\n")
    print(f"```")
    print(f"Total Pages: {len(pages)}")
    print(f"Pages with Issues: {len(all_issues)}")
    print(f"Compliant Pages: {len(clean_files)}")
    print(f"Compliance Rate: {len(clean_files)/len(pages)*100:.1f}%")
    print(f"\nIssue Distribution:")
    print(f"  Critical: {severity_counts['CRITICAL']}")
    print(f"  High:     {severity_counts['HIGH']}")
    print(f"  Medium:   {severity_counts['MEDIUM']}")
    print(f"  Low:      {severity_counts['LOW']}")
    print(f"  Total:    {sum(severity_counts.values())}")
    print(f"```")

if __name__ == '__main__':
    main()
