import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms/Table';
import { ThemeProvider } from '@/providers/ThemeContext';
import React from "react";

/**
 * Table component for displaying tabular data.
 */

const TableDemo = ({ data, columns, selectable: _selectable, onRowClick }: any) => {
  return (
    <TableContainer>
      <TableHeader>
        {columns.map((col: any) => (
          <TableHead key={col.key}>{col.header}</TableHead>
        ))}
      </TableHeader>
      <TableBody>
        {data.map((row: any) => (
          <TableRow key={row.id} onClick={onRowClick ? () => onRowClick(row) : undefined}>
            {columns.map((col: any) => (
              <TableCell key={col.key}>{row[col.key]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </TableContainer>
  );
};

const meta: Meta<typeof TableDemo> = {
  title: 'Common/Table',
  component: TableDemo,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Responsive table component with sorting and selection capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: 'Array of data objects',
    },
    columns: {
      control: 'object',
      description: 'Column definitions',
    },
    selectable: {
      control: 'boolean',
      description: 'Enable row selection',
    },
    onRowClick: {
      action: 'rowClick',
      description: 'Callback when a row is clicked',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="p-8 bg-white dark:bg-slate-900">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TableDemo>;

const sampleData = [
  { id: '1', caseName: 'Smith v. Jones', status: 'Active', date: '2024-01-15' },
  { id: '2', caseName: 'Doe v. Corporation', status: 'Pending', date: '2024-02-20' },
  { id: '3', caseName: 'Johnson v. State', status: 'Closed', date: '2023-12-10' },
];

const columns = [
  { key: 'caseName', header: 'Case Name', sortable: true },
  { key: 'status', header: 'Status', sortable: true },
  { key: 'date', header: 'Date', sortable: true },
];

export const Default: Story = {
  args: {
    data: sampleData,
    columns: columns,
  },
};

export const WithSelection: Story = {
  args: {
    data: sampleData,
    columns: columns,
    selectable: true,
  },
};
