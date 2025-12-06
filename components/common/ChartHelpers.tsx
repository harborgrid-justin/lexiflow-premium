import { useTheme } from '../../context/ThemeContext';

export const useChartTheme = () => {
  const { mode } = useTheme();
  
  const isDark = mode === 'dark';

  return {
    grid: isDark ? '#334155' : '#e2e8f0',
    text: isDark ? '#94a3b8' : '#64748b',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#e2e8f0',
    colors: {
      blue: '#3b82f6',
      purple: '#8b5cf6',
      emerald: '#10b981',
      amber: '#f59e0b',
      rose: '#ef4444',
      slate: isDark ? '#94a3b8' : '#64748b'
    },
    tooltipStyle: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        color: isDark ? '#f8fafc' : '#1e293b'
    }
  };
};