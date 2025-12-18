/**
 * @module components/common/Primitives
 * @category Common Components - UI Primitives
 * @description DEPRECATED - Use individual imports from components/common/primitives/ instead
 * 
 * This file maintains backward compatibility by re-exporting all primitives.
 * New code should import directly from the primitives/ subdirectory.
 * 
 * @deprecated Import from 'components/common/primitives' instead
 * 
 * @example
 * // ❌ Old way (still works but deprecated)
 * import { StatusDot, Currency } from './components/common/Primitives';
 * 
 * // ✅ New way (preferred)
 * import { StatusDot, Currency } from './components/common/primitives';
 */

export {
  StatusDot,
  Currency,
  DateText,
  FileIcon,
  LoadingSpinner,
  TagList,
  SectionHeader,
  TruncatedText,
  MetricCard
} from './primitives';

export type {
  StatusDotProps,
  CurrencyProps,
  DateTextProps,
  FileIconProps,
  LoadingSpinnerProps,
  TagListProps,
  SectionHeaderProps,
  TruncatedTextProps,
  MetricCardProps
} from './primitives';
