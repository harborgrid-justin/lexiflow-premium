import { tokens } from '../../components/theme/tokens';

type Theme = typeof tokens.colors.light;

export const getDashboardContainer = (_theme: Theme) => `
  flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden
`;

export const getHeaderContainer = (_theme: Theme) => `
  flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700
`;

export const getTitle = (_theme: Theme) => `
  text-2xl font-semibold text-slate-900 dark:text-white
`;

export const getActionContainer = (_theme: Theme) => `
  flex items-center space-x-3
`;

export const getActionButton = (_theme: Theme, variant: 'primary' | 'secondary' = 'primary') => {
  const base = "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2";
  if (variant === 'primary') {
    return `${base} bg-blue-600 text-white hover:bg-blue-700 shadow-sm`;
  }
  return `${base} bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600`;
};

export const getContentGrid = (_theme: Theme) => `
  grid grid-cols-12 gap-6 p-6 h-full overflow-y-auto
`;

export const getMainColumn = (_theme: Theme) => `
  col-span-12 lg:col-span-8 space-y-6
`;

export const getSideColumn = (_theme: Theme) => `
  col-span-12 lg:col-span-4 space-y-6
`;

export const getCard = (_theme: Theme) => `
  bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden
`;

export const getCardHeader = (_theme: Theme) => `
  px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between
`;

export const getCardTitle = (_theme: Theme) => `
  text-lg font-medium text-slate-900 dark:text-white flex items-center space-x-2
`;

export const getCardContent = (_theme: Theme) => `
  p-0
`;

export const getListItem = (_theme: Theme) => `
  flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer
`;

export const getItemTitle = (_theme: Theme) => `
  text-sm font-medium text-slate-900 dark:text-white
`;

export const getItemSubtitle = (_theme: Theme) => `
  text-xs text-slate-500 dark:text-slate-400 mt-0.5
`;

export const getStatusBadge = (_theme: Theme, status: string) => {
  const base = "px-2.5 py-0.5 rounded-full text-xs font-medium";
  switch (status.toLowerCase()) {
    case 'draft':
      return `${base} bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300`;
    case 'under_review':
      return `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`;
    case 'approved':
      return `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`;
    default:
      return `${base} bg-slate-100 text-slate-700`;
  }
};

export const getStatCard = (_theme: Theme) => `
  bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between
`;

export const getStatValue = (_theme: Theme) => `
  text-3xl font-bold text-slate-900 dark:text-white
`;

export const getStatLabel = (_theme: Theme) => `
  text-sm text-slate-500 dark:text-slate-400 mt-1
`;

export const getStatIcon = (_theme: Theme, color: 'blue' | 'amber' | 'emerald') => {
  const base = "p-3 rounded-lg";
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
  };
  return `${base} ${colors[color]}`;
};
