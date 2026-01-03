import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CategoryFilter, SuggestionItem } from './SearchComponents';
import { useTheme } from '@/providers';
import type { SearchCategory } from './types';

const DemoComponent = () => {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = React.useState<SearchCategory>('all');

  return (
    <div className="p-4 space-y-4">
      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        theme={theme}
      />
      <SuggestionItem
        suggestion={{ text: 'Example suggestion' }}
        isSelected={false}
        onClick={() => {}}
        theme={theme}
      />
    </div>
  );
};

const meta: Meta<typeof DemoComponent> = {
  title: 'Components/Organisms/search/SearchComponents',
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
