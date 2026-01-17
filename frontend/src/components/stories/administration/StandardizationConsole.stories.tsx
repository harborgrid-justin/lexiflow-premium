import { StandardizationConsole } from '@/routes/admin/components/data/quality/StandardizationConsole';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Pages/Standardization Console',
  component: StandardizationConsole,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs', 'page']
} satisfies Meta<typeof StandardizationConsole>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Tablet: Story = { parameters: { viewport: { defaultViewport: 'tablet' } } };
