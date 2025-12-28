import type { Meta, StoryObj } from '@storybook/react';
import { EnhancedSearch } from './EnhancedSearch.old';

const meta: Meta<typeof EnhancedSearch> = {
  title: 'Components/Organisms/_legacy/EnhancedSearch',
  component: EnhancedSearch,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof EnhancedSearch.old>;

export const Default: Story = {
  args: {
  "placeholder": "Sample Text",
  "suggestions": [],
  "onSearch": "Sample Text",
  "onSuggestionSelect": {},
  "debounceDelay": 42,
  "showCategories": true,
  "showSyntaxHints": true,
  "maxSuggestions": 42,
  "autoFocus": true,
  "className": "Sample Text"
},
};
