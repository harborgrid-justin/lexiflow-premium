import type { Meta, StoryObj } from '@storybook/react-vite';
import { KnowledgeCenter } from '@/routes/practice/components/KnowledgeCenter';

/**
 * KnowledgeCenter is the firm's legal research and knowledge management platform
 * providing access to legal research, precedents, templates, and practice guides.
 * 
 * ## Features
 * - Legal research database
 * - Precedent library
 * - Template repository
 * - Practice area guides
 * - Court rules database
 * - Legal analytics
 * - Citation management
 * - Research notes
 * - Collaborative annotations
 * - AI-powered search
 */
const meta = {
  title: 'Pages/Knowledge Center',
  component: KnowledgeCenter,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'neutral', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a1a' },
        { name: 'blue', value: '#1e40af' },
      ],
    },
    viewport: {
      defaultViewport: 'desktopLarge',
    },
    docs: {
      description: {
        component: 'Legal research and knowledge management platform with AI-powered search and collaboration.',
      },
    },
    test: {
      clearMocks: true,
    },
  },
  tags: ['autodocs', 'page']
} satisfies Meta<typeof KnowledgeCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default knowledge center view
 */
export const Default: Story = {};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Tablet responsive view
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
