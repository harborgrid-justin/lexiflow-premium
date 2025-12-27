import type { Meta, StoryObj } from '@storybook/react';
import { RulesPage } from './RulesPage';

const meta: Meta<typeof RulesPage> = {
  title: 'Components/Pages/knowledge/RulesPage',
  component: RulesPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof RulesPage>;

export const Default: Story = {
  args: {
  "onNavigate": {}
},
};
