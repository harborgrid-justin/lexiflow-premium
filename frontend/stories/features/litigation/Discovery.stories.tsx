import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CaseId, DiscoveryRequest, DiscoveryType, DiscoveryStatus } from '../../types';
import { DiscoveryPlatform } from '../../components/litigation/discovery/DiscoveryPlatform';
import { DiscoveryRequests } from '../../components/litigation/discovery/DiscoveryRequests';
import { DiscoveryProductions } from '../../components/litigation/discovery/DiscoveryProductions';
import { DiscoveryESI } from '../../components/litigation/discovery/DiscoveryESI';
import { DiscoveryDepositions } from '../../components/litigation/discovery/DiscoveryDepositions';
import { DiscoveryInterviews } from '../../components/litigation/discovery/DiscoveryInterviews';
import { DiscoveryStipulations } from '../../components/litigation/discovery/DiscoveryStipulations';
import { LegalHolds } from '../../components/litigation/discovery/LegalHolds';
import { PrivilegeLog } from '../../components/litigation/discovery/PrivilegeLog';
import { Custodians } from '../../components/litigation/discovery/Custodians';
import { VendorManagement } from '../../components/litigation/discovery/VendorManagement';
import { InitialDisclosureWizard } from '../../components/litigation/discovery/InitialDisclosureWizard';
import { MotionToCompelBuilder } from '../../components/litigation/discovery/MotionToCompelBuilder';
import { MotionForSanctions } from '../../components/litigation/discovery/MotionForSanctions';
import { RequestForAdmission } from '../../components/litigation/discovery/RequestForAdmission';
import { PerpetuateTestimony } from '../../components/litigation/discovery/PerpetuateTestimony';
import { TranscriptManager } from '../../components/litigation/discovery/TranscriptManager';
import { ThemeProvider } from '../../context/ThemeContext';
import { ToastProvider } from '../../context/ToastContext';
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
