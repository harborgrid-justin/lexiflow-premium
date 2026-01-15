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

import { ToastProvider as ToastProviderBase } from '@/contexts/toast/ToastContext';
import { ThemeProvider } from '@/theme';
import React from "react";
import { EnvProvider } from './EnvProvider';

// Type assertion for ToastProvider to ensure ReactNode return
const ToastProvider = ToastProviderBase as unknown as React.FC<{
  children: React.ReactNode;
  maxVisible?: number;
  maxQueue?: number;
}>;

interface InfrastructureLayerProps {
  children: React.ReactNode;
}

export function InfrastructureLayer({ children }: InfrastructureLayerProps) {
  return (
    <EnvProvider>
      <ThemeProvider>
        <ToastProvider maxVisible={5} maxQueue={50}>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </EnvProvider>
  );
}
