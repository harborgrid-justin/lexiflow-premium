import type { Meta, StoryObj } from '@storybook/react';
import { SectionTitle } from './SectionTitle';

const meta: Meta<typeof SectionTitle> = {
  title: 'Atoms/SectionTitle',
  component: SectionTitle,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SectionTitle>;

export const Default: Story = {
  args: {},
};
