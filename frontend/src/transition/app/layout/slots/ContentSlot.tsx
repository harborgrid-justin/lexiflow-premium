/**
 * ContentSlot - Main content area slot
 */

import { type ReactNode } from 'react';

interface ContentSlotProps {
  children: ReactNode;
}

export function ContentSlot({ children }: ContentSlotProps) {
  return (
    <div className="content-slot">
      {children}

      <style>{`
        .content-slot {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
