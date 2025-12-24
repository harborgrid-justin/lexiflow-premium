import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, within } from 'storybook/test';

import { Page } from './Page';

const meta = {
  title: 'Example/Page',
  component: Page,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
    },
    test: {
      clearMocks: true,
    },
  },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
  parameters: {
    backgrounds: { default: 'neutral' },
  },
};

// More on component testing: https://storybook.js.org/docs/writing-tests/interaction-testing
export const LoggedIn: Story = {
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: 'Demonstrates play function for automated interaction testing. Clicks login button and verifies state changes.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loginButton = canvas.getByRole('button', { name: /Log in/i });
    await expect(loginButton).toBeInTheDocument();
    await userEvent.click(loginButton);
    await expect(loginButton).not.toBeInTheDocument();

    const logoutButton = canvas.getByRole('button', { name: /Log out/i });
    await expect(logoutButton).toBeInTheDocument();
  },
};
