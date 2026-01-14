import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingPage } from './MarketingPage';

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
