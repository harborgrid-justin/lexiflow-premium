import type { Meta, StoryObj } from '@storybook/react';
import { CaseListPage } from './CaseListPage';

const meta: Meta<typeof CaseListPage> = {
  title: 'Components/Pages/cases/CaseListPage',
  component: CaseListPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CaseListPage>;

export const Default: Story = {
  args: {
  "onSelectCase": "Sample Text"
},
};
