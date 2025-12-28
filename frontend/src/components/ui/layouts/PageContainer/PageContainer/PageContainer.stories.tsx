import type { Meta, StoryObj } from '@storybook/react';
import { PageContainer } from './PageContainer';

const meta: Meta<typeof PageContainer> = {
  title: 'Components/Templates/PageContainer/PageContainer',
  component: PageContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PageContainer>;

export const Default: Story = {
  args: {
  "children": "<div>Sample Content</div>",
  "className": "Sample Text"
},
};
