import type { Preview } from "@storybook/react-vite";

import React from "react";

import "../index.css"; // Import Tailwind CSS
import { ThemeProvider } from "../src/features/theme";
import { ToastProvider } from "../src/providers";

const preview: Preview = {
  decorators: [
    (Story) =>
      React.createElement(
        ThemeProvider,
        {},
        React.createElement(ToastProvider, {}, React.createElement(Story))
      ),
  ],
  parameters: {
    // Layout configuration
    layout: "padded", // Default layout for stories

    // Controls configuration
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true, // Expand controls panel by default
      sort: "requiredFirst", // Sort required props first
    },

    // Actions configuration
    actions: {
      argTypesRegex: "^on[A-Z].*",
    },

    // Backgrounds configuration
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#1a1a1a" },
        { name: "slate", value: "#0f172a" },
        { name: "blue", value: "#1e40af" },
        { name: "neutral", value: "#f5f5f5" },
      ],
    },

    // Viewport configuration
    viewport: {
      viewports: {
        mobile1: {
          name: "Small Mobile",
          styles: { width: "375px", height: "667px" },
          type: "mobile",
        },
        mobile2: {
          name: "Large Mobile",
          styles: { width: "414px", height: "896px" },
          type: "mobile",
        },
        tablet: {
          name: "Tablet",
          styles: { width: "768px", height: "1024px" },
          type: "tablet",
        },
        desktop: {
          name: "Desktop",
          styles: { width: "1280px", height: "800px" },
          type: "desktop",
        },
        desktopLarge: {
          name: "Large Desktop",
          styles: { width: "1920px", height: "1080px" },
          type: "desktop",
        },
      },
    },

    // Accessibility testing
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: true,
          },
        ],
      },
    },

    // Test configuration
    test: {
      clearMocks: true, // Clear mocks between stories
      restoreMocks: true, // Restore mocks to original implementation
      dangerouslyIgnoreUnhandledErrors: false, // Fail on unhandled errors
    },

    // Documentation
    docs: {
      toc: true, // Show table of contents
    },
  },
};

export default preview;
