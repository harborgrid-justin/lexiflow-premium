import type { Meta, StoryObj } from '@storybook/react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table';

const TableDemo = () => {
  return (
    <TableContainer>
      <TableHeader>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Role</TableHead>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell>Admin</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jane Smith</TableCell>
          <TableCell>jane@example.com</TableCell>
          <TableCell>User</TableCell>
        </TableRow>
      </TableBody>
    </TableContainer>
  );
};

const meta: Meta<typeof TableDemo> = {
  title: 'Organisms/Table',
  component: TableDemo,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TableDemo>;

export const Default: Story = {
  args: {},
};
