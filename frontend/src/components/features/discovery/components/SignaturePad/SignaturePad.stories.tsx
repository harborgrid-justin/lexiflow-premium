import type { Meta, StoryObj } from '@storybook/react';
import { SignaturePad } from './SignaturePad';

const meta: Meta<typeof SignaturePad> = {
  title: 'Components/Organisms/SignaturePad/SignaturePad',
  component: SignaturePad,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SignaturePad>;

export const Default: Story = {
  args: {
  "value": true,
  "onChange": true,
  "label": "Sample Text",
  "subtext": "Sample Text",
  "isSigning": true
},
};
