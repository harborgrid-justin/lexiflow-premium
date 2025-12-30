import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@/providers/ToastContext';

/**
 * MatterOperationsCenter provides centralized matter operations management including
 * workflow orchestration, team coordination, and resource allocation.
 * 
 * ## Features
 * - Workflow management
 * - Team coordination
 * - Resource allocation
 * - Task management
 * - Deadline tracking
 * - Document organization
 * - Communication hub
 * - Status reporting
 * - Milestone tracking
 * - Automation rules
 */
const meta = {
  title: 'Pages/Matter Operations Center',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Matter operations management with workflow orchestration and team coordination.',
      },
    },
  },
  tags: ['autodocs', 'page'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <ToastProvider>
          <div className="h-screen w-screen">
            <Story />
          </div>
        </ToastProvider>
      </ThemeProvider>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default matter operations view
 */
export const Default: Story = {};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Tablet responsive view
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
