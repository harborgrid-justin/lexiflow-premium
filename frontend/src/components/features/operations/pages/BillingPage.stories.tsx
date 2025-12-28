import type { Meta, StoryObj } from '@storybook/react';
import { BillingPage } from './BillingPage';

const meta: Meta<typeof BillingPage> = {
  title: 'Components/Pages/operations/BillingPage',
  component: BillingPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof BillingPage>;

export const Default: Story = {
  args: {
  "navigateTo": "Sample Text",
  "initialTab": "Sample Text"
},
};
