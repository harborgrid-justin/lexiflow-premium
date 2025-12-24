import type { Meta, StoryObj } from '@storybook/react';
import { Box } from './Box';

const meta: Meta<typeof Box> = {
  title: 'Atoms/Box',
  component: Box,
  tags: ['autodocs'],
  argTypes: {
    spacing: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    bg: {
      control: 'select',
      options: ['primary', 'secondary', 'muted', 'accent', 'danger', 'success', 'warning'],
    },
    rounded: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'full'],
    },
    shadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    flex: {
      control: 'boolean',
    },
    direction: {
      control: 'radio',
      options: ['row', 'col'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
    },
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Default: Story = {
  args: {
    children: 'Box Content',
    spacing: 'md',
    bg: 'muted',
    rounded: 'md',
  },
};

export const FlexRow: Story = {
  args: {
    flex: true,
    gap: 'md',
    children: (
      <>
        <div className="p-2 bg-blue-200">Item 1</div>
        <div className="p-2 bg-blue-200">Item 2</div>
        <div className="p-2 bg-blue-200">Item 3</div>
      </>
    ),
  },
};

export const FlexCol: Story = {
  args: {
    flex: true,
    direction: 'col',
    gap: 'md',
    children: (
      <>
        <div className="p-2 bg-blue-200">Item 1</div>
        <div className="p-2 bg-blue-200">Item 2</div>
        <div className="p-2 bg-blue-200">Item 3</div>
      </>
    ),
  },
};

export const CardLike: Story = {
  args: {
    spacing: 'lg',
    bg: 'primary',
    rounded: 'lg',
    shadow: 'md',
    children: 'This looks like a card',
  },
};
