import type { Meta, StoryObj } from '@storybook/react-vite';
import { RuleSelector } from './RuleSelector';

const meta: Meta<typeof RuleSelector> = {
  title: 'Components/Molecules/RuleSelector/RuleSelector',
  component: RuleSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof RuleSelector>;

export const Default: Story = {
  args: {
  "selectedRules": [],
  "onRulesChange": () => {},
  "readOnly": true
},
};
