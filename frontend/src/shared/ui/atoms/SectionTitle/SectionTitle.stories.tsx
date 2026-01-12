import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionTitle } from './SectionTitle';

const meta: Meta<typeof SectionTitle> = {
  title: 'Components/Atoms/SectionTitle/SectionTitle',
  component: SectionTitle,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SectionTitle>;

export const Default: Story = {
  args: {
  children: undefined,
  "className": "Sample Text"
},
};
