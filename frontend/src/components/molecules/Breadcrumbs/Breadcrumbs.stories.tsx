import { Breadcrumbs } from './Breadcrumbs';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/Molecules/Breadcrumbs/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  args: {},
};
