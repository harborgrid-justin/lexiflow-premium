/**
 * Container pattern - Max-width container
 */

import { type ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  maxWidth?: string;
}

export function Container({ children, maxWidth = '1200px' }: ContainerProps) {
  return (
    <div style={{ maxWidth, margin: '0 auto', padding: '0 1rem' }}>
      {children}
    </div>
  );
}
