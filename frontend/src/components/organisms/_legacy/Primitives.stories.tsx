import type { Meta, StoryObj } from '@storybook/react-vite';

// This module has no exports. Story disabled.
const DisabledStory = () => <div>No primitives exported from this file</div>;

const meta: Meta<typeof DisabledStory> = {
  title: 'Components/Organisms/_legacy/Primitives',
  component: DisabledStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DisabledStory>;

export const Default: Story = {
  args: {},
};
