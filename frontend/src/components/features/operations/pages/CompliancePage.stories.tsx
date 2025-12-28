import type { Meta, StoryObj } from '@storybook/react';
import { CompliancePage } from './CompliancePage';

const meta: Meta<typeof CompliancePage> = {
  title: 'Components/Pages/operations/CompliancePage',
  component: CompliancePage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CompliancePage>;

export const Default: Story = {
  args: {
  "initialTab": {}
},
};
