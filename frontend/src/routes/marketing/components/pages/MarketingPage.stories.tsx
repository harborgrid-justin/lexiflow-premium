import { MarketingPage } from './MarketingPage';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof MarketingPage> = {
  title: 'Components/Pages/user/MarketingPage',
  component: MarketingPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof MarketingPage>;

export const Default: Story = {
  args: {},
};
