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

export { StatusDot, type StatusDotProps } from './primitives/StatusDot';
export { Currency, type CurrencyProps } from './primitives/Currency';
export { DateText, type DateTextProps } from './primitives/DateText';
export { FileIcon, type FileIconProps } from './primitives/FileIcon';
export { LoadingSpinner, type LoadingSpinnerProps } from './primitives/LoadingSpinner';
export { TagList, type TagListProps } from './primitives/TagList';
export { SectionHeader, type SectionHeaderProps } from './primitives/SectionHeader';
export { TruncatedText, type TruncatedTextProps } from './primitives/TruncatedText';
export { MetricCard, type MetricCardProps } from './primitives/MetricCard';
