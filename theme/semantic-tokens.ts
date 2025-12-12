/**
 * semantic-tokens.ts
 * Semantic design tokens for consistent UI patterns
 * Maps design intentions to theme values
 */

import { Theme } from './theme.config';

// ============================================================================
// Semantic Color Tokens
// ============================================================================

export interface SemanticColors {
  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverse: string;
  textLink: string;
  textLinkHover: string;

  // Backgrounds
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgInverse: string;
  bgOverlay: string;

  // Interactive
  interactivePrimary: string;
  interactivePrimaryHover: string;
  interactivePrimaryActive: string;
  interactivePrimaryDisabled: string;
  interactiveSecondary: string;
  interactiveSecondaryHover: string;
  interactiveSecondaryActive: string;
  interactiveSecondaryDisabled: string;

  // Feedback
  feedbackSuccess: string;
  feedbackSuccessBg: string;
  feedbackWarning: string;
  feedbackWarningBg: string;
  feedbackError: string;
  feedbackErrorBg: string;
  feedbackInfo: string;
  feedbackInfoBg: string;

  // Borders
  borderPrimary: string;
  borderSecondary: string;
  borderFocus: string;
  borderError: string;
  borderSuccess: string;

  // Legal-specific semantic tokens
  legalCase: string;
  legalCaseBg: string;
  legalDocument: string;
  legalDocumentBg: string;
  legalEvidence: string;
  legalEvidenceBg: string;
  legalDeadline: string;
  legalDeadlineBg: string;
  legalBilling: string;
  legalBillingBg: string;
}

// ============================================================================
// Semantic Spacing Tokens
// ============================================================================

export interface SemanticSpacing {
  // Component spacing
  componentPaddingXs: string;
  componentPaddingSm: string;
  componentPaddingMd: string;
  componentPaddingLg: string;
  componentPaddingXl: string;

  // Layout spacing
  layoutGapXs: string;
  layoutGapSm: string;
  layoutGapMd: string;
  layoutGapLg: string;
  layoutGapXl: string;

  // Section spacing
  sectionSpacingXs: string;
  sectionSpacingSm: string;
  sectionSpacingMd: string;
  sectionSpacingLg: string;
  sectionSpacingXl: string;

  // Container spacing
  containerPadding: string;
  containerMaxWidth: string;
}

// ============================================================================
// Semantic Typography Tokens
// ============================================================================

export interface SemanticTypography {
  // Headings
  headingXl: { fontSize: string; fontWeight: number; lineHeight: number };
  headingLg: { fontSize: string; fontWeight: number; lineHeight: number };
  headingMd: { fontSize: string; fontWeight: number; lineHeight: number };
  headingSm: { fontSize: string; fontWeight: number; lineHeight: number };
  headingXs: { fontSize: string; fontWeight: number; lineHeight: number };

  // Body text
  bodyLg: { fontSize: string; fontWeight: number; lineHeight: number };
  bodyMd: { fontSize: string; fontWeight: number; lineHeight: number };
  bodySm: { fontSize: string; fontWeight: number; lineHeight: number };
  bodyXs: { fontSize: string; fontWeight: number; lineHeight: number };

  // Labels
  labelLg: { fontSize: string; fontWeight: number; lineHeight: number };
  labelMd: { fontSize: string; fontWeight: number; lineHeight: number };
  labelSm: { fontSize: string; fontWeight: number; lineHeight: number };

  // Code
  code: { fontSize: string; fontFamily: string; lineHeight: number };
}

// ============================================================================
// Get Semantic Colors
// ============================================================================

