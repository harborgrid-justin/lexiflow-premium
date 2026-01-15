# Theme Customizer - 150+ Options

Complete design system customization with real-time preview for LexiFlow Enterprise.

## Overview

The Advanced Theme Customizer provides **150+ theme options** across 6 major categories:

1. **Appearance** (3 options) - Global theme settings
2. **Colors** (87 options) - Complete color system
3. **Typography** (38 options) - Font system and text styling
4. **Layout & Spacing** (39 options) - Dimensions and spacing
5. **Effects & Shadows** (32 options) - Visual effects
6. **Advanced** (34 options) - Animations, z-index, and transitions

## Theme Options Breakdown

### 1. Appearance (3 Options)

**Global Settings:**

- Color Mode: `light` | `dark`
- Information Density: `compact` | `normal` | `comfortable`
- Font Mode: `sans` | `serif`

### 2. Colors (87 Options)

#### Brand Colors (5)

- primary
- primaryDark
- primaryLight
- secondary
- accent

#### Backgrounds (10)

- background
- backgroundSecondary
- backgroundTertiary
- surface
- surfaceRaised
- surfaceHighlight
- surfaceOverlay
- surfaceInput
- surfaceActive
- surfaceHover

#### Borders (8)

- border
- borderLight
- borderDark
- borderFocus
- borderError
- borderSuccess
- borderWarning
- borderInfo

#### Text Colors (12)

- text
- textMuted
- textInverse
- textLink
- textDisabled
- textPlaceholder
- textCode
- textSuccess
- textWarning
- textError
- textInfo
- textAccent

#### Semantic Colors (4)

- success
- warning
- error
- info

#### Extended Palette (18)

- slate50-900 (10 shades)
- blue400, blue500, blue600
- emerald400, emerald500
- amber400
- rose400
- indigo400

#### Interactive States (6)

- hoverPrimary
- hoverSecondary
- activePrimary
- activeSecondary
- focusRing
- disabled

#### Chart Colors (10)

- blue, green, red, amber, purple, pink, slate, teal, cyan, orange

#### Annotations (8)

- yellow, green, blue, red, purple, highlight, orange, pink

#### Gradients (6)

- primary, secondary, success, warning, error, info

### 3. Typography (38 Options)

#### Font Families (3)

- fontSans
- fontMono
- fontSerif

#### Font Weights (8)

- extralight (200)
- light (300)
- normal (400)
- medium (500)
- semibold (600)
- bold (700)
- extrabold (800)
- black (900)

#### Font Sizes (12)

- xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, 8xl

#### Line Heights (5)

- none (1)
- tight (1.25)
- normal (1.5)
- relaxed (1.75)
- loose (2)

#### Letter Spacing (5)

- tight (-0.025em)
- normal (0)
- wide (0.025em)
- wider (0.05em)
- widest (0.1em)

### 4. Layout & Spacing (39 Options)

#### Spacing Per Density (16 per density level)

- unit
- gutter
- container
- inputPadding
- cardPadding
- rowHeight
- xs, sm, md, lg, xl, xxl
- sectionPadding
- buttonPadding
- navHeight
- modalPadding

#### Border Radius (8)

- none, sm, md, lg, xl, xxl, xxxl, full

#### Layout Dimensions (15)

- sidebarWidth
- sidebarCollapsedWidth
- topBarHeight
- modalMaxWidth
- footerHeight
- tableRowHeight
- tableHeaderHeight
- maxContentWidth
- minContentWidth
- cardMinHeight
- inputHeight
- buttonHeight
- iconSize
- avatarSize
- badgeSize

### 5. Effects & Shadows (32 Options)

#### Shadows (10)

- sm, md, lg, xl, xxl
- inner, outline, colored, glow, inset

#### Blur Effects (4)

- sm (4px)
- md (8px)
- lg (16px)
- xl (24px)

#### Opacity Levels (4)

- disabled (0.5)
- hover (0.8)
- active (0.9)
- overlay (0.75)

#### Backdrop Filters (4)

- blur
- brightness
- contrast
- saturate

#### Semantic Effects (7)

- overlay
- backdrop
- divider
- highlight
- selection
- focus
- placeholder

### 6. Advanced (34 Options)

#### Transitions (8)

- instant (75ms)
- fast (150ms)
- normal (300ms)
- slow (500ms)
- smooth
- bounce
- elastic
- linear

#### Z-Index Layers (10)

- base (0)
- sticky (30)
- header (40)
- sidebar (50)
- dropdown (60)
- fixed (70)
- overlay (90)
- modal (100)
- tooltip (110)
- notification (120)

#### Animation Durations (4)

- fast (150ms)
- normal (300ms)
- slow (500ms)
- verySlow (800ms)

#### Animation Easing (6)

- linear
- easeIn
- easeOut
- easeInOut
- bounce
- elastic

#### Animation Keyframes (6)

- fadeIn
- fadeOut
- slideIn
- slideOut
- pulse
- spin

## Usage

### Accessing the Theme Customizer

Navigate to: **Settings → Theme Settings**

Or directly: `/settings/theme`

### Real-time Preview

All changes update **immediately** across the entire application:

- Colors update instantly
- Typography changes reflect immediately
- Spacing adjusts in real-time
- Effects and shadows update live

### Saving Changes

