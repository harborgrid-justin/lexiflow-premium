import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { FilingCenter } from '@features/litigation/pleadings/modules/FilingCenter';
import { ThemeProvider } from '@/providers';

/**
 * FilingCenter provides a pre-flight check interface and export capabilities
 * for finalizing documents for court submission.
 * 
 * ## Features
 * - Pre-flight validation checks
 * - Jurisdiction format verification
 * - Signature block validation
 * - Content review status
 * - PDF-A generation (court-ready)
 * - DOCX export
 * - E-filing preparation
 * - Service certificate generation
 */
const meta = {
  title: 'Filing/FilingCenter',
  component: FilingCenter,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Filing & Service Center for court document submission with pre-flight checks and export.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="w-96 h-[600px] bg-white rounded-lg shadow-lg">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    isReady: {
      description: 'Whether the document is ready for filing (all checks passed)',
      control: 'boolean',
    },
  },
  args: {
    onExport: fn(),
  },
} satisfies Meta<typeof FilingCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Document ready for filing with all checks passed
 */
export const ReadyToFile: Story = {
  args: {
    isReady: true,
  },
};

/**
 * Document pending review (content not yet approved)
 */
export const PendingReview: Story = {
  args: {
    isReady: false,
  },
};

/**
 * Light theme variant
 */
export const LightTheme: Story = {
  args: {
    isReady: true,
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="w-96 h-[600px] bg-white rounded-lg shadow-lg">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * Dark theme variant
 */
export const DarkTheme: Story = {
  args: {
    isReady: true,
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="w-96 h-[600px] bg-slate-900 rounded-lg shadow-lg">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * Wide layout for desktop
 */
export const WideLayout: Story = {
  args: {
    isReady: true,
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="w-[600px] h-[700px] bg-white rounded-lg shadow-lg">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  args: {
    isReady: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="w-full max-w-sm h-screen bg-white">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * Tablet responsive view
 */
export const Tablet: Story = {
  args: {
    isReady: false,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="w-full max-w-md h-screen bg-white">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * Integration with pleading builder workflow
 */
export const InPleadingWorkflow: Story = {
  args: {
    isReady: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'FilingCenter as part of the pleading builder workflow, after document composition is complete.',
      },
    },
  },
};
