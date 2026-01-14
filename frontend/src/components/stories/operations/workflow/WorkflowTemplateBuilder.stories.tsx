import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkflowTemplateBuilder } from '@/routes/cases/components/workflow/WorkflowTemplateBuilder';

/**
 * WorkflowTemplateBuilder provides visual workflow design tools for creating
 * reusable matter management workflows with automated task assignment and routing.
 * 
 * ## Features
 * - Visual workflow designer
 * - Drag-and-drop task creation
 * - Conditional logic builder
 * - Task dependency mapping
 * - Automated notifications
 * - Deadline calculation rules
 * - Template library
 * - Version control
 * - Testing and validation
 * - Approval routing
 */
const meta = {
  title: 'Pages/Workflow Template Builder',
  component: WorkflowTemplateBuilder,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Visual workflow design tool for creating automated matter management workflows.',
      },
    },
  },
  tags: ['autodocs', 'page']
} satisfies Meta<typeof WorkflowTemplateBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default workflow builder view
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