Click the **"🚀 Publish Theme"** button to persist changes to the backend database.

Changes are saved to your user profile preferences and will be restored on login.

### Programmatic Access

```typescript
import { useTheme } from '@/theme';

function MyComponent() {
  const { tokens, theme, updateToken, density, setDensity } = useTheme();

  // Access any token
  const primaryColor = tokens.colors.primary;
  const fontSize = tokens.typography.sizes.lg;
  const shadow = tokens.shadows.md;

  // Update a token
  updateToken('colors', 'primary', '#ff0000');

  // Change density
  setDensity('compact');

  return <div style={{ color: primaryColor }}>Themed content</div>;
}
```

### CSS Variables

All theme tokens are automatically injected as CSS variables:

```css
/* Colors */
--color-primary
--color-secondary
--color-text
--color-background
/* etc... */

/* Typography */
--font-sans
--size-base
--weight-bold
--line-height-normal
--letter-spacing-wide

/* Layout */
--spacing-unit
--spacing-gutter
--radius-md
--shadow-lg

/* Effects */
--effect-blur-md
--effect-opacity-hover
--semantic-overlay

/* Advanced */
--transition-smooth
--z-modal
--animation-duration-fast
--animation-easing-bounce
```

## Architecture

### Token Structure

```typescript
interface DesignTokens {
  fontMode: "sans" | "serif";
  colors: {
    /* 87 color properties */
  };
  spacing: {
    /* 16 properties per density */
  };
  shadows: {
    /* 10 shadow options */
  };
  borderRadius: {
    /* 8 radius options */
  };
  typography: {
    /* 38 typography properties */
  };
  transitions: {
    /* 8 transition options */
  };
  zIndex: {
    /* 10 z-index layers */
  };
  layout: {
    /* 15 layout dimensions */
  };
  animations: {
    /* 16 animation properties */
  };
  effects: {
    /* 16 effect properties */
  };
  semantic: {
    /* 7 semantic tokens */
  };
}
```

### Theme Provider

The theme system uses React 18's `useSyncExternalStore` for localStorage synchronization and `useTransition` for non-urgent updates.

All theme changes are:

- ✅ Concurrent-safe
- ✅ StrictMode compatible
- ✅ SSR-safe
- ✅ Automatically persisted
- ✅ Real-time across tabs

### Data Flow

```
User Input → useThemeCustomizer hook
           → updateToken (local state)
           → ThemeContext (global state)
           → CSS Variables (DOM injection)
           → Real-time UI update
           → Save button → Backend API → Database
```

## Best Practices

### 1. Use Semantic Tokens

Prefer semantic tokens over direct color values:

```typescript
// ✅ Good
<div className="bg-[var(--color-surface)]">

// ❌ Avoid
<div className="bg-white dark:bg-slate-900">
```

### 2. Respect Density Settings

Use density-aware spacing:

```typescript
const { tokens, density } = useTheme();
const spacing = tokens.spacing[density];

<div style={{ padding: spacing.cardPadding }}>
```

### 3. Theme-aware Components

Make components adapt to theme changes:

```typescript
function ThemedCard() {
  const { theme, tokens } = useTheme();

  return (
    <div style={{
      backgroundColor: theme.surface.default,
      color: theme.text.primary,
      borderRadius: tokens.borderRadius.lg,
      boxShadow: tokens.shadows.md,
    }}>
      Content
    </div>
  );
}
```

### 4. Animation Performance

Use CSS transitions defined in tokens for optimal performance:

```typescript
<div style={{
  transition: tokens.transitions.smooth,
  opacity: tokens.effects.opacity.hover
}}>
```

## Advanced Features

### Custom Gradients

Define custom gradient backgrounds:

```typescript
updateToken(
  "colors",
  "gradients",
  "custom",
  "linear-gradient(45deg, #667eea 0%, #764ba2 100%)"
);
```

### Z-Index Management

Maintain proper stacking order:

```typescript
const { tokens } = useTheme();

// Modal always above overlay
<div style={{ zIndex: tokens.zIndex.overlay }}>Overlay</div>
<div style={{ zIndex: tokens.zIndex.modal }}>Modal</div>
```

### Backdrop Effects

Apply modern backdrop effects:

```typescript
<div style={{
  backdropFilter: tokens.effects.backdrop.blur,
  backgroundColor: tokens.semantic.overlay
}}>
```

## Troubleshooting

### Changes Not Persisting

Ensure you click "Publish Theme" to save to the backend.

### Theme Not Loading on Login

Check that authentication is working - theme hydration requires a valid auth token.

### CSS Variable Not Found

Verify the token path in ThemeContext's useEffect CSS variable injection logic.

### Performance Issues

Use `useTransition` for non-urgent theme updates:

```typescript
const [isPending, startTransition] = useTransition();

startTransition(() => {
  updateToken("colors", "primary", newColor);
});
```

## Contributing

To add new theme properties:

1. Update `DesignTokens` interface in `tokens.ts`
2. Add default values to `DEFAULT_TOKENS`
3. Update `getTokens()` for dark mode support
4. Add CSS variable injection in `ThemeContext.tsx`
5. Add UI controls in `AdvancedThemeCustomizer.tsx`
6. Update this documentation

## License

Enterprise License - LexiFlow Legal Suite
