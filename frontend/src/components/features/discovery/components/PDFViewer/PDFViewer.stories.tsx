import type { Meta, StoryObj } from '@storybook/react';
import { PDFViewer } from './PDFViewer';

const meta: Meta<typeof PDFViewer> = {
  title: 'Components/Organisms/PDFViewer/PDFViewer',
  component: PDFViewer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PDFViewer>;

export const Default: Story = {
  args: {
  "url": "Sample Text",
  "scale": 42,
  "rotation": 42,
  "onPageLoad": 42
},
};
