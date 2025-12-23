/**
 * Docket & Filing Components - Storybook Index
 * 
 * This file provides a centralized index of all docket and filing component stories.
 * Import this file to get access to all story metadata and configurations.
 * 
 * @module stories/index
 * @category Storybook
 */

// Docket Components
export * as DocketRowStories from './DocketRow.stories';
export * as DocketTableStories from './DocketTable.stories';
export * as DocketEntryModalStories from './DocketEntryModal.stories';
export * as DocketEntryBuilderStories from './DocketEntryBuilder.stories';
export * as DocketImportModalStories from './DocketImportModal.stories';
export * as DocketFilterPanelStories from './DocketFilterPanel.stories';
export * as DocketToolbarStories from './DocketToolbar.stories';
export * as DocketStatsStories from './DocketStats.stories';
export * as DocketCalendarStories from './DocketCalendar.stories';
export * as DocketAnalyticsStories from './DocketAnalytics.stories';
export * as DocketSettingsStories from './DocketSettings.stories';
export * as DocketSheetStories from './DocketSheet.stories';
export * as DocketManagerStories from './DocketManager.stories';

// Filing Components
export * as FilingCenterStories from './FilingCenter.stories';

/**
 * Component categories for navigation
 */
export const STORY_CATEGORIES = {
  DOCKET_CORE: [
    'DocketRow',
    'DocketTable',
    'DocketToolbar',
    'DocketStats',
  ],
  DOCKET_MODALS: [
    'DocketEntryModal',
    'DocketEntryBuilder',
    'DocketImportModal',
  ],
  DOCKET_NAVIGATION: [
    'DocketFilterPanel',
    'DocketCalendar',
    'DocketAnalytics',
  ],
  DOCKET_MANAGEMENT: [
    'DocketSettings',
    'DocketSheet',
    'DocketManager',
  ],
  FILING: [
    'FilingCenter',
  ],
} as const;

/**
 * Story metadata
 */
export const STORY_METADATA = {
  totalComponents: 14,
  totalVariants: 96,
  categories: Object.keys(STORY_CATEGORIES).length,
  framework: 'Storybook 8.x',
  uiFramework: 'React 18.2.0',
  builder: 'Vite',
  generated: '2025-12-23',
} as const;

/**
 * Get all story IDs for a category
 */
export function getStoriesForCategory(category: keyof typeof STORY_CATEGORIES): readonly string[] {
  return STORY_CATEGORIES[category];
}

/**
 * Get all docket-related stories
 */
export function getAllDocketStories(): string[] {
  return [
    ...STORY_CATEGORIES.DOCKET_CORE,
    ...STORY_CATEGORIES.DOCKET_MODALS,
    ...STORY_CATEGORIES.DOCKET_NAVIGATION,
    ...STORY_CATEGORIES.DOCKET_MANAGEMENT,
  ];
}

/**
 * Get all filing-related stories
 */
export function getAllFilingStories(): string[] {
  return [...STORY_CATEGORIES.FILING];
}

/**
 * Get all story names
 */
export function getAllStories(): string[] {
  return [
    ...getAllDocketStories(),
    ...getAllFilingStories(),
  ];
}
