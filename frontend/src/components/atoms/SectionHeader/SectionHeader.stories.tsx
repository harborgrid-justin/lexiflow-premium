import { SectionHeader } from './SectionHeader';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof SectionHeader> = {
  title: 'Components/Atoms/SectionHeader/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const Default: Story = {
  args: {
  "title": "Sample Text",
  "subtitle": "Sample Text",
  action: undefined
},
};
