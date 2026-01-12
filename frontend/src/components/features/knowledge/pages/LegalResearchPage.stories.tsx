import type { Meta, StoryObj } from '@storybook/react-vite';
import { LegalResearchPage } from './LegalResearchPage';

const meta: Meta<typeof LegalResearchPage> = {
  title: 'Components/Pages/knowledge/LegalResearchPage',
  component: LegalResearchPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof LegalResearchPage>;

export const Default: Story = {
  args: {},
};
