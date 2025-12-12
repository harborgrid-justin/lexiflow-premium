
/**
 * centralized formatting utilities to reduce code duplication
 * and ensure consistency across the application.
 */

export const Formatters = {
  /**
   * Standardized currency formatter
   */
  currency: (amount: number | string | undefined, currency: string = 'USD', locale: string = 'en-US'): string => {
    const num = Number(amount);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  },

  /**
   * Standardized date formatter (YYYY-MM-DD or Localized)
   */
  date: (date: string | Date | undefined, options?: Intl.DateTimeFormatOptions): string => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    
    if (options) {
      return d.toLocaleDateString('en-US', options);
    }
    // Default ISO-like YYYY-MM-DD for consistency in tables
    return d.toISOString().split('T')[0];
  },

  /**
   * File size formatter
   */
  fileSize: (bytes: number, decimals = 2): string => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  },

  /**
   * Capitalize first letter
   */
  capitalize: (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
};
