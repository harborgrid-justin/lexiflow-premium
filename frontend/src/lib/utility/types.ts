/**
 * Utility Provider Types
 * Type definitions for utility context
 *
 * @module lib/utility/types
 */

export interface UtilityValue {
  // Date/Time utilities
  formatDate: (date: Date | string, format?: string) => string;
  parseDate: (dateString: string) => Date | null;
  formatRelativeTime: (date: Date | string) => string;

  // String utilities
  truncate: (text: string, maxLength: number) => string;
  capitalize: (text: string) => string;
  slugify: (text: string) => string;

  // Number utilities
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (num: number, decimals?: number) => string;

  // File utilities
  formatFileSize: (bytes: number) => string;
  getFileExtension: (filename: string) => string;

  // Validation utilities
  isValidEmail: (email: string) => boolean;
  isValidUrl: (url: string) => boolean;

  // Copy utilities
  copyToClipboard: (text: string) => Promise<boolean>;

  // DOM utilities
  downloadFile: (blob: Blob, filename: string) => void;
  openInNewTab: (url: string) => void;
}

export interface UtilityProviderProps {
  children: React.ReactNode;
}
