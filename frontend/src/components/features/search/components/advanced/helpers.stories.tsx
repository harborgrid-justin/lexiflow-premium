import type { Meta, StoryObj } from '@storybook/react';
import { getCategoryIcon, sanitizeHtml } from './helpers';

// Wrapper component for stories
const HelpersDemo = () => {
  return <div>
    {getCategoryIcon('cases')}
    <p>{sanitizeHtml('<div>test</div>')}</p>
  </div>;
};

const meta: Meta<typeof HelpersDemo> = {
  title: 'Components/Organisms/helpers/helpers',
  component: HelpersDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof helpers>;

export const Default: Story = {
  args: {},
};
