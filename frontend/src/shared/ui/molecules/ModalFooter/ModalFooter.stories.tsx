import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModalFooter } from './ModalFooter';

const meta: Meta<typeof ModalFooter> = {
  title: 'Components/Molecules/ModalFooter/ModalFooter',
  component: ModalFooter,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ModalFooter>;

export const Default: Story = {
  args: {
  children: undefined
},
};
