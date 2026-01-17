import os
import re

FRONTEND_PATH = "frontend/src"

MAPPING = {
    # Auth
    "useAuth": "@/hooks/useAuth",
    "AuthProvider": "@/providers/application/AuthProvider",
    "useAuthActions": "@/hooks/useAuth",
    "useAuthState": "@/hooks/useAuth",
    "AuthUser": "@/lib/auth/types",
    "AuthEvent": "@/lib/auth/types",
    "SessionInfo": "@/lib/auth/types",
    "PasswordPolicy": "@/lib/auth/types",
    "Organization": "@/types", # Assuming basic type

    # Entitlements
    "EntitlementsProvider": "@/lib/entitlements/context",
    "useEntitlements": "@/lib/entitlements/context",
    "useEntitlementsActions": "@/lib/entitlements/context",
    "useEntitlementsState": "@/lib/entitlements/context",
    "Entitlements": "@/lib/entitlements/context",
    "Plan": "@/lib/entitlements/context",
    "EntitlementsContextValue": "@/lib/entitlements/context",

    # Flags
    "FlagsProvider": "@/lib/flags/context",
    "useFlags": "@/lib/flags/context",
    "useFlagsActions": "@/lib/flags/context",
    "useFlagsState": "@/lib/flags/context",
    "Flags": "@/lib/flags/context",
    "FlagsContextValue": "@/lib/flags/context",

    # Toast
    "ToastProvider": "@/providers/infrastructure/ToastProvider",
    "useToast": "@/hooks/useToast",
    "ToastType": "@/lib/toast/context",
    "Toast": "@/lib/toast/context",

    # Theme
    "ThemeProvider": "@/providers/infrastructure/ThemeProvider",
    "useTheme": "@/hooks/useTheme",
    "useThemeContext": "@/hooks/useTheme", # Prefer explicit hook
    "ThemeContext": "@/providers/infrastructure/ThemeProvider",
    "ThemeMode": "@/lib/theme/tokens",
    "ThemeDensity": "@/lib/theme/tokens",
    "DesignTokens": "@/lib/theme/tokens",
    "FontMode": "@/lib/theme/tokens",
    "ThemeObject": "@/lib/theme/ThemeContext.types",
    "DEFAULT_TOKENS": "@/lib/theme/tokens",
    "getTokens": "@/lib/theme/tokens",
    "tokens": "@/lib/theme/tokens", # Legacy aliasing
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # Regex to find imports from @/contexts or @/theme or @/contexts/...
    # Captures: 1=imports inside {}, 2=module path
    # We need to handle multi-line imports
    pattern = re.compile(r'import\s+\{([^}]+)\}\s+from\s+[\'"](@/contexts.*?|@/theme.*?)[\'"];', re.DOTALL)

    matches = pattern.findall(content)
    if not matches:
        return False

    new_imports_block = []

    # We will replace the Matches with NOTHING, and instead Prepend the new imports?
    # Or replace the first match with all new imports and remove others?
    # Better: Replace each match with its resolved new imports. But this might duplicate imports if multiple old lines map to same new file.
    # So we should collect all replacements, and consolidate ONLY if they are adjacent.
    # But for safety, I will replace each occurrence with its specific needed imports. TypeScript usually compiles duplicate imports fine or we can run ESLint fix later.

    def replacement_function(match):
        imports_str = match.group(1)
        source_module = match.group(2)

        # Parse imports like "useAuth, AuthProvider, \n  useTheme"
        # Handles "useAuth as UA"
        files_to_imports = {} # "path": ["useAuth", "AuthProvider"]

        raw_imports = [x.strip() for x in imports_str.replace('\n', '').split(',')]
        raw_imports = [x for x in raw_imports if x]

        for imp in raw_imports:
            parts = imp.split(' as ')
            symbol = parts[0].strip()
            alias = parts[1].strip() if len(parts) > 1 else None

            target_path = MAPPING.get(symbol)

            # Fallback logic for @/theme/tokens specifics
            if not target_path:
                if "theme/tokens" in source_module:
                    target_path = "@/lib/theme/tokens"
                elif "theme" in source_module:
                     target_path = "@/lib/theme/tokens" # Guess
                else:
                    print(f"⚠️  Unknown symbol {symbol} from {source_module} in {filepath}")
                    target_path =  "@/unknown_fix_me/" + symbol

            if target_path not in files_to_imports:
                files_to_imports[target_path] = []

            if alias:
                files_to_imports[target_path].append(f"{symbol} as {alias}")
            else:
                files_to_imports[target_path].append(symbol)

        # Generate replacement string
        lines = []
        for path, symbols in files_to_imports.items():
            symbols_str = ", ".join(sorted(symbols))
            lines.append(f'import {{ {symbols_str} }} from "{path}";')

        return "\n".join(lines)

    content = pattern.sub(replacement_function, content)

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

count = 0
for root, dirs, files in os.walk(FRONTEND_PATH):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            if process_file(os.path.join(root, file)):
                print(f"Updated {file}")
                count += 1
print(f"Total files updated: {count}")
