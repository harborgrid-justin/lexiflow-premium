import type { Meta, StoryObj } from '@storybook/react';
import { CaseIntakePage } from './CaseIntakePage';

const meta: Meta<typeof CaseIntakePage> = {
  title: 'Components/Pages/cases/CaseIntakePage',
  component: CaseIntakePage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CaseIntakePage>;

export const Default: Story = {
  args: {
  "onComplete": "Sample Text",
  "onCancel": {}
},
};
