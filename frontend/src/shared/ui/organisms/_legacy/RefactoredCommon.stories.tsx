import type { Meta, StoryObj } from '@storybook/react';
import { EmptyListState, SearchInputBar, ActionRow, StatusBadge, SectionTitle, MetricTile } from './RefactoredCommon';

const DemoComponent = () => (
  <div className="p-4 space-y-4">
    <EmptyListState title="No items found" message="Try adjusting your filters" />
    <SearchInputBar placeholder="Search..." />
    <ActionRow><button>Action 1</button><button>Action 2</button></ActionRow>
    <StatusBadge status="Active" variant="success" />
    <SectionTitle title="Section" subtitle="Description" />
    <MetricTile label="Total" value="42" />
  </div>
);

const meta: Meta<typeof DemoComponent> = {
  title: 'Components/Organisms/_legacy/RefactoredCommon',
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
