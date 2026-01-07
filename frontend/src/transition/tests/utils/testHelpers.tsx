/**
 * Test utilities and helpers
 */

import { render, type RenderOptions } from '@testing-library/react';
import { type ReactElement } from 'react';
import { AppProviders } from '../../app/providers/AppProviders';

// Custom render with providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AppProviders, ...options });
}

// Mock user factory
export function createMockUser(overrides = {}) {
  return {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    roles: ['user'],
    permissions: ['read'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// Mock invoice factory
export function createMockInvoice(overrides = {}) {
  return {
    id: '1',
    number: 'INV-001',
    customerId: 'cust-1',
    amount: 100.00,
    currency: 'USD',
    status: 'paid',
    dueDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    items: [],
    ...overrides,
  };
}

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));
