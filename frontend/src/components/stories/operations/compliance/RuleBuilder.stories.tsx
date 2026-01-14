import { RuleBuilder } from '@/routes/admin/components/data/quality/RuleBuilder';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Pages/Rule Builder',
  component: RuleBuilder,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs', 'page']
} satisfies Meta<typeof RuleBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSave: (rule) => console.log('Rule saved:', rule),
    onCancel: () => console.log('Rule creation cancelled'),
  },
};

export const Mobile: Story = {
  args: {
    onSave: (rule) => console.log('Rule saved:', rule),
    onCancel: () => console.log('Rule creation cancelled'),
  },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const Tablet: Story = {
  args: {
    onSave: (rule) => console.log('Rule saved:', rule),
    onCancel: () => console.log('Rule creation cancelled'),
  },
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
