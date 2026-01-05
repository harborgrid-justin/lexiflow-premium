import React from 'react';

interface ZeroClsWrapperProps {
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
  minHeight?: string | number;
  className?: string;
  children: React.ReactNode;
}

/**
 * A wrapper that reserves space to prevent Layout Shifts (CLS).
 * (Principle 1: Zero-Layout-Shift Rendering)
 */
export const ZeroClsWrapper: React.FC<ZeroClsWrapperProps> = ({
  width,
  height,
  aspectRatio,
  minHeight,
  className = '',
  children
}) => {
  const style: React.CSSProperties = {
    width: width,
    height: height,
    aspectRatio: aspectRatio,
    minHeight: minHeight,
    // Ensure it acts as a container
    display: 'block',
    overflow: 'hidden' // Optional: prevents content from spilling out if it breaks bounds
  };

  return (
    <div className={`zero-cls-wrapper ${className}`} style={style}>
      {children}
    </div>
  );
};
