import type { Meta, StoryObj } from '@storybook/react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table';

const DemoTable = () => (
  <TableContainer>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Item 1</TableCell>
        <TableCell>Active</TableCell>
      </TableRow>
    </TableBody>
  </TableContainer>
);

const meta: Meta<typeof DemoTable> = {
  title: 'Components/Organisms/Table/Table',
  component: DemoTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DemoTable>;

export const Default: Story = {
  args: {},
};
