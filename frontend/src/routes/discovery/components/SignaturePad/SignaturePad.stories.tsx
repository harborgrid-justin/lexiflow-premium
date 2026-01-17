import { SignaturePad } from './SignaturePad';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
  "onChange": () => {},
  "label": "Sample Text",
  "subtext": "Sample Text",
  "isSigning": true
},
};
