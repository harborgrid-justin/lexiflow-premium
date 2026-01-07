/**
 * Box - Layout primitive
 */

import { type CSSProperties, type ReactNode } from 'react';

export interface BoxProps {
  children: ReactNode;
  padding?: string | number;
  margin?: string | number;
  background?: string;
  style?: CSSProperties;
}

export function Box({ children, padding, margin, background, style = {} }: BoxProps) {
  return (
    <div
      style={{
        padding,
        margin,
        background,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
