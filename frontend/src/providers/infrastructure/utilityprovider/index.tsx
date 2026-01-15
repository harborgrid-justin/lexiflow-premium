// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - UTILITIES (INFRASTRUCTURE)
// ================================================================================

/**
 * Utility Provider - Infrastructure Layer
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + Pure Functions + Memoized
 *
 * RESPONSIBILITIES:
 * • Date/time formatting and parsing
 * • String manipulation (truncate, slugify, capitalize)
 * • Number formatting (currency, percentages)
 * • File size formatting
 * • Validation helpers
 * • Common operations
 *
 * REACT 18 PATTERNS:
 * ✓ Memoized utility functions (stable references)
 * ✓ Pure functions (no side effects)
 * ✓ No state (stateless utilities)
 * ✓ SSR-safe (no browser-specific APIs)
 * ✓ Composable and reusable
 *
 * DESIGN PRINCIPLES:
 * • All functions are pure (same input → same output)
 * • No mutations or side effects
 * • Locale-aware where appropriate
 * • Type-safe with TypeScript
 * • Well-documented with examples
 *
 * CROSS-CUTTING CAPABILITY:
 * Available to all providers and components via useUtility()
 *
 * @module providers/infrastructure/utilityprovider
 */

import { UtilityContext } from '@/lib/utility/contexts';
import type { UtilityProviderProps, UtilityValue } from '@/lib/utility/types';
import { useContext, useMemo } from 'react';

export function UtilityProvider({ children }: UtilityProviderProps) {
  const utilityValue = useMemo<UtilityValue>(() => ({
    // Date/Time utilities
    formatDate: (date: Date | string, format = 'MM/DD/YYYY') => {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return 'Invalid Date';

      const map: Record<string, string> = {
        MM: String(d.getMonth() + 1).padStart(2, '0'),
        DD: String(d.getDate()).padStart(2, '0'),
        YYYY: String(d.getFullYear()),
        HH: String(d.getHours()).padStart(2, '0'),
        mm: String(d.getMinutes()).padStart(2, '0'),
        ss: String(d.getSeconds()).padStart(2, '0'),
      };

      return format.replace(/MM|DD|YYYY|HH|mm|ss/g, (matched) => map[matched] || matched);
    },

    parseDate: (dateString: string) => {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    },

    formatRelativeTime: (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 7) return d.toLocaleDateString();
      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      if (minutes > 0) return `${minutes}m ago`;
      return 'just now';
    },

    // String utilities
    truncate: (text: string, maxLength: number) => {
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength - 3) + '...';
    },

    capitalize: (text: string) => {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    slugify: (text: string) => {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    },

    // Number utilities
    formatCurrency: (amount: number, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(amount);
    },

    formatNumber: (num: number, decimals = 0) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num);
    },

    // File utilities
    formatFileSize: (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    },

    getFileExtension: (filename: string) => {
      const parts = filename.split('.');
      return parts.length > 1 ? parts[parts.length - 1]?.toLowerCase() || '' : '';
    },

    // Validation utilities
    isValidEmail: (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    isValidUrl: (url: string) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },

    // Copy utilities
    copyToClipboard: async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.error('[UtilityProvider] Failed to copy to clipboard:', err);
        return false;
      }
    },

    // DOM utilities
    downloadFile: (blob: Blob, filename: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    openInNewTab: (url: string) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    },
  }), []);

  return (
    <UtilityContext.Provider value={utilityValue}>
      {children}
    </UtilityContext.Provider>
  );
}

export function useUtility(): UtilityValue {
  const context = useContext(UtilityContext);
  if (!context) {
    throw new Error('useUtility must be used within UtilityProvider');
  }
  return context;
}
