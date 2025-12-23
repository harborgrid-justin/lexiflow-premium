# ESLint Debugging Guide for LexiFlow Monorepo

## Problem
Getting error: "No tsconfigRootDir was set, and multiple candidate TSConfigRootDirs are present"

This happens in monorepo setups where VS Code's ESLint extension finds multiple `tsconfig.json` files.

---

## Solution Applied

### 1. Root-level ESLint Config (`eslint.config.js`)
Created a minimal root config that:
- Ignores workspace directories (`frontend/`, `backend/`, `packages/`)
- Delegates linting to workspace-specific configs
- Only lints root-level `.js` files

### 2. Workspace-specific Configs
Both `frontend/eslint.config.js` and `backend/eslint.config.js` now:
- Explicitly set `tsconfigRootDir` using `__dirname` (more reliable than `import.meta.dirname`)
- Include debugging options that activate when `ESLINT_DEBUG` environment variable is set
- Use proper paths relative to their own directories

### 3. VS Code Settings (`.vscode/settings.json`)
Added enterprise-grade debugging configuration:
- `eslint.debug: true` - Enables debug mode
- `eslint.trace.server: "verbose"` - Shows detailed communication logs
- `eslint.workingDirectories` - Explicitly tells ESLint to treat each workspace separately
- `eslint.output.console: "verbose"` - Shows all output in console

---

## Debugging Steps

### Step 1: Check ESLint Output Panel
1. Open VS Code Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Run: `ESLint: Show Output Channel`
3. Look for lines showing:
   - `[Info] ESLint server is starting`
   - `Config loaded from: ...`
   - `tsconfigRootDir set to: ...`

### Step 2: Verify Working Directories
Check that ESLint is running with correct working directories:
```
[Info] Using working directory: F:\temp\lexiflow-premium\frontend
[Info] Using working directory: F:\temp\lexiflow-premium\backend
```

### Step 3: Enable Console Debugging
Uncomment the `console.log` statements in:
- `frontend/eslint.config.js` (lines 10-12)
- `backend/eslint.config.js` (lines 10-12)

Restart ESLint Server (Command Palette → `ESLint: Restart ESLint Server`)

### Step 4: Check TypeScript Project Service
If errors persist, verify TypeScript can find the correct tsconfig:
1. Open any `.ts` file in frontend
2. Command Palette → `TypeScript: Select TypeScript Version`
3. Choose: `Use Workspace Version` (should show version from `frontend/node_modules`)

### Step 5: Environment Variable Debugging
Set `ESLINT_DEBUG=1` before starting VS Code:

**Windows (PowerShell):**
```powershell
$env:ESLINT_DEBUG=1
code .
```

**Windows (CMD):**
```cmd
set ESLINT_DEBUG=1
code .
```

**macOS/Linux:**
```bash
ESLINT_DEBUG=1 code .
```

This activates `debugLevel` in parser options.

---

## Common Issues & Fixes

### Issue 1: "Cannot find tsconfig.json"
**Cause:** ESLint is running from wrong directory  
**Fix:** Check `eslint.workingDirectories` in `.vscode/settings.json` and restart ESLint server

### Issue 2: "File is not included in tsconfig"
**Cause:** File path outside tsconfig `include` patterns  
**Fix:** Check `tsconfig.json` → `include` array

### Issue 3: "Multiple tsconfig files found"
**Cause:** ESLint running at monorepo root instead of workspace  
**Fix:** Ensure root `eslint.config.js` ignores workspace directories

### Issue 4: ESLint not running at all
**Cause:** Flat config not detected  
**Fix:** Add `"eslint.experimental.useFlatConfig": true` to VS Code settings

---

## Verification Commands

### Check ESLint can parse files
```bash
cd frontend
npx eslint --debug index.tsx 2>&1 | grep -i "tsconfig"
```

### Test ESLint configuration
```bash
cd frontend
npx eslint --print-config index.tsx
```

### Verify file inclusion
```bash
cd frontend
npx tsc --noEmit --listFiles | grep index.tsx
```

---

## Expected Behavior After Fix

1. ✅ No "No tsconfigRootDir" errors in Problems panel
2. ✅ ESLint Output shows separate working directories for frontend/backend
3. ✅ TypeScript errors show correctly (not ESLint parse errors)
4. ✅ Auto-fix on save works (Ctrl+S / Cmd+S)

---

## Rollback Instructions

If debugging causes issues, restore original configs:

```bash
cd frontend
git checkout eslint.config.js

cd ../backend
git checkout eslint.config.js

# Remove root config
rm ../eslint.config.js

# Remove VS Code settings
rm ../.vscode/settings.json
```

---

## Performance Notes

- Debug mode adds ~100ms overhead per file
- In production, ensure `ESLINT_DEBUG` is not set
- Consider disabling `eslint.format.enable` for large projects (>1000 files)
- Use `eslint.codeActionsOnSave` selectively if experiencing slowdowns

---

## Additional Resources

- [TypeScript ESLint Parser Docs](https://typescript-eslint.io/packages/parser/)
- [ESLint Flat Config Guide](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [VS Code ESLint Extension](https://github.com/microsoft/vscode-eslint)
- [Monorepo ESLint Setup](https://typescript-eslint.io/docs/linting/typed-linting/monorepos)

---

**Last Updated:** 2025-12-19  
**Applied By:** GitHub Copilot  
**Issue:** Monorepo TSConfig ambiguity
