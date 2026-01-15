import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateText } from './DateText';

const meta: Meta<typeof DateText> = {
  title: 'Components/Atoms/DateText/DateText',
  component: DateText,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DateText>;

export const Default: Story = {
  args: {
  "date": "Sample Text",
  "className": "Sample Text",
  "icon": true
},
};
