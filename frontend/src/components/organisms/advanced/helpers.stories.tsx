import type { Meta, StoryObj } from '@storybook/react';
import { getCategoryIcon, sanitizeHtml } from './helpers';

// This module exports helper functions, not components. Story disabled.
const DemoComponent = () => (
  <div className="p-4">
    <div className="mb-4">
      <h3>Category Icons:</h3>
      <div className="flex gap-2">
        {(['cases', 'documents', 'people', 'dates', 'tags'] as const).map(cat => (
          <div key={cat} className="flex items-center gap-1">
            {getCategoryIcon(cat)}
            <span>{cat}</span>
          </div>
        ))}
      </div>
    </div>
    <div>
      <h3>HTML Sanitization:</h3>
      <p>{sanitizeHtml('<mark>Highlighted</mark> text')}</p>
    </div>
  </div>
);

const meta: Meta<typeof DemoComponent> = {
  title: 'Components/Organisms/search/helpers',
  component: DemoComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DemoComponent>;

export const Default: Story = {
  args: {},
};
