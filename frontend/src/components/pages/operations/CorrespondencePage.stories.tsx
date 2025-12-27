import type { Meta, StoryObj } from '@storybook/react';
import { CorrespondencePage } from './CorrespondencePage';

const meta: Meta<typeof CorrespondencePage> = {
  title: 'Components/Pages/operations/CorrespondencePage',
  component: CorrespondencePage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CorrespondencePage>;

export const Default: Story = {
  args: {
  "caseId": "Sample Text"
},
};
