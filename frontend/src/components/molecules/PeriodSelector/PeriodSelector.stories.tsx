import { PeriodSelector } from './PeriodSelector';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof PeriodSelector> = {
  title: 'Components/Molecules/PeriodSelector/PeriodSelector',
  component: PeriodSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PeriodSelector>;

export const Default: Story = {
  args: {
  "periods": [],
  "selected": "Sample Text",
  "onChange": () => {},
  "className": "Sample Text"
},
};
