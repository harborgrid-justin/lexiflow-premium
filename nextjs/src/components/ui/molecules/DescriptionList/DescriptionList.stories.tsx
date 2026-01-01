import type { Meta, StoryObj } from '@storybook/react';
import { DescriptionList } from './DescriptionList';

const meta: Meta<typeof DescriptionList> = {
  title: 'Components/Molecules/DescriptionList/DescriptionList',
  component: DescriptionList,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DescriptionList>;

export const Default: Story = {
  args: {
  children: undefined,
  "className": "Sample Text"
},
};
