import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryConsole } from '@/features/admin/components/data/QueryConsole';

/**
 * QueryConsole provides advanced database query interface for administrators
 * with SQL editor, query builder, and data exploration tools.
 * 
 * ## Features
 * - SQL query editor
 * - Visual query builder
 * - Query history
 * - Result export
 * - Schema browser
 * - Query optimization
 * - Saved queries
 * - Data visualization
 * - Performance analytics
 * - Transaction management
 */
const meta = {
  title: 'Pages/Query Console',
  component: QueryConsole,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Advanced database query interface with SQL editor and visual query builder.',
      },
    },
  },
  tags: ['autodocs', 'page']
} satisfies Meta<typeof QueryConsole>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default query console view
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
