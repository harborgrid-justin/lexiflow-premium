# LexiFlow Design System

**Complete Theme Customization Guide**

This document provides complete control over the entire application's theme, including colors, typography, spacing, animations, and more.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Complete Theme Customization](#complete-theme-customization)
4. [Color System](#color-system)
5. [Typography System](#typography-system)
6. [Spacing & Layout](#spacing--layout)
7. [Component Theming](#component-theming)
8. [Advanced Customization](#advanced-customization)

---

## Quick Start

### Changing the Entire Theme in 3 Steps

1. **Edit Core Tokens** - [`src/features/theme/tokens.ts`](src/features/theme/tokens.ts)
2. **Update CSS Variables** - [`src/App.css`](src/App.css) (optional for direct CSS control)
3. **Modify Tailwind Config** - [`tailwind.config.js`](tailwind.config.js) (for utility classes)

### Example: Change Primary Color from Slate to Purple

```typescript
// src/features/theme/tokens.ts
export const DEFAULT_TOKENS: DesignTokens = {
  colors: {
    primary: "#7c3aed", // Changed from #0f172a
    primaryDark: "#5b21b6", // Changed from #020617
    primaryLight: "#ddd6fe", // Changed from #f1f5f9
    secondary: "#ec4899", // Pink accent
    // ... rest of colors
  },
  // ... rest of tokens
};
```

---

## Architecture Overview

### Theme System Flow

```
tokens.ts (Source of Truth)
    ↓
ThemeContext (React Context)
    ↓
CSS Variables (--color-primary, etc.)
    ↓
Tailwind Config (var(--color-primary))
    ↓
Components (className="bg-primary")
```

### Key Files

| File                                                                           | Purpose                     | What to Edit                         |
| ------------------------------------------------------------------------------ | --------------------------- | ------------------------------------ |
| [`src/features/theme/tokens.ts`](src/features/theme/tokens.ts)                 | **Master theme definition** | Colors, spacing, typography, shadows |
| [`src/features/theme/ThemeContext.tsx`](src/features/theme/ThemeContext.tsx)   | Theme provider & logic      | Theme switching, mode management     |
| [`src/features/theme/ThemeProvider.tsx`](src/features/theme/ThemeProvider.tsx) | Applies CSS variables       | Injects theme into DOM               |
| [`tailwind.config.js`](tailwind.config.js)                                     | Tailwind customization      | Utility class mappings               |
| [`src/App.css`](src/App.css)                                                   | Global CSS                  | Direct CSS variable overrides        |

---

## Complete Theme Customization

### 1. Edit `tokens.ts` - The Master Configuration

**File**: [`src/features/theme/tokens.ts`](src/features/theme/tokens.ts)

This is your **single source of truth** for all design tokens. Edit this file to change the entire application theme.

#### Full Token Structure

```typescript
export const DEFAULT_TOKENS: DesignTokens = {
  fontMode: "sans", // "sans" | "serif"

  // ========================================
  // COLORS - Complete Color System
  // ========================================
  colors: {
    // Brand Colors
    primary: "#0f172a", // Main brand color (buttons, links, headers)
    primaryDark: "#020617", // Darker variant (hover states)
    primaryLight: "#f1f5f9", // Lighter variant (backgrounds)

    // Accent Colors
    secondary: "#2563eb", // Secondary actions (Blue 600)
    accent: "#6366f1", // Highlights & special elements (Indigo 500)

    // Surface Colors
    background: "#f8fafc", // Main app background (Slate 50)
    surface: "#ffffff", // Card/panel backgrounds
    border: "#e2e8f0", // Border color (Slate 200)
    borderLight: "#f8fafc", // Subtle borders

    // Text Colors
    text: "#0f172a", // Primary text (Slate 900)
    textMuted: "#64748b", // Secondary/muted text (Slate 500)

    // Semantic Colors
    success: "#10b981", // Success states (Emerald 500)
    warning: "#f59e0b", // Warning states (Amber 500)
    error: "#ef4444", // Error states (Red 500)
    info: "#3b82f6", // Info states (Blue 500)

    // Chart Colors (for analytics dashboards)
    charts: {
      blue: "#3b82f6",
      green: "#10b981",
      red: "#ef4444",
      amber: "#f59e0b",
      purple: "#8b5cf6",
      pink: "#ec4899",
      slate: "#475569",
    },

    // Annotation Colors (for legal documents)
    annotations: {
      yellow: "#FCD34D", // Highlights
      green: "#34D399", // Approved sections
      blue: "#60A5FA", // Notes
      red: "#F87171", // Issues/concerns
      purple: "#A78BFA", // Key points
      highlight: "#fef08a", // Text highlighting
    },
  },

  // ========================================
  // SPACING - Density Modes
  // ========================================
  spacing: {
    compact: {
      unit: "4px", // Base spacing unit
      gutter: "16px", // Container padding
      container: "1280px", // Max container width
      inputPadding: "12px", // Form input padding
      cardPadding: "12px", // Card/panel padding
      rowHeight: "32px", // Table row height
    },
    normal: {
      unit: "6px",
      gutter: "24px",
      container: "1920px",
      inputPadding: "16px",
      cardPadding: "24px",
      rowHeight: "48px",
    },
    comfortable: {
      unit: "8px",
      gutter: "32px",
      container: "2400px",
      inputPadding: "24px",
      cardPadding: "32px",
      rowHeight: "64px",
    },
  },

  // ========================================
  // SHADOWS - Elevation System
  // ========================================
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  },

  // ========================================
  // BORDER RADIUS
  // ========================================
  borderRadius: {
    sm: "0.25rem", // 4px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
    full: "9999px", // Fully rounded (pills)
  },

  // ========================================
  // TYPOGRAPHY
  // ========================================
  typography: {
    // Font Families
    fontSans: "'Inter', sans-serif",
    fontSerif: "'Merriweather', serif",
    fontMono: "'JetBrains Mono', monospace",

    // Font Weights
    weights: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      black: "900",
    },

    // Font Sizes
    sizes: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
    },

    // Line Heights
    lineHeight: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },

  // ========================================
  // TRANSITIONS - Animation Timings
  // ========================================
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // ========================================
  // Z-INDEX - Layering
  // ========================================
  zIndex: {
    base: "0",
    header: "40",
    sidebar: "50",
    modal: "100",
    overlay: "90",
  },

  // ========================================
  // LAYOUT - Component Dimensions
  // ========================================
  layout: {
    sidebarWidth: 280,
    sidebarCollapsedWidth: 80,
    topBarHeight: 64,
    modalMaxWidth: 1200,
    footerHeight: 64,
    tableRowHeight: 48,
    tableHeaderHeight: 56,
  },
};
```

---

## Color System

### Predefined Color Palettes

Choose from these popular palettes or create your own:

#### 1. **Professional Blue** (Default)

```typescript
colors: {
  primary: "#0f172a",    // Slate 900
  secondary: "#2563eb",  // Blue 600
  accent: "#6366f1",     // Indigo 500
  success: "#10b981",    // Emerald 500
  warning: "#f59e0b",    // Amber 500
  error: "#ef4444",      // Red 500
}
```

#### 2. **Royal Purple** (Premium Look)

```typescript
colors: {
  primary: "#5b21b6",    // Purple 800
  secondary: "#7c3aed",  // Purple 600
  accent: "#a78bfa",     // Purple 400
  success: "#10b981",    // Emerald 500
  warning: "#f59e0b",    // Amber 500
  error: "#ef4444",      // Red 500
}
```

#### 3. **Forest Green** (Environmental/Legal)

```typescript
colors: {
  primary: "#064e3b",    // Emerald 900
  secondary: "#059669",  // Emerald 600
  accent: "#10b981",     // Emerald 500
  success: "#10b981",    // Emerald 500
  warning: "#f59e0b",    // Amber 500
  error: "#ef4444",      // Red 500
}
```

#### 4. **Navy Blue** (Corporate/Legal)

```typescript
colors: {
  primary: "#1e3a8a",    // Blue 900
  secondary: "#2563eb",  // Blue 600
  accent: "#60a5fa",     // Blue 400
  success: "#10b981",    // Emerald 500
  warning: "#f59e0b",    // Amber 500
  error: "#ef4444",      // Red 500
}
```

#### 5. **Crimson Red** (Bold/Legal)

```typescript
colors: {
  primary: "#7f1d1d",    // Red 900
  secondary: "#dc2626",  // Red 600
  accent: "#f87171",     // Red 400
  success: "#10b981",    // Emerald 500
  warning: "#f59e0b",    // Amber 500
  error: "#ef4444",      // Red 500
}
```

### Tailwind Color Reference

Use [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors) for hex values:

- **Slate**: Gray/neutral tones
- **Blue**: Primary actions
- **Emerald**: Success states
- **Amber**: Warnings
- **Red**: Errors
- **Purple/Indigo**: Accent colors

---

## Typography System

### Changing Fonts

Edit `typography` section in `tokens.ts`:

```typescript
typography: {
  fontSans: "'Your Font', sans-serif",
  fontSerif: "'Your Serif Font', serif",
  fontMono: "'Your Mono Font', monospace",
}
```

### Popular Font Combinations

#### 1. **Modern & Clean**

```typescript
fontSans: "'Inter', sans-serif",
fontSerif: "'Crimson Pro', serif",
fontMono: "'Fira Code', monospace",
```

#### 2. **Classic Legal**

```typescript
fontSans: "'Open Sans', sans-serif",
fontSerif: "'Merriweather', serif",
fontMono: "'Source Code Pro', monospace",
```

#### 3. **Elegant Professional**

```typescript
fontSans: "'Poppins', sans-serif",
fontSerif: "'Playfair Display', serif",
fontMono: "'JetBrains Mono', monospace",
```

#### 4. **Corporate Formal**

```typescript
fontSans: "'Roboto', sans-serif",
fontSerif: "'Lora', serif",
fontMono: "'Roboto Mono', monospace",
```

### Adding Custom Fonts

1. **Add to `public/index.html`**:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Your+Font:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

2. **Or use local fonts** in `src/App.css`:

```css
@font-face {
  font-family: "CustomFont";
  src: url("/fonts/CustomFont-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
}
```

---

## Spacing & Layout

### Changing Density

Users can switch between compact, normal, and comfortable modes. Edit default in `ThemeContext.tsx`:

```typescript
const [density, setDensity] = useState<ThemeDensity>("normal"); // Change to "compact" or "comfortable"
```

### Custom Spacing

Edit `spacing` section in `tokens.ts`:

```typescript
spacing: {
  normal: {
    unit: "8px",         // Increase for more breathing room
    gutter: "32px",      // Increase container padding
    cardPadding: "32px", // Increase card padding
    // ... other values
  },
}
```

### Layout Dimensions

Edit `layout` section for component sizes:

```typescript
layout: {
  sidebarWidth: 320,           // Wider sidebar
  sidebarCollapsedWidth: 60,   // Narrower collapsed state
  topBarHeight: 72,            // Taller header
  modalMaxWidth: 1400,         // Wider modals
  // ... other values
}
```

---

## Component Theming

### Where Components Get Their Colors

Components use semantic color classes from Tailwind:

```tsx
// Example: Button component
<button className="bg-primary text-white hover:bg-primary-dark">
  Click Me
</button>

// Maps to CSS variables:
// bg-primary → var(--color-primary)
// hover:bg-primary-dark → var(--color-primaryDark)
```

### Component Color Mapping

| Component | Color Source                   | Token Path                           |
| --------- | ------------------------------ | ------------------------------------ |
| Buttons   | `bg-primary`, `bg-secondary`   | `colors.primary`, `colors.secondary` |
| Cards     | `bg-surface`, `border-border`  | `colors.surface`, `colors.border`    |
| Text      | `text-text`, `text-text-muted` | `colors.text`, `colors.textMuted`    |
| Success   | `text-success`, `bg-success`   | `colors.success`                     |
| Error     | `text-error`, `bg-error`       | `colors.error`                       |
| Warning   | `text-warning`, `bg-warning`   | `colors.warning`                     |

### Customizing Specific Components

If you need component-specific overrides, edit the component file directly:

Example: [`src/components/common/Button.tsx`](src/components/common/Button.tsx)

```tsx
// Find the className and adjust:
<button className="bg-purple-600 hover:bg-purple-700">
  {" "}
  // Override primary color Custom Button
</button>
```

---

## Advanced Customization

### Dark Mode Colors

Edit the `getTokens()` function in `tokens.ts`:

```typescript
export function getTokens(mode: ThemeMode = "light", ...): DesignTokens {
  // ...
  if (mode === "dark") {
    baseTokens.colors = {
      ...baseTokens.colors,
      primary: "#f1f5f9",       // Light text on dark
      background: "#0f172a",    // Dark background
      surface: "#1e293b",       // Card backgrounds
      border: "#334155",        // Borders
      text: "#f1f5f9",          // Light text
      textMuted: "#94a3b8",     // Muted text
      // ... customize more dark mode colors
    };
  }
  return baseTokens;
}
```

### CSS Variable Overrides

For direct CSS control, edit [`src/App.css`](src/App.css):

```css
:root {
  /* Override any CSS variable directly */
  --color-primary: #7c3aed;
  --color-secondary: #ec4899;
  --shadow-md: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.dark {
  /* Dark mode overrides */
  --color-primary: #ddd6fe;
  --color-background: #1a1a1a;
}
```

### Tailwind Utility Class Extensions

Add custom utilities in [`tailwind.config.js`](tailwind.config.js):

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: "#your-color",
        "accent-2": "#another-color",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      fontSize: {
        "2xs": "0.625rem",
      },
    },
  },
};
```

### Animation Customization

Edit `transitions` in `tokens.ts` or add to `tailwind.config.js`:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
};
```

---

## Testing Your Theme

### Live Preview

After editing `tokens.ts`, your changes apply immediately in development mode:

```bash
npm run dev
```

### Test Light/Dark Mode

Use the theme toggle in the app's top bar (usually a sun/moon icon).

### Test Density Modes

Access user settings to switch between compact, normal, and comfortable modes.

### Test Across Components

Navigate to these sections to see theme changes:

1. **Dashboard** - Cards, charts, metrics
2. **Case List** - Tables, data grids
3. **Document Viewer** - Document cards, file browser
4. **Forms** - Input fields, buttons, dropdowns
5. **Modals** - Overlays, dialogs

---

## Production Deployment

### Build with Custom Theme

```bash
npm run build
```

Your custom theme is bundled automatically. No additional configuration needed.

### Performance Tips

- Keep color palette under 20 colors for optimal bundle size
- Use semantic naming for maintainability
- Leverage CSS variable cascading for efficiency

---

## Troubleshooting

### Issue: Colors Not Applying

**Solution**: Check that CSS variables are set in `ThemeProvider.tsx` and referenced in `tailwind.config.js`:

```javascript
// tailwind.config.js
colors: {
  primary: "var(--color-primary)", // Must reference CSS variable
}
```

### Issue: Dark Mode Not Working

**Solution**: Ensure `darkMode: "class"` is set in `tailwind.config.js` and `ThemeProvider` applies the `dark` class to `<html>`.

### Issue: Fonts Not Loading

**Solution**:

1. Check font URL in `<link>` tag or `@font-face`
2. Verify font name matches exactly in `tokens.ts`
3. Clear browser cache

### Issue: Spacing Inconsistent

**Solution**: Use density mode consistently. Don't mix hardcoded spacing with density-based spacing.

---

## Quick Reference

### Essential Files

| Action                 | File to Edit                                                                  |
| ---------------------- | ----------------------------------------------------------------------------- |
| Change colors          | [`src/features/theme/tokens.ts`](src/features/theme/tokens.ts) → `colors`     |
| Change fonts           | [`src/features/theme/tokens.ts`](src/features/theme/tokens.ts) → `typography` |
| Change spacing         | [`src/features/theme/tokens.ts`](src/features/theme/tokens.ts) → `spacing`    |
| Change shadows         | [`src/features/theme/tokens.ts`](src/features/theme/tokens.ts) → `shadows`    |
| Override CSS           | [`src/App.css`](src/App.css)                                                  |
| Add Tailwind utilities | [`tailwind.config.js`](tailwind.config.js)                                    |

### Theme Switching

```typescript
// In any component:
import { useTheme } from '@/features/theme';

function MyComponent() {
  const { mode, setMode, density, setDensity } = useTheme();

  return (
    <>
      <button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
        Toggle Dark Mode
      </button>
      <button onClick={() => setDensity('compact')}>
        Set Compact Mode
      </button>
    </>
  );
}
```

---

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Google Fonts](https://fonts.google.com/)
- [Coolors - Color Palette Generator](https://coolors.co/)
- [Realtime Colors - Theme Visualizer](https://www.realtimecolors.com/)

---

## Support

For questions or issues with theme customization:

1. Check this documentation first
2. Review code comments in `tokens.ts`
3. Test changes in development mode
4. Open an issue if something isn't working as expected

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Maintainer**: LexiFlow Design Team
