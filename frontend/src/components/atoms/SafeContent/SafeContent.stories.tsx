import { SafeContent } from './SafeContent';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof SafeContent> = {
  title: 'Components/Atoms/SafeContent/SafeContent',
  component: SafeContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SafeContent>;

export const Default: Story = {
  args: {
  "content": "Sample Text",
  "as": undefined,
  "className": "Sample Text"
},
};
