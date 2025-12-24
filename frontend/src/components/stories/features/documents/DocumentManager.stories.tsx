/**
 * Document Manager Page Story
 * 
 * Main document management system with explorer, templates, assembly, and advanced features.
 * Provides centralized DMS, version control, and automated drafting capabilities.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import DocumentManager from '../../../../frontend/components/operations/documents/DocumentManager';
import { ThemeProvider } from '../../../../frontend/context/ThemeContext';
import { ToastProvider } from '../../../../frontend/context/ToastContext';
import { WindowProvider } from '../../../../frontend/context/WindowContext';
import type { UserRole } from '../../../../frontend/types';

const meta: Meta<typeof DocumentManager> = {
  title: 'Pages/Document Manager',
  component: DocumentManager,
  tags: ['autodocs', 'page'],
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
        component: 'Comprehensive document management system with file browsing, version control, templates, and automated assembly features. Includes PDF editing, redaction, form signing, and batch processing capabilities.'
      }
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <ToastProvider>
          <WindowProvider>
            <Story />
          </WindowProvider>
        </ToastProvider>
      </ThemeProvider>
    )
  ],
  argTypes: {
    currentUserRole: {
      control: 'select',
      options: ['partner', 'associate', 'paralegal', 'admin', 'client'],
      description: 'User role for permission checks'
    },
    initialTab: {
      control: 'select',
      options: ['browse', 'recent', 'starred', 'shared', 'templates'],
      description: 'Initial tab to display'
    }
  }
};

export default meta;
type Story = StoryObj<typeof DocumentManager>;

/**
 * Default document manager showing browse view.
 */
export const Default: Story = {
  args: {
    currentUserRole: 'associate' as UserRole,
    initialTab: 'browse'
  },
  parameters: {
    backgrounds: { default: 'light' },
  },
};

/**
 * Partner view with full permissions.
 */
export const PartnerView: Story = {
  args: {
    currentUserRole: 'partner' as UserRole,
    initialTab: 'browse'
  },
  parameters: {
    docs: {
      description: {
        story: 'Document manager with partner-level permissions and full access to all features.'
      }
    }
  }
};

/**
 * Recent files view.
 */
export const RecentFiles: Story = {
  args: {
    currentUserRole: 'associate' as UserRole,
    initialTab: 'recent'
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows recently accessed documents for quick access.'
      }
    }
  }
};

/**
 * Document templates view.
 */
export const Templates: Story = {
  args: {
    currentUserRole: 'associate' as UserRole,
    initialTab: 'templates'
  },
  parameters: {
    docs: {
      description: {
        story: 'Template library for creating new documents from predefined templates.'
      }
    }
  }
};

/**
 * Document templates view (assembly features).
 */
export const Assembly: Story = {
  args: {
    currentUserRole: 'associate' as UserRole,
    initialTab: 'templates'
  },
  parameters: {
    docs: {
      description: {
        story: 'Automated document assembly with merge fields and clause libraries available through templates.'
      }
    }
  }
};

/**
 * PDF editor view.
 */
export const PDFEditor: Story = {
  args: {
    currentUserRole: 'associate' as UserRole,
    initialTab: 'browse'
  },
  parameters: {
    docs: {
      description: {
        story: 'Advanced PDF editing capabilities including annotations, page manipulation, and form filling.'
      }
    }
  }
};

/**
 * Redaction studio view.
 */
export const RedactionStudio: Story = {
  args: {
    currentUserRole: 'partner' as UserRole,
    initialTab: 'browse'
  },
  parameters: {
    docs: {
      description: {
        story: 'Secure document redaction with PII detection and compliance features.'
      }
    }
  }
};

/**
 * Forms and signing view.
 */
export const FormsSigning: Story = {
  args: {
    currentUserRole: 'associate' as UserRole,
    initialTab: 'browse'
  },
  parameters: {
    docs: {
      description: {
        story: 'Document signing workflows and form management.'
      }
    }
  }
};

/**
 * Batch processing view.
 */
export const BatchProcessing: Story = {
  args: {
    currentUserRole: 'partner' as UserRole,
    initialTab: 'browse'
  },
  parameters: {
    docs: {
      description: {
        story: 'Batch operations for processing multiple documents simultaneously.'
      }
    }
  }
};

/**
 * Tablet responsive view.
 */
export const TabletView: Story = {
  args: {
    currentUserRole: 'associate' as UserRole,
    initialTab: 'browse'
  },
  parameters: {
    viewport: { defaultViewport: 'tablet' },
    backgrounds: { default: 'light' },
  },
};

/**
 * Dark mode view.
 */
export const DarkMode: Story = {
  args: {
    currentUserRole: 'associate' as UserRole,
    initialTab: 'browse'
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

/**
 * Paralegal limited view.
 */
export const ParalegalView: Story = {
  args: {
    currentUserRole: 'paralegal' as UserRole,
    initialTab: 'browse'
  },
  parameters: {
    docs: {
      description: {
        story: 'Document manager with paralegal permissions - limited access to certain features.'
      }
    }
  }
};

/**
 * Shared documents view.
 */
export const SharedDocuments: Story = {
  args: {
    currentUserRole: 'associate' as UserRole,
    initialTab: 'shared'
  },
  parameters: {
    docs: {
      description: {
        story: 'Documents shared with the current user or team.'
      }
    }
  }
};
