import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Test utilities for rendering components with providers
 *
 * Usage:
 *   import { render, screen } from '@/__tests__/test-utils';
 *
 *   test('renders component', () => {
 *     render(<MyComponent />);
 *     expect(screen.getByText('Hello')).toBeInTheDocument();
 *   });
 */

// Mock providers wrapper
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

// Custom render function that wraps components with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override render with our custom version
export { customRender as render };
