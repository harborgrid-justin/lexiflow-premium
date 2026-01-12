/\*\*

- Centralized Theme System - README
-
- This directory contains ALL theme-related code for LexiFlow Premium.
- All theme imports should come from '@/features/theme'.
-
- ## Structure
-
- ```

  ```
- features/theme/
- ├── index.ts # Main export (use this for all imports)
- ├── tokens.ts # Design tokens (colors, spacing, typography)
- ├── ThemeContext.tsx # Theme context and provider (moved from contexts/theme)
- ├── ThemeContext.types.ts # Theme type definitions
- └── services/
-     ├── index.ts                # Service exports
-     └── chartColorService.ts    # Chart color utilities (moved from services/theme)
- ```

  ```
-
- ## Usage
-
- ### Import theme tokens and types:
- ```typescript

  ```
- import {
- DEFAULT_LIGHT_TOKENS,
- DEFAULT_DARK_TOKENS,
- ThemeMode,
- ThemeDensity
- } from '@/features/theme';
- ```

  ```
-
- ### Use theme context:
- ```typescript

  ```
- import { useTheme, ThemeProvider } from '@/features/theme';
-
- function MyComponent() {
- const { theme, mode, toggleTheme } = useTheme();
- return <div className={theme.background}>...</div>;
- }
- ```

  ```
-
- ### Use chart colors:
- ```typescript

  ```
- import { ChartColorService } from '@/features/theme';
-
- const colors = ChartColorService.getChartColors('light');
- const riskColors = ChartColorService.getRiskColors('dark');
- ```

  ```
-
- ## Migration from Old Locations
-
- All imports have been updated from:
- - `@/contexts/theme/*` → `@/features/theme`
- - `@/shared/theme/*` → `@/features/theme`
- - `@/services/theme/*` → `@/features/theme`
-
- Old directories are kept for backward compatibility during transition
- but should not be used for new code.
-
- ## Design Tokens
-
- Design tokens include:
- - **Colors**: Primary, secondary, status colors (success, warning, error, info)
- - **Spacing**: Density-based spacing (compact, normal, comfortable)
- - **Typography**: Font families, weights, sizes, line heights
- - **Shadows**: Elevation system (sm, md, lg, xl, 2xl, inner)
- - **Border Radius**: Consistent corner radii (sm to full)
- - **Transitions**: Animation timing (instant, fast, normal, slow)
- - **Z-Index**: Layering system (modal, overlay, tooltip, etc.)
-
- ## Theme Modes
-
- Two theme modes are supported:
- - **Light Mode**: `DEFAULT_LIGHT_TOKENS`
- - **Dark Mode**: `DEFAULT_DARK_TOKENS`
-
- Theme automatically adjusts colors, backgrounds, and text for each mode.
-
- ## Services
-
- ### ChartColorService
- Provides theme-aware colors for:
- - Chart visualizations (Recharts)
- - Risk indicators (low/medium/high)
- - Status badges and alerts
- - Entity types in graphs
- - User collaboration colors
- - Category/industry colors
-
- ## Extending the Theme
-
- To add new theme functionality:
- 1.  Add to `tokens.ts` for design tokens
- 2.  Add to `services/` for utility functions
- 3.  Export from `index.ts`
- 4.  Update this README
-
- ## Best Practices
-
- ✅ **DO:**
- - Import everything from `@/features/theme`
- - Use semantic color names (primary, success, error)
- - Use design tokens for consistency
- - Respect theme mode in custom styles
-
- ❌ **DON'T:**
- - Hardcode color values (#3b82f6, etc.)
- - Import from old locations (contexts/theme, services/theme)
- - Create theme-related files outside this directory
- - Bypass theme system for custom colors
    \*/

export {};
