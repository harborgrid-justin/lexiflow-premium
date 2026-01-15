/**
 * ================================================================================
 * INFRASTRUCTURE LAYER - FOUNDATIONAL SERVICES
 * ================================================================================
 *
 * ENTERPRISE LAYERING: OUTERMOST LAYER
 *
 * RESPONSIBILITIES:
 * - Environment Configuration (EnvProvider)
 * - Visual Theme System (ThemeProvider)
 * - Global UI Feedback (ToastProvider)
 *
 * RULES:
 * - Must NOT depend on Application or Domain layers
 * - Must be strictly self-contained
 * - Loaded BEFORE everything else
 *
 * @module providers/infrastructure
 */

import React from "react";
import { EnvProvider } from './EnvProvider';
import { LayoutProvider } from './LayoutProvider';
import { ThemeProvider } from './ThemeProvider';

// Type assertion for ToastProvider to ensure ReactNode return
// const ToastProvider = ToastProviderBase as unknown as React.FC<{
//   children: React.ReactNode;
//   maxVisible?: number;
//   maxQueue?: number;
// }>;

interface InfrastructureLayerProps {
  children: React.ReactNode;
}

export function InfrastructureLayer({ children }: InfrastructureLayerProps) {
  return (
    <EnvProvider>
      <ThemeProvider>
        <ToastProvider>
          <LayoutProvider>
            {children}
            <ToastContainer />
          </LayoutProvider>
        </ToastProvider>
      </ThemeProvider>
    </EnvProvider>
  );
}
