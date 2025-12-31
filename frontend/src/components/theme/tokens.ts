export type ThemeMode = 'light' | 'dark';

// Base Primitive Colors (Tailwind Reference)
// This is kept for reference and future use
// @ts-expect-error - palette is kept for reference
const _palette = {
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a', // Deep Blue
  },
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    900: '#064e3b',
  },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    900: '#78350f',
  },
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    500: '#f43f5e',
    600: '#e11d48',
    900: '#881337',
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    500: '#a855f7',
    600: '#9333ea',
    900: '#581c87',
  }
};

export const tokens = {
  colors: {
    light: {
      // 1. Foundation
      background: 'bg-slate-50',
      text: {
        primary: 'text-slate-900',
        secondary: 'text-slate-600',
        tertiary: 'text-slate-500',
        inverse: 'text-white',
        link: 'text-blue-600 hover:text-blue-700',
        code: 'text-pink-600',
      },
      
      // 5. Surface Layering
      surface: {
        default: 'bg-white',
        raised: 'bg-white shadow-sm',
        overlay: 'bg-white shadow-xl',
        highlight: 'bg-slate-50',
        active: 'bg-slate-100',
        input: 'bg-white',
      },

      // 6. Border Hierarchy
      border: {
        default: 'border-slate-200',
        subtle: 'border-slate-100',
        focused: 'border-blue-500 ring-2 ring-blue-500/20',
        error: 'border-rose-300 focus:border-rose-500 focus:ring-rose-200',
        primary: 'border-blue-500',    // Compatibility alias
      },

      // 7. Interactive
      action: {
        primary: {
            bg: 'bg-blue-600',
            hover: 'hover:bg-blue-700',
            text: 'text-white',
            border: 'border-transparent',
        },
        secondary: {
            bg: 'bg-white',
            hover: 'hover:bg-slate-50',
            text: 'text-slate-700',
            border: 'border-slate-300',
        },
        ghost: {
            bg: 'bg-transparent',
            hover: 'hover:bg-slate-100',
            text: 'text-slate-600',
        },
        danger: {
            bg: 'bg-white',
            hover: 'hover:bg-rose-50',
            text: 'text-rose-600',
            border: 'border-rose-200',
        }
      },

      // 8. Status Palettes
      status: {
        success: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'text-emerald-500' },
        warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'text-amber-500' },
        error: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: 'text-rose-500' },
        info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500' },
        neutral: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: 'text-slate-400' },
      },

      // 9. Glassmorphism & Overlays
      backdrop: 'bg-slate-900/40 backdrop-blur-[2px]',
      
      // 18. Charts
      chart: {
        grid: '#e2e8f0',
        text: '#64748b',
        tooltip: { bg: '#ffffff', border: '#e2e8f0', text: '#1e293b' },
        colors: {
            primary: '#3b82f6',
            secondary: '#8b5cf6',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            neutral: '#64748b',
            // Color aliases
            blue: '#3b82f6',
            purple: '#a855f7',
            emerald: '#10b981',
        }
      },

      // Legacy Mappings (Backward Compatibility)
      primary: {
        DEFAULT: 'bg-blue-600',
        main: 'bg-blue-600',        // Alias for DEFAULT
        hover: 'hover:bg-blue-700',
        light: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
      },
    },
    dark: {
      // 1. Foundation
      background: 'bg-slate-950',
      text: {
        primary: 'text-slate-50',
        secondary: 'text-slate-400',
        tertiary: 'text-slate-600',
        inverse: 'text-slate-900',
        link: 'text-blue-400 hover:text-blue-300',
        code: 'text-pink-400',
      },
      
      // 5. Surface Layering
      surface: {
        default: 'bg-slate-900',
        raised: 'bg-slate-800 shadow-md',
        overlay: 'bg-slate-800 shadow-2xl border border-slate-700',
        highlight: 'bg-slate-800/50',
        active: 'bg-slate-800',
        input: 'bg-slate-900',
      },

      // 6. Border Hierarchy
      border: {
        default: 'border-slate-800',
        subtle: 'border-slate-800/50',
        focused: 'border-blue-500 ring-2 ring-blue-500/30',
        error: 'border-rose-800 focus:border-rose-500 focus:ring-rose-900',
        primary: 'border-blue-500',    // Compatibility alias
      },

      // 7. Interactive
      action: {
        primary: {
            bg: 'bg-blue-600',
            hover: 'hover:bg-blue-500',
            text: 'text-white',
            border: 'border-transparent',
        },
        secondary: {
            bg: 'bg-slate-800',
            hover: 'hover:bg-slate-700',
            text: 'text-slate-200',
            border: 'border-slate-700',
        },
        ghost: {
            bg: 'bg-transparent',
            hover: 'hover:bg-slate-800',
            text: 'text-slate-400',
        },
        danger: {
            bg: 'bg-slate-900',
            hover: 'hover:bg-rose-900/30',
            text: 'text-rose-400',
            border: 'border-rose-900',
        }
      },

      // 8. Status Palettes
      status: {
        success: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-900', icon: 'text-emerald-400' },
        warning: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-900', icon: 'text-amber-400' },
        error: { bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-900', icon: 'text-rose-400' },
        info: { bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-900', icon: 'text-blue-400' },
        neutral: { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700', icon: 'text-slate-500' },
      },

      // 9. Glassmorphism & Overlays
      backdrop: 'bg-slate-950/70 backdrop-blur-[2px]',
      
      // 18. Charts
      chart: {
        grid: '#334155',
        text: '#94a3b8',
        tooltip: { bg: '#1e293b', border: '#334155', text: '#f8fafc' },
        colors: {
            primary: '#3b82f6',
            secondary: '#8b5cf6',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            neutral: '#94a3b8',
            // Color aliases
            blue: '#3b82f6',
            purple: '#a855f7',
            emerald: '#10b981',
        }
      },

      // Legacy Mappings
      primary: {
        DEFAULT: 'bg-blue-500',
        main: 'bg-blue-500',        // Alias for DEFAULT
        hover: 'hover:bg-blue-600',
        light: 'bg-blue-900/30',
        text: 'text-blue-400',
        border: 'border-blue-800',
      },
    }
  },
  
  // 17. Z-Index Registry
  zIndex: {
    base: 'z-0',
    dropdown: 'z-40',
    sticky: 'z-30',
    header: 'z-50',
    orbital: 'z-[60]',
    modalBackdrop: 'z-[4999]',
    modal: 'z-[5000]',
    toast: 'z-[6000]',
    tooltip: 'z-[7000]',
  },
  
  // 10. Strict Radii
  borderRadius: {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  },
  
  // 15. Spacing
  spacing: {
    page: 'p-6',
    card: 'p-5',
    section: 'mb-6'
  },

  // 25. Transitions
  transition: {
    default: 'transition-all duration-200 ease-out',
    fast: 'transition-all duration-100 ease-out',
    slow: 'transition-all duration-500 ease-in-out'
  }
};

// Export ThemeTokens type for type safety
export type ThemeTokens = typeof tokens;