export function getSemanticColors(theme: Theme): SemanticColors {
  return {
    // Text
    textPrimary: theme.colors.text,
    textSecondary: theme.colors.textSecondary,
    textTertiary: theme.colors.textDisabled,
    textDisabled: theme.colors.textDisabled,
    textInverse: theme.mode === 'light' ? '#ffffff' : '#111827',
    textLink: theme.colors.primary,
    textLinkHover: theme.colors.primary,

    // Backgrounds
    bgPrimary: theme.colors.background,
    bgSecondary: theme.colors.surface,
    bgTertiary: theme.mode === 'light' ? '#f3f4f6' : '#374151',
    bgInverse: theme.mode === 'light' ? '#111827' : '#ffffff',
    bgOverlay: theme.colors.overlay,

    // Interactive
    interactivePrimary: theme.colors.primary,
    interactivePrimaryHover: theme.mode === 'light' ? '#1d4ed8' : '#60a5fa',
    interactivePrimaryActive: theme.mode === 'light' ? '#1e40af' : '#3b82f6',
    interactivePrimaryDisabled: theme.colors.disabled,
    interactiveSecondary: theme.colors.secondary,
    interactiveSecondaryHover: theme.mode === 'light' ? '#6d28d9' : '#a78bfa',
    interactiveSecondaryActive: theme.mode === 'light' ? '#5b21b6' : '#8b5cf6',
    interactiveSecondaryDisabled: theme.colors.disabled,

    // Feedback
    feedbackSuccess: theme.colors.success,
    feedbackSuccessBg: theme.mode === 'light' ? '#d1fae5' : '#064e3b',
    feedbackWarning: theme.colors.warning,
    feedbackWarningBg: theme.mode === 'light' ? '#fef3c7' : '#78350f',
    feedbackError: theme.colors.error,
    feedbackErrorBg: theme.mode === 'light' ? '#fee2e2' : '#7f1d1d',
    feedbackInfo: theme.colors.info,
    feedbackInfoBg: theme.mode === 'light' ? '#dbeafe' : '#1e3a8a',

    // Borders
    borderPrimary: theme.colors.border,
    borderSecondary: theme.colors.borderLight,
    borderFocus: theme.colors.focus,
    borderError: theme.colors.error,
    borderSuccess: theme.colors.success,

    // Legal-specific
    legalCase: theme.colors.legal.case,
    legalCaseBg: theme.mode === 'light' ? '#ede9fe' : '#4c1d95',
    legalDocument: theme.colors.legal.document,
    legalDocumentBg: theme.mode === 'light' ? '#dbeafe' : '#1e3a8a',
    legalEvidence: theme.colors.legal.evidence,
    legalEvidenceBg: theme.mode === 'light' ? '#cffafe' : '#164e63',
    legalDeadline: theme.colors.legal.deadline,
    legalDeadlineBg: theme.mode === 'light' ? '#fee2e2' : '#7f1d1d',
    legalBilling: theme.colors.legal.billing,
    legalBillingBg: theme.mode === 'light' ? '#d1fae5' : '#064e3b',
  };
}

// ============================================================================
// Get Semantic Spacing
// ============================================================================

export function getSemanticSpacing(theme: Theme): SemanticSpacing {
  return {
    // Component spacing
    componentPaddingXs: theme.spacing.xs,
    componentPaddingSm: theme.spacing.sm,
    componentPaddingMd: theme.spacing.md,
    componentPaddingLg: theme.spacing.lg,
    componentPaddingXl: theme.spacing.xl,

    // Layout spacing
    layoutGapXs: theme.spacing.xs,
    layoutGapSm: theme.spacing.sm,
    layoutGapMd: theme.spacing.md,
    layoutGapLg: theme.spacing.lg,
    layoutGapXl: theme.spacing.xl,

    // Section spacing
    sectionSpacingXs: theme.spacing.md,
    sectionSpacingSm: theme.spacing.lg,
    sectionSpacingMd: theme.spacing.xl,
    sectionSpacingLg: theme.spacing.xxl,
    sectionSpacingXl: '4rem',

    // Container spacing
    containerPadding: theme.spacing.lg,
    containerMaxWidth: '1280px',
  };
}

