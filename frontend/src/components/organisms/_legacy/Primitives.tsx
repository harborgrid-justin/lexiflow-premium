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

export { StatusDot, type StatusDotProps } from '@/components/atoms/StatusDot';
export { Currency, type CurrencyProps } from '@/components/atoms/Currency';
export { DateText, type DateTextProps } from '@/components/atoms/DateText';
export { FileIcon, type FileIconProps } from '@/components/atoms/FileIcon';
export { LoadingSpinner, type LoadingSpinnerProps } from '@/components/atoms/LoadingSpinner';
export { TagList, type TagListProps } from '@/components/molecules/TagList';
export { SectionHeader, type SectionHeaderProps } from '@/components/atoms/SectionHeader';
export { TruncatedText, type TruncatedTextProps } from '@/components/atoms/TruncatedText';
export { MetricCard, type MetricCardProps } from '@/components/molecules/MetricCard';
export { Box, type BoxProps } from '@/components/atoms/Box';
export { Text, type TextProps } from '@/components/atoms/Text';
export { Stack, type StackProps } from '@/components/atoms/Stack';
