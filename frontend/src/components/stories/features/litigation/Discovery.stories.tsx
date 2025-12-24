import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CaseId, DiscoveryRequest, DiscoveryType, DiscoveryStatus } from '../../../../frontend/types';
import { DiscoveryPlatform } from '../../../../features/litigation/discovery/DiscoveryPlatform';
import { DiscoveryRequests } from '../../../../features/litigation/discovery/DiscoveryRequests';
import { DiscoveryProductions } from '../../../../features/litigation/discovery/DiscoveryProductions';
import { DiscoveryESI } from '../../../../features/litigation/discovery/DiscoveryESI';
import { DiscoveryDepositions } from '../../../../features/litigation/discovery/DiscoveryDepositions';
import { DiscoveryInterviews } from '../../../../features/litigation/discovery/DiscoveryInterviews';
import { DiscoveryStipulations } from '../../../../features/litigation/discovery/DiscoveryStipulations';
import { LegalHolds } from '../../../../features/litigation/discovery/LegalHolds';
import { PrivilegeLog } from '../../../../features/litigation/discovery/PrivilegeLog';
import { Custodians } from '../../../../frontend/components/litigation/discovery/Custodians';
import { VendorManagement } from '../../../../frontend/components/litigation/discovery/VendorManagement';
import { InitialDisclosureWizard } from '../../../../frontend/components/litigation/discovery/InitialDisclosureWizard';
import { MotionToCompelBuilder } from '../../../../frontend/components/litigation/discovery/MotionToCompelBuilder';
import { MotionForSanctions } from '../../../../frontend/components/litigation/discovery/MotionForSanctions';
import { RequestForAdmission } from '../../../../frontend/components/litigation/discovery/RequestForAdmission';
import { PerpetuateTestimony } from '../../../../frontend/components/litigation/discovery/PerpetuateTestimony';
import { TranscriptManager } from '../../../../frontend/components/litigation/discovery/TranscriptManager';
import { ThemeProvider } from '../../../../frontend/providers/ThemeContext';
import { ToastProvider } from '../../../../frontend/providers/ToastContext';
import React from 'react';

/**
 * Discovery components provide comprehensive tools for managing the discovery process
 * including requests, productions, depositions, ESI, and compliance.
 * 
 * ## Features
 * - Discovery request management
 * - Production tracking and review
 * - ESI (Electronically Stored Information) management
 * - Deposition scheduling and management
 * - Legal holds and preservation
 * - Privilege log management
 * - Vendor coordination
 */

// ============================================================================
// DISCOVERY PLATFORM (Main)
// ============================================================================

const metaPlatform = {
  title: 'Litigation/Discovery/Platform',
  component: DiscoveryPlatform,
  tags: ['autodocs'],
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
    docs: {
      description: {
        component: 'Comprehensive discovery management platform with requests, productions, and ESI tools.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-50">
            <Story />
          </div>
        </ToastProvider>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof DiscoveryPlatform>;

export default metaPlatform;

type Story = StoryObj<typeof metaPlatform>;

export const Default: Story = {
  args: {
    caseId: 'case-123',
  },
};

export const WithMultipleCases: Story = {
  args: {
    caseId: 'case-456',
  },
};
