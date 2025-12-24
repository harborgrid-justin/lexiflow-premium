/**
 * formatUtils.ts
 * 
 * Number and currency formatting utilities
 * Replaces repeated toLocaleString patterns
 */

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Format number as currency with no decimals
 * Replaces: value.toLocaleString(undefined, {maximumFractionDigits: 0})
 */
export const formatCurrency = (value: number, includeSign = true): string => {
  const formatted = value.toLocaleString('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  });
  return includeSign ? `$${formatted}` : formatted;
};

/**
 * Format number as currency with 2 decimals
 */
export const formatCurrencyPrecise = (value: number, includeSign = true): string => {
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return includeSign ? `$${formatted}` : formatted;
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatCompactCurrency = (value: number, includeSign = true): string => {
  const absValue = Math.abs(value);
  let formatted: string;

  if (absValue >= 1000000000) {
    formatted = `${(value / 1000000000).toFixed(1)}B`;
  } else if (absValue >= 1000000) {
    formatted = `${(value / 1000000).toFixed(1)}M`;
  } else if (absValue >= 1000) {
    formatted = `${(value / 1000).toFixed(1)}K`;
  } else {
    formatted = value.toFixed(0);
  }

  return includeSign ? `$${formatted}` : formatted;
};

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format number with thousands separators
 */
export const formatNumber = (value: number, decimals = 0): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Format percentage
 */
export const formatPercent = (value: number, decimals = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// ============================================================================
// TEXT FORMATTING
// ============================================================================

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Pluralize word based on count
 */
export const pluralize = (count: number, singular: string, plural?: string): string => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};

/**
 * Format count with label
 */
export const formatCount = (count: number, singular: string, plural?: string): string => {
  return `${count} ${pluralize(count, singular, plural)}`;
};

// ============================================================================
// PHONE & EMAIL FORMATTING
// ============================================================================

/**
 * Format phone number (US)
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Mask email for privacy
 */
export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local.length > 3
    ? `${local.slice(0, 2)}...${local.slice(-1)}`
    : local;
  return `${maskedLocal}@${domain}`;
};
