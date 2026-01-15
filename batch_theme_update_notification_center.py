#!/usr/bin/env python3
"""
Batch Theme Update - NotificationCenter Enterprise Component
Applies theme tokens to remaining 64 color classes
"""

import re

FILE_PATH = '/workspaces/lexiflow-premium/frontend/src/components/common/notifications/enterprise/NotificationCenter.tsx'

# Read file
with open(FILE_PATH, 'r') as f:
    content = f.read()

# Replacement patterns
replacements = [
    # Header container
    (r'className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6"',
     'style={{ backgroundColor: theme.surface.base, borderBottom: `1px solid ${theme.border.default}`, padding: tokens.spacing.normal[\'2xl\'] }}'),

    # Header title
    (r'className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3"',
     'style={{ fontSize: tokens.typography.fontSize[\'2xl\'], fontWeight: tokens.typography.fontWeight.bold, color: theme.text.primary, display: \'flex\', alignItems: \'center\', gap: tokens.spacing.normal.md }}'),

    # Header description
    (r'className="text-sm text-slate-600 dark:text-slate-400 mt-1"',
     'style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary, marginTop: tokens.spacing.compact.xs }}'),

    # Preferences button
    (r'className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"',
     'style={{ padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.lg}`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: theme.text.secondary, backgroundColor: theme.surface.elevated, borderRadius: tokens.borderRadius.lg }} className="transition-colors focus:outline-none focus:ring-2" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.surface.elevated}'),

    # Mark all read button
    (r'className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"',
     'style={{ padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.lg}`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: theme.surface.base, backgroundColor: theme.primary.DEFAULT, borderRadius: tokens.borderRadius.lg }} className="transition-opacity focus:outline-none focus:ring-2" onMouseEnter={(e) => e.currentTarget.style.opacity = \'0.9\'} onMouseLeave={(e) => e.currentTarget.style.opacity = \'1\'}'),

    # Search input container
    (r'className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"',
     'style={{ width: \'100%\', paddingLeft: \'2.5rem\', paddingRight: tokens.spacing.normal.lg, paddingTop: tokens.spacing.compact.sm, paddingBottom: tokens.spacing.compact.sm, backgroundColor: theme.surface.elevated, border: \'0\', borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.sm, color: theme.text.primary }} className="focus:outline-none focus:ring-2" placeholder={searchQuery || "Search notifications..."}'),

    # Search close button
    (r'className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"',
     'style={{ position: \'absolute\', right: \'0.75rem\', top: \'50%\', transform: \'translateY(-50%)\', color: theme.text.muted }} className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = theme.text.secondary} onMouseLeave={(e) => e.currentTarget.style.color = theme.text.muted}'),

    # Filter tabs container
    (r'className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 overflow-x-auto"',
     'style={{ backgroundColor: theme.surface.base, borderBottom: `1px solid ${theme.border.default}`, paddingLeft: tokens.spacing.normal[\'2xl\'], paddingRight: tokens.spacing.normal[\'2xl\'], overflowX: \'auto\' }}'),
]

# Apply replacements
for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

# Write back
with open(FILE_PATH, 'w') as f:
    f.write(content)

print(f"✅ Applied {len(replacements)} theme token replacements to NotificationCenter.tsx")
print("Note: Manual review recommended for complex conditional styling")
