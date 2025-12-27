import type { Meta, StoryObj } from '@storybook/react';
import { PageContainerLayout } from './PageContainerLayout';

const meta: Meta<typeof PageContainerLayout> = {
  title: 'Components/Layouts/PageContainerLayout/PageContainerLayout',
  component: PageContainerLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PageContainerLayout>;

export const Default: Story = {
  args: {
  "children": "<div>Sample Content</div>",
  "className": "Sample Text",
  "maxWidth": {}
},
};
