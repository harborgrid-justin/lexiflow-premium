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

import { ThemeProvider } from './ThemeProvider';
// TODO: ToastProvider needs to be implemented in infrastructure layer
// import { ToastProvider as ToastProviderBase } from './ToastProvider';
import React from "react";
import { EnvProvider } from './EnvProvider';
import { LayoutProvider } from './LayoutProvider';

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
        <LayoutProvider>
          {/* TODO: Add ToastProvider when implemented */}
          {children}
        </LayoutProvider>
      </ThemeProvider>
    </EnvProvider>
  );
}
