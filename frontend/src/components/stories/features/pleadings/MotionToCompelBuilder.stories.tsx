import type { Meta, StoryObj } from '@storybook/react-vite';
import { MotionToCompelBuilder } from '@features/litigation/discovery/MotionToCompelBuilder';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { ToastProvider } from '@/providers';
import { CaseId } from '@/types';

const meta = {
  title: 'Pages/Motion to Compel Builder',
  component: MotionToCompelBuilder,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs', 'page'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <ToastProvider>
          <div className="h-screen w-screen">
            <Story />
          </div>
        </ToastProvider>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof MotionToCompelBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockRequests = [
  {
    id: '1',
    caseId: 'case-123' as CaseId,
    type: 'Interrogatory' as const,
    requestNumber: 1,
    title: 'Document Identification Request',
    description: 'Request for identification of documents related to the incident',
    text: 'Please identify all documents related to the incident.',
    propoundingParty: 'Plaintiff',
    respondingParty: 'Defendant',
    serviceDate: '2024-01-01',
    status: 'Overdue' as const,
    dueDate: '2024-01-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const Default: Story = {
  args: {
    requests: mockRequests,
    onCancel: () => console.log('Cancel clicked'),
  },
};

export const Mobile: Story = {
  args: {
    requests: mockRequests,
    onCancel: () => console.log('Cancel clicked'),
  },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const Tablet: Story = {
  args: {
    requests: mockRequests,
    onCancel: () => console.log('Cancel clicked'),
  },
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
