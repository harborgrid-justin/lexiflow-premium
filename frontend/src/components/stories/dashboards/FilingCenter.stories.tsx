import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { FilingCenter } from '@features/litigation/pleadings/modules/FilingCenter';

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
  }
};

/**
 * Dark theme variant
 */
export const DarkTheme: Story = {
  args: {
    isReady: true,
  }
};

/**
 * Wide layout for desktop
 */
export const WideLayout: Story = {
  args: {
    isReady: true,
  }
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
  }
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
  }
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
