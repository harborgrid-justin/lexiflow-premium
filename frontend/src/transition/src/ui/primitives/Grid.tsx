/**
 * Grid - Grid layout primitive
 */

import { type CSSProperties, type ReactNode } from 'react';

export interface GridProps {
  children: ReactNode;
  columns?: number | string;
  gap?: string | number;
  style?: CSSProperties;
}

export function Grid({ children, columns = 2, gap = '1rem', style = {} }: GridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns,
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
