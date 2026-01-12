import type { Meta, StoryObj } from '@storybook/react-vite';
import { SwipeableItem } from './SwipeableItem';

const meta: Meta<typeof SwipeableItem> = {
  title: 'Components/Organisms/SwipeableItem/SwipeableItem',
  component: SwipeableItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SwipeableItem>;

export const Default: Story = {
  args: {
  children: undefined,
  onSwipeLeft: () => {},
  onSwipeRight: () => {},
  "leftActionLabel": "Sample Text",
  "rightActionLabel": "Sample Text",
  "leftActionColor": "Sample Text",
  "rightActionColor": "Sample Text",
  "disabled": true
},
};
