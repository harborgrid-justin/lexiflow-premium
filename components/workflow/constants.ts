/**
 * Constants for Workflow components
 * Extracted from individual component files for better organization and reusability
 */

/**
 * Chart color configuration based on theme mode
 */
export const getChartColors = (mode: 'light' | 'dark') => ({
  grid: mode === 'dark' ? '#334155' : '#e2e8f0',
  text: mode === 'dark' ? '#94a3b8' : '#64748b',
  tooltipBg: mode === 'dark' ? '#1e293b' : '#ffffff',
  tooltipBorder: mode === 'dark' ? '#334155' : '#e2e8f0'
});
