
export type ThemeMode = 'light' | 'dark';

export const tokens = {
  colors: {
    light: {
      background: 'bg-slate-50',
      surface: 'bg-white',
      surfaceHighlight: 'bg-slate-50',
      text: {
        primary: 'text-slate-900',
        secondary: 'text-slate-500',
        tertiary: 'text-slate-400',
        inverse: 'text-white',
      },
      border: {
        default: 'border-slate-200',
        light: 'border-slate-100',
      },
      primary: {
        DEFAULT: 'bg-blue-600',
        hover: 'hover:bg-blue-700',
        light: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
      },
      status: {
        success: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
        warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
        error: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
        info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
        neutral: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
      },
      backdrop: 'bg-slate-900/50',
    },
    dark: {
      background: 'bg-slate-950',
      surface: 'bg-slate-900',
      surfaceHighlight: 'bg-slate-800',
      text: {
        primary: 'text-slate-50',
        secondary: 'text-slate-400',
        tertiary: 'text-slate-600',
        inverse: 'text-slate-900',
      },
      border: {
        default: 'border-slate-800',
        light: 'border-slate-800/50',
      },
      primary: {
        DEFAULT: 'bg-blue-500',
        hover: 'hover:bg-blue-600',
        light: 'bg-blue-900/40',
        text: 'text-blue-400',
        border: 'border-blue-800',
      },
      status: {
        success: { bg: 'bg-emerald-950/50', text: 'text-emerald-400', border: 'border-emerald-900' },
        warning: { bg: 'bg-amber-950/50', text: 'text-amber-400', border: 'border-amber-900' },
        error: { bg: 'bg-rose-950/50', text: 'text-rose-400', border: 'border-rose-900' },
        info: { bg: 'bg-blue-950/50', text: 'text-blue-400', border: 'border-blue-900' },
        neutral: { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700' },
      },
      backdrop: 'bg-slate-950/70',
    }
  },
  zIndex: {
    base: 'z-0',
    dropdown: 'z-40',
    sticky: 'z-30',
    header: 'z-50',
    orbital: 'z-[60]',
    modal: 'z-[5000]',
    toast: 'z-[6000]',
    tooltip: 'z-[7000]',
  },
  borderRadius: {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  },
  spacing: {
    page: 'p-6',
    card: 'p-5',
  }
};
