import { fn } from 'storybook/test';

import { DocketToolbar } from '@/routes/cases/components/docket/DocketToolbar';

import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * DocketToolbar is a sticky toolbar component for the docket sheet that
 * displays the case title and provides quick access to add new entries.
 * 
 * ## Features
 * - Sticky positioning at top of docket view
 * - Case title display
 * - Quick add entry button
 * - Responsive layout
 * - Theme-aware styling
 */
const meta = {
  title: 'Docket/DocketToolbar',
  component: DocketToolbar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Sticky toolbar for docket sheet with case title and add entry action.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    activeCaseTitle: {
      description: 'Title of the currently active case',
      control: 'text',
    },
  },
  args: {
    onAddEntry: fn(),
  },
} satisfies Meta<typeof DocketToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default toolbar with case title
 */
export const Default: Story = {
  args: {
    activeCaseTitle: 'Smith v. Acme Corporation (2024-CV-12345)',
  },
};

/**
 * Toolbar with long case title
 */
export const LongCaseTitle: Story = {
  args: {
    activeCaseTitle: 'Johnson Industries LLC v. XYZ Corporation and Associated Entities (2024-CV-67890-ABC)',
  },
};

/**
 * Toolbar with short case title
 */
export const ShortCaseTitle: Story = {
  args: {
    activeCaseTitle: 'Doe v. Roe',
  },
};

/**
 * Toolbar without case title (multi-case view)
 */
export const NoCaseTitle: Story = {
  args: {
    activeCaseTitle: undefined,
  },
};

/**
 * Criminal case title
 */
export const CriminalCase: Story = {
  args: {
    activeCaseTitle: 'United States v. Anderson (2024-CR-11111)',
  },
};

/**
 * Complex civil litigation
 */
export const ComplexLitigation: Story = {
  args: {
    activeCaseTitle: 'In re: Class Action Securities Litigation (MDL No. 2024-1234)',
  },
};
