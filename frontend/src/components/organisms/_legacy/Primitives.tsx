/**
 * @module components/common/Primitives
 * @category Common Components - UI Primitives
 * @description DEPRECATED - Use individual imports from components/common/primitives/ instead
 * 
 * This file maintains backward compatibility by re-exporting all primitives.
 * New code should import directly from the primitives/ subdirectory.
 * 
 * @deprecated Import from 'components/components/atoms' instead
 * 
 * @example
 * // ❌ Old way (still works but deprecated)
 * import { StatusDot, Currency } from './components/components/atoms';
 * 
 * // ✅ New way (preferred)
 * import { StatusDot, Currency } from './components/components/atoms';
 */

export { StatusDot, type StatusDotProps } from '../../atoms/StatusDot';
export { Currency, type CurrencyProps } from '../../atoms/Currency';
export { DateText, type DateTextProps } from '../../atoms/DateText';
export { FileIcon, type FileIconProps } from '../../atoms/FileIcon';
export { LoadingSpinner, type LoadingSpinnerProps } from '../../atoms/LoadingSpinner';
export { TagList, type TagListProps } from '../../molecules/TagList';
export { SectionHeader, type SectionHeaderProps } from '../../atoms/SectionHeader';
export { TruncatedText, type TruncatedTextProps } from '../../atoms/TruncatedText';
export { MetricCard, type MetricCardProps } from '../../molecules/MetricCard';
export { Box, type BoxProps } from '../../atoms/Box';
export { Text, type TextProps } from '../../atoms/Text';
export { Stack, type StackProps } from '../../atoms/Stack';
