import type { Meta, StoryObj } from '@storybook/react-vite';
import { JurisdictionPage } from './JurisdictionPage';

const meta: Meta<typeof JurisdictionPage> = {
  title: 'Components/Pages/knowledge/JurisdictionPage',
  component: JurisdictionPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof JurisdictionPage>;

export const Default: Story = {
  args: {},
};
