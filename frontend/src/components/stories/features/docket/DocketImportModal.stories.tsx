import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DocketImportModal } from '@/features/cases/components/docket/DocketImportModal';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';

/**
 * DocketImportModal provides a multi-step wizard for importing docket data
 * from various sources including text parsing and XML/JSON files.
 * 
 * ## Features
 * - Multi-step import wizard
 * - Text-based docket parsing with AI
 * - XML/JSON file import
 * - Preview and validation
 * - Confidence scoring
 * - Warning messages for ambiguous data
 * - Batch import capabilities
 */
const meta = {
  title: 'Docket/DocketImportModal',
  component: DocketImportModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Multi-step modal wizard for importing docket data from text or XML with AI parsing and preview.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="w-screen h-screen flex items-center justify-center">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    isOpen: {
      description: 'Whether the modal is open',
      control: 'boolean',
    },
  },
  args: {
    onClose: fn(),
    onImport: fn(),
  },
} satisfies Meta<typeof DocketImportModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Modal opened at step 1 (source selection)
 */
export const Default: Story = {
  args: {
    isOpen: true,
  },
};

/**
 * Closed modal state
 */
export const Closed: Story = {
  args: {
    isOpen: false,
  },
};

/**
 * Importing from text source
 * 
 * Example workflow:
 * 1. Select text import mode
 * 2. Paste docket text
 * 3. Parse with AI
 * 4. Preview results
 * 5. Confirm import
 */
export const TextImportMode: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Import docket entries from plain text using AI parsing. Supports various court formats including PACER, state court systems, and custom formats.',
      },
    },
  },
};

/**
 * Importing from XML/JSON file
 * 
 * Example workflow:
 * 1. Select XML import mode
 * 2. Upload XML file
 * 3. Parse structure
 * 4. Preview results
 * 5. Confirm import
 */
export const XMLImportMode: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Import docket entries from structured XML or JSON files. Supports PACER XML format and custom schemas.',
      },
    },
  },
};

/**
 * Large batch import scenario
 */
export const BatchImport: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Import multiple docket entries at once from court electronic filing systems or case management exports.',
      },
    },
  },
};
