import { DocketEntryBuilder } from '@/features/cases/components/docket/DocketEntryBuilder';
import { ToastProvider } from '@/providers';
import { DocketEntry, DocketEntryType } from '@/types';
import type { DocketId } from '@/types/primitives';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

/**
 * DocketEntryBuilder provides a comprehensive form for creating and editing
 * docket entries with automatic task generation and rule association capabilities.
 *
 * ## Features
 * - Complete docket entry form
 * - Entry type selection
 * - Party and attorney information
 * - Document association
 * - Deadline calculation
 * - Task generation
 * - Rule linking
 * - Validation and error handling
 */
const meta = {
  title: 'Docket/DocketEntryBuilder',
  component: DocketEntryBuilder,
  // Exclude mock data from being treated as stories
  excludeStories: /^mock.*/,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'neutral', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    viewport: {
      defaultViewport: 'desktop',
    },
    actions: {
      handles: ['onSave', 'onCancel'],
    },
    docs: {
      description: {
        component: 'Form builder for creating and editing docket entries with automatic task and deadline generation.',
      },
    },
    test: {
      clearMocks: true,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    initialData: {
      description: 'Initial data for editing an existing entry',
      control: 'object',
    },
    caseParties: {
      description: 'Array of party names for dropdown selection',
      control: 'object',
    },
    onSave: {
      description: 'Callback when entry is saved',
      action: 'onSave',
    },
    onCancel: {
      description: 'Callback when form is cancelled',
      action: 'onCancel',
    },
  },
  args: {
    onSave: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof DocketEntryBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockParties = [
  'Plaintiff John Doe',
  'Plaintiff Jane Smith',
  'Defendant Acme Corporation',
  'Defendant XYZ Industries',
  'Third-Party Defendant ABC LLC',
];

const mockExistingEntry: Partial<DocketEntry> = {
  id: 'docket-1' as DocketId,
  sequenceNumber: 42,
  dateFiled: '2024-12-15',
  description: 'MOTION to Dismiss for Failure to State a Claim',
  type: 'Filing' as DocketEntryType,
  filedBy: 'Defendant Acme Corporation',
};

/**
 * Default empty form for creating a new entry
 */
export const NewEntry: Story = {
  args: {
    caseParties: mockParties,
  },
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: 'Empty form for creating a new docket entry from scratch.',
      },
    },
  },
};

/**
 * Form pre-filled with existing entry data for editing
 */
export const EditExisting: Story = {
  args: {
    initialData: mockExistingEntry,
    caseParties: mockParties,
  },
  parameters: {
    backgrounds: { default: 'neutral' },
    docs: {
      description: {
        story: 'Form pre-populated with existing docket entry data for editing.',
      },
    },
  },
};

/**
 * Dark mode variant
 */
export const DarkMode: Story = {
  args: {
    caseParties: mockParties,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

/**
 * Creating a new filing entry
 */
export const NewFiling: Story = {
  args: {
    initialData: {
      type: 'Filing' as DocketEntryType,
      dateFiled: new Date().toISOString().split('T')[0],
    },
    caseParties: mockParties,
  },
};

/**
 * Creating a new court order
 */
export const NewOrder: Story = {
  args: {
    initialData: {
      type: 'Order' as DocketEntryType,
      dateFiled: new Date().toISOString().split('T')[0],
    },
    caseParties: mockParties,
  },
};

/**
 * Creating a hearing notice with deadline
 */
export const NewHearing: Story = {
  args: {
    initialData: {
      type: 'Hearing' as DocketEntryType,
      dateFiled: new Date().toISOString().split('T')[0],
    },
    caseParties: mockParties,
  },
};

/**
 * Creating a minute entry
 */
export const NewMinuteEntry: Story = {
  args: {
    initialData: {
      type: 'Minute Entry' as DocketEntryType,
      dateFiled: new Date().toISOString().split('T')[0],
    },
    caseParties: mockParties,
  },
};

/**
 * Creating a notice entry
 */
export const NewNotice: Story = {
  args: {
    initialData: {
      type: 'Notice' as DocketEntryType,
      dateFiled: new Date().toISOString().split('T')[0],
    },
    caseParties: mockParties,
  },
};

/**
 * Form with no parties available
 */
export const NoParties: Story = {
  args: {
    caseParties: [],
  },
};

/**
 * Complex entry with all fields populated
 */
export const CompleteEntry: Story = {
  args: {
    initialData: {
      sequenceNumber: 100,
      dateFiled: '2024-12-20',
      description: 'MOTION for Summary Judgment on all counts pursuant to Fed. R. Civ. P. 56. Defendant argues that no genuine issue of material fact exists and Defendant is entitled to judgment as a matter of law.',
      type: 'Filing' as DocketEntryType,
      filedBy: 'Defendant Acme Corporation',
      metadata: {
        attorney: 'Sarah Johnson, Esq.',
        firm: 'Johnson & Associates LLP',
      },
    },
    caseParties: mockParties,
  },
};

/**
 * Interactive test filling out a new docket entry form.
 * Demonstrates complete form workflow with validation and submission.
 */
export const FormFillInteraction: Story = {
  args: {
    caseParties: mockParties,
  },
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: 'Automated interaction test demonstrating complete form fill workflow including type selection, data entry, and validation.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Fill in sequence number
    const sequenceInput = canvas.getByLabelText(/sequence number/i);
    await userEvent.clear(sequenceInput);
    await userEvent.type(sequenceInput, '150');
    await expect(sequenceInput).toHaveValue(150);

    // Fill in date filed
    const dateInput = canvas.getByLabelText(/date filed/i);
    await userEvent.type(dateInput, '2024-12-23');

    // Fill in description
    const descriptionInput = canvas.getByLabelText(/description/i);
    await userEvent.type(
      descriptionInput,
      'MOTION to Compel Discovery Responses'
    );
    await expect(descriptionInput).toHaveValue('MOTION to Compel Discovery Responses');

    // Select entry type
    const typeSelect = canvas.getByLabelText(/type/i);
    await userEvent.selectOptions(typeSelect, 'Filing');

    // Select filing party
    const partySelect = canvas.getByLabelText(/filed by/i);
    if (mockParties[0]) await userEvent.selectOptions(partySelect, mockParties[0]);

    // Attempt to save
    const saveButton = canvas.getByRole('button', { name: /save|submit/i });
    await userEvent.click(saveButton);

    // Verify onSave was called
    await expect(args.onSave).toHaveBeenCalled();
  },
};

/**
 * Interactive test demonstrating cancel functionality.
 * Tests form abandonment workflow.
 */
export const CancelInteraction: Story = {
  args: {
    caseParties: mockParties,
  },
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: 'Tests cancel workflow - user starts filling form then cancels.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Start filling form
    const sequenceInput = canvas.getByLabelText(/sequence number/i);
    await userEvent.type(sequenceInput, '200');

    // Click cancel
    const cancelButton = canvas.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    // Verify onCancel was called
    await expect(args.onCancel).toHaveBeenCalled();
  },
};
