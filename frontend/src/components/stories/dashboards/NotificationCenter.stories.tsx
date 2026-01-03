import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationCenter } from '@/components/organisms/notifications/NotificationCenter';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { ToastProvider } from '@providers/ToastContext';

const meta = {
  title: 'Pages/Notification Center',
  component: NotificationCenter,
  parameters: { 
    layout: 'fullscreen',
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
    docs: {
      description: {
        component: 'Centralized notification management with real-time alerts, filtering, and prioritization.',
      },
    },
    test: {
      clearMocks: true,
    },
  },
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
} satisfies Meta<typeof NotificationCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock notification data
const mockNotifications = [
  {
    id: '1',
    type: 'deadline' as const,
    title: 'Motion Response Due',
    message: 'Response to Motion to Dismiss due in 3 days',
    read: false,
    priority: 'urgent' as const,
    timestamp: Date.now() - 1000 * 60 * 30,
    actionLabel: 'View Motion',
  },
  {
    id: '2',
    type: 'case_update' as const,
    title: 'New Docket Entry',
    message: 'Judge ordered discovery conference for Case #2024-001',
    read: false,
    priority: 'high' as const,
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: '3',
    type: 'document' as const,
    title: 'Document Uploaded',
    message: 'Client uploaded medical records to Evidence folder',
    read: true,
    priority: 'medium' as const,
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    actionLabel: 'View Documents',
  },
];

export const Default: Story = {
  args: {
    notifications: mockNotifications,
    unreadCount: 2,
    onMarkAsRead: (id: string) => console.log('Mark as read:', id),
    onMarkAllAsRead: () => console.log('Mark all as read'),
    onDelete: (id: string) => console.log('Delete:', id),
    onNotificationClick: (notification) => console.log('Clicked:', notification),
  },
  parameters: {
    backgrounds: { default: 'light' },
  },
};

export const DarkMode: Story = {
  args: {
    notifications: mockNotifications,
    unreadCount: 2,
    onMarkAsRead: (id: string) => console.log('Mark as read:', id),
    onMarkAllAsRead: () => console.log('Mark all as read'),
    onDelete: (id: string) => console.log('Delete:', id),
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Mobile: Story = {
  args: {
    notifications: mockNotifications,
    unreadCount: 2,
    onMarkAsRead: (id: string) => console.log('Mark as read:', id),
    onMarkAllAsRead: () => console.log('Mark all as read'),
    onDelete: (id: string) => console.log('Delete:', id),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    backgrounds: { default: 'neutral' },
  },
};

export const Tablet: Story = {
  args: {
    notifications: mockNotifications,
    unreadCount: 2,
    onMarkAsRead: (id: string) => console.log('Mark as read:', id),
    onMarkAllAsRead: () => console.log('Mark all as read'),
    onDelete: (id: string) => console.log('Delete:', id),
  },
  parameters: {
    viewport: { defaultViewport: 'tablet' },
    backgrounds: { default: 'light' },
  },
};
