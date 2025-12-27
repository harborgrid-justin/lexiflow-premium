import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Molecules/Card/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
  "children": "<div>Sample Content</div>",
  "className": "Sample Text",
  "noPadding": true,
  "title": "<div>Sample Content</div>",
  "subtitle": "Sample Text",
  "action": "<div>Sample Content</div>",
  "footer": "<div>Sample Content</div>"
},
};
