import { PageContainerLayout } from './PageContainerLayout';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
  children: undefined,
  "className": "Sample Text",
  maxWidth: undefined
},
};
