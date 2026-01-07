/**
 * Split pattern - Two-column layout
 */

import { type ReactNode } from 'react';

export interface SplitProps {
  left: ReactNode;
  right: ReactNode;
  ratio?: string;
}

export function Split({ left, right, ratio = '1fr 1fr' }: SplitProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: ratio, gap: '2rem' }}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}
