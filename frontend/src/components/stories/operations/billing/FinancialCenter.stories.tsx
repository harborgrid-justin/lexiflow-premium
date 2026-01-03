import type { Meta, StoryObj } from '@storybook/react-vite';
import { FinancialCenter } from '@features/knowledge/practice';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { ToastProvider } from '@providers/ToastContext';

const meta = {
  title: 'Pages/Financial Center',
  component: FinancialCenter,
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
} satisfies Meta<typeof FinancialCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Tablet: Story = { parameters: { viewport: { defaultViewport: 'tablet' } } };
