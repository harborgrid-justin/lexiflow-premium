import type { Meta, StoryObj } from '@storybook/react';
import { RefactoredCommon } from './RefactoredCommon';

const meta: Meta<typeof RefactoredCommon> = {
  title: 'Components/Organisms/_legacy/RefactoredCommon',
  component: RefactoredCommon,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof RefactoredCommon>;

export const Default: Story = {
  args: {},
};