// ============================================================================
// Get Semantic Typography
// ============================================================================

export function getSemanticTypography(theme: Theme): SemanticTypography {
  return {
    // Headings
    headingXl: {
      fontSize: theme.typography.fontSize.xxxl,
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.lineHeight.tight,
    },
    headingLg: {
      fontSize: theme.typography.fontSize.xxl,
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.lineHeight.tight,
    },
    headingMd: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      lineHeight: theme.typography.lineHeight.tight,
    },
    headingSm: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      lineHeight: theme.typography.lineHeight.normal,
    },
    headingXs: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      lineHeight: theme.typography.lineHeight.normal,
    },

    // Body text
    bodyLg: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.lineHeight.relaxed,
    },
    bodyMd: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.lineHeight.normal,
    },
    bodySm: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.lineHeight.normal,
    },
    bodyXs: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.lineHeight.normal,
    },

    // Labels
    labelLg: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight.normal,
    },
    labelMd: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight.normal,
    },
    labelSm: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight.normal,
    },

    // Code
    code: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: "'Fira Code', 'Monaco', 'Courier New', monospace",
      lineHeight: theme.typography.lineHeight.normal,
    },
  };
}

// ============================================================================
// Combined Semantic Tokens
// ============================================================================

export interface SemanticTokens {
  colors: SemanticColors;
  spacing: SemanticSpacing;
  typography: SemanticTypography;
}

export function getSemanticTokens(theme: Theme): SemanticTokens {
  return {
    colors: getSemanticColors(theme),
    spacing: getSemanticSpacing(theme),
    typography: getSemanticTypography(theme),
  };
}

// ============================================================================
// Component-specific Tokens
// ============================================================================

export interface ButtonTokens {
  paddingX: string;
  paddingY: string;
  fontSize: string;
  fontWeight: number;
  borderRadius: string;
  minHeight: string;
}

export function getButtonTokens(theme: Theme, size: 'sm' | 'md' | 'lg' = 'md'): ButtonTokens {
  const sizes = {
    sm: {
      paddingX: theme.spacing.md,
      paddingY: theme.spacing.xs,
      fontSize: theme.typography.fontSize.sm,
      minHeight: '32px',
    },
    md: {
      paddingX: theme.spacing.lg,
      paddingY: theme.spacing.sm,
      fontSize: theme.typography.fontSize.md,
      minHeight: '40px',
    },
    lg: {
      paddingX: theme.spacing.xl,
      paddingY: theme.spacing.md,
      fontSize: theme.typography.fontSize.lg,
      minHeight: '48px',
    },
  };

  return {
    ...sizes[size],
    fontWeight: theme.typography.fontWeight.medium,
    borderRadius: theme.borderRadius.md,
  };
}

export interface InputTokens {
  paddingX: string;
  paddingY: string;
  fontSize: string;
  borderRadius: string;
  borderWidth: string;
  minHeight: string;
}

export function getInputTokens(theme: Theme, size: 'sm' | 'md' | 'lg' = 'md'): InputTokens {
  const sizes = {
    sm: {
      paddingX: theme.spacing.sm,
      paddingY: theme.spacing.xs,
      fontSize: theme.typography.fontSize.sm,
      minHeight: '32px',
    },
    md: {
      paddingX: theme.spacing.md,
      paddingY: theme.spacing.sm,
      fontSize: theme.typography.fontSize.md,
      minHeight: '40px',
    },
    lg: {
      paddingX: theme.spacing.lg,
      paddingY: theme.spacing.md,
      fontSize: theme.typography.fontSize.lg,
      minHeight: '48px',
    },
  };

  return {
    ...sizes[size],
    borderRadius: theme.borderRadius.md,
    borderWidth: '1px',
  };
}

export default {
  getSemanticTokens,
  getSemanticColors,
  getSemanticSpacing,
  getSemanticTypography,
  getButtonTokens,
  getInputTokens,
};
