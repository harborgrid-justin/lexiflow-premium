import type { Meta, StoryObj } from '@storybook/react-vite';
import { DynamicBreadcrumbs } from './DynamicBreadcrumbs';

const meta: Meta<typeof DynamicBreadcrumbs> = {
  title: 'Components/Molecules/DynamicBreadcrumbs/DynamicBreadcrumbs',
  component: DynamicBreadcrumbs,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DynamicBreadcrumbs>;

export const Default: Story = {
  args: {
  "items": [],
  "maxVisible": 42,
  "maxRecent": 42,
  "showHome": true,
  "onNavigate": () => {},
  "className": "Sample Text"
},
};
