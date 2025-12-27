import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Molecules/Accordion/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  args: {
  "title": "<div>Sample Content</div>",
  "children": "<div>Sample Content</div>",
  "defaultOpen": true,
  "className": "Sample Text",
  "actions": "<div>Sample Content</div>"
},
};
