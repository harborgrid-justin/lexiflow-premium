/**
 * Discovery Platform Page Story
 * 
 * Comprehensive discovery platform with requests, productions, ESI,
 * privilege logging, and legal holds management.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { DiscoveryPlatform } from '../../../../features/litigation/discovery/DiscoveryPlatform';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { ToastProvider } from '@/providers';

const meta: Meta<typeof DiscoveryPlatform> = {
  title: 'Pages/Discovery Platform',
  component: DiscoveryPlatform,
  tags: ['autodocs', 'page'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'neutral',
    },
    viewport: {
      defaultViewport: 'desktopLarge',
    },
    docs: {
      description: {
        component: 'Enterprise discovery management platform handling all aspects of litigation discovery including requests, productions, ESI, privilege logs, depositions, and legal holds.'
      }
    },
    test: {
      clearMocks: true,
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <ToastProvider>
          <Story />
        </ToastProvider>
      </ThemeProvider>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof DiscoveryPlatform>;

/**
 * Default discovery platform showing dashboard with overview metrics.
 */
export const Default: Story = {
  args: {}
};

/**
 * Discovery requests view for managing interrogatories, RFPs, and RFAs.
 */
export const RequestsView: Story = {
  args: {},
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: 'Requests view showing interrogatories, requests for production (RFPs), and requests for admission (RFAs) with response tracking.'
      }
    }
  }
};

/**
 * Dark mode variant
 */
export const DarkMode: Story = {
  args: {},
  parameters: {
    backgrounds: { default: 'dark' },
  }
};

/**
 * Tablet responsive view
 */
export const TabletView: Story = {
  args: {},
  parameters: {
    viewport: { defaultViewport: 'tablet' },
    backgrounds: { default: 'neutral' },
  }
};

/**
 * Productions view for document production management.
 */
export const ProductionsView: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Productions view managing document review, redaction, and production to opposing counsel with Bates numbering.'
      }
    }
  }
};

/**
 * Privilege log view for tracking privileged documents.
 */
export const PrivilegeLogView: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Privilege log interface for documenting attorney-client privilege, work product, and other protected materials.'
      }
    }
  }
};

/**
 * Legal holds view for litigation hold management.
 */
export const LegalHoldsView: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Legal holds manager for tracking custodians, hold notices, and compliance with preservation obligations.'
      }
    }
  }
};

/**
 * Depositions view for scheduling and managing depositions.
 */
export const DepositionsView: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Depositions dashboard for scheduling, preparing, and managing witness depositions with exhibit tracking.'
      }
    }
  }
};

/**
 * Discovery platform in case-specific context.
 */
export const CaseSpecificDiscovery: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Discovery platform filtered to a specific case, showing only relevant discovery items for that matter.'
      }
    }
  }
};

/**
 * ESI (Electronically Stored Information) view for digital discovery.
 */
export const ESIView: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ESI management view for handling electronic discovery, data processing, and technology-assisted review.'
      }
    }
  }
};
