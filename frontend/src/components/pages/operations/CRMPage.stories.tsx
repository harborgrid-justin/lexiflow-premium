import type { Meta, StoryObj } from '@storybook/react';
import { CRMPage } from './CRMPage';

const meta: Meta<typeof CRMPage> = {
  title: 'Components/Pages/operations/CRMPage',
  component: CRMPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CRMPage>;

export const Default: Story = {
  args: {},
};
