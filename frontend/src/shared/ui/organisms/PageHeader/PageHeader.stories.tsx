import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageHeader } from './PageHeader';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/Organisms/PageHeader/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
  "title": "Sample Text",
  "subtitle": "Sample Text",
  actions: undefined,
  "className": "Sample Text"
},
};
