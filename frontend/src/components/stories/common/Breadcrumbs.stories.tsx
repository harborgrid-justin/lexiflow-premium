import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs } from '@/shared/ui/molecules/Breadcrumbs/Breadcrumbs';
import React from "react";

/**
 * Breadcrumbs component for navigation hierarchy.
 */

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Common/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Breadcrumb navigation showing the current page hierarchy.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of breadcrumb items',
    },
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoLevels: Story = {
  args: {
    items: [
      { label: 'Home', onClick: () => console.log('Home clicked') },
      { label: 'Cases', onClick: () => console.log('Cases clicked') },
    ],
  },
};

export const ThreeLevels: Story = {
  args: {
    items: [
      { label: 'Home', onClick: () => console.log('Home clicked') },
      { label: 'Cases', onClick: () => console.log('Cases clicked') },
      { label: 'Smith v. Jones', onClick: () => console.log('Case clicked') },
    ],
  },
};

export const FourLevels: Story = {
  args: {
    items: [
      { label: 'Home', onClick: () => console.log('Home clicked') },
      { label: 'Cases', onClick: () => console.log('Cases clicked') },
      { label: 'Smith v. Jones', onClick: () => console.log('Case clicked') },
      { label: 'Documents', onClick: () => console.log('Documents clicked') },
    ],
  },
};
