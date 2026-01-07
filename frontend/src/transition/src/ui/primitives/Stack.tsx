/**
 * Stack - Vertical/horizontal stack layout
 */

import { type CSSProperties, type ReactNode } from 'react';

export interface StackProps {
  children: ReactNode;
  direction?: 'horizontal' | 'vertical';
  spacing?: string | number;
  align?: 'start' | 'center' | 'end';
  style?: CSSProperties;
}

export function Stack({
  children,
  direction = 'vertical',
  spacing = '1rem',
  align = 'start',
  style = {}
}: StackProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction === 'vertical' ? 'column' : 'row',
        gap: spacing,
        alignItems: align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : 'center',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
