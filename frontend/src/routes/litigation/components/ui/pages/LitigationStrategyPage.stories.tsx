import type { Meta, StoryObj } from '@storybook/react-vite';
import { LitigationStrategyPage } from './LitigationStrategyPage';

const meta: Meta<typeof LitigationStrategyPage> = {
  title: 'Components/Pages/litigation/LitigationStrategyPage',
  component: LitigationStrategyPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof LitigationStrategyPage>;

export const Default: Story = {
  args: {
  "caseId": "Sample Text"
},
};
