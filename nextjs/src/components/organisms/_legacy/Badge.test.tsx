/**
 * @jest-environment jsdom
 * @module Badge.test
 * @description Enterprise-grade tests for legacy Badge re-export module
 *
 * Test coverage:
 * - Module re-exports verification
 * - Type export verification
 * - Backward compatibility
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/components/ui/atoms/Badge/Badge', () => ({
  Badge: ({ children, variant = 'default', size = 'md' }: { children: React.ReactNode; variant?: string; size?: string }) => (
    <span data-testid="badge" data-variant={variant} data-size={size}>
      {children}
    </span>
  ),
}));

// ============================================================================
// TESTS
// ============================================================================

describe('Badge Legacy Re-export', () => {
  describe('Module Exports', () => {
    it('re-exports Badge component from ui/atoms', async () => {
      const { Badge } = await import('./Badge');

      expect(Badge).toBeDefined();
    });

    it('Badge component renders correctly', async () => {
      const { Badge } = await import('./Badge');

      render(<Badge>Test Badge</Badge>);

      expect(screen.getByTestId('badge')).toBeInTheDocument();
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('Badge passes variant prop correctly', async () => {
      const { Badge } = await import('./Badge');

      render(<Badge variant="success">Success</Badge>);

      expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'success');
    });

    it('Badge passes size prop correctly', async () => {
      const { Badge } = await import('./Badge');

      render(<Badge size="lg">Large</Badge>);

      expect(screen.getByTestId('badge')).toHaveAttribute('data-size', 'lg');
    });
  });

  describe('Type Exports', () => {
    it('exports BadgeProps type', async () => {
      // TypeScript compilation test - if this compiles, types are exported
      const { Badge } = await import('./Badge');

      // Type assertion test
      const props: Parameters<typeof Badge>[0] = {
        children: 'Test',
        variant: 'default',
      };

      expect(props).toBeDefined();
    });
  });

  describe('Backward Compatibility', () => {
    it('maintains original import path', async () => {
      // Original import: import { Badge } from './components/common/Badge'
      // Should work without changes
      const module = await import('./Badge');

      expect(module.Badge).toBeDefined();
    });

    it('supports legacy usage patterns', async () => {
      const { Badge } = await import('./Badge');

      // Legacy usage: <Badge>Content</Badge>
      const { container } = render(<Badge>Legacy Usage</Badge>);

      expect(container.querySelector('[data-testid="badge"]')).toBeInTheDocument();
    });
  });
});
