/**
 * NavSlot - Navigation slot
 */

import { type ReactNode } from 'react';

interface NavSlotProps {
  children: ReactNode;
}

export function NavSlot({ children }: NavSlotProps) {
  return (
    <div className="nav-slot">
      {children}

      <style>{`
        .nav-slot {
          display: flex;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
}
