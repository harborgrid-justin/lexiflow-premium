import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatabaseManagement } from '@/features/admin/components/data/DatabaseManagement';
import { ThemeProvider } from '@/features/theme';
import { ToastProvider } from '@/providers';

const meta = {
  title: 'Pages/Database Management',
  component: DatabaseManagement,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs', 'page']
} satisfies Meta<typeof DatabaseManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Tablet: Story = { parameters: { viewport: { defaultViewport: 'tablet' } } };
