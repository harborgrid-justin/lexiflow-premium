/**
 * @module components/common/ProgressIndicator
 * @category Common
 * @description Animated progress indicator with ETA calculation and cancellation support.
 *
 * FEATURES:
 * - Percentage-based progress bars
 * - Estimated time remaining
 * - Step-by-step progress for multi-stage operations
 * - Cancellation support
 * - Success celebration animation
 */

import { NOTIFICATION_AUTO_DISMISS_MS } from '@/config/features/ui.config';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { CheckCircle, Loader2, X, XCircle } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  progress?: number;
}

export interface ProgressIndicatorProps {
  /** Current progress (0-100) */
  progress: number;
  /** Status of the operation */
  status?: 'idle' | 'in-progress' | 'completed' | 'error' | 'cancelled';
  /** Show percentage text */
  showPercentage?: boolean;
  /** Show estimated time remaining */
  showETA?: boolean;
  /** Start time for ETA calculation */
  startTime?: number;
  /** Total expected duration in milliseconds (for better ETA) */
  estimatedDuration?: number;
  /** Multi-step progress */
  steps?: ProgressStep[];
  /** Allow cancellation */
  canCancel?: boolean;
  /** Cancellation handler */
  onCancel?: () => void;
  /** Error message */
  error?: string;
  /** Success message */
  successMessage?: string;
  /** Accessible label for screen readers */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'primary' | 'success' | 'warning' | 'error';
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Calculate estimated time remaining
 */
function calculateETA(
  progress: number,
  startTime: number,
  estimatedDuration?: number
): string | null {
  if (progress === 0 || progress === 100) return null;

  const elapsedMs = Date.now() - startTime;

  let remainingMs: number;

  if (estimatedDuration) {
    // Use estimated duration if provided
    const progressRatio = progress / 100;
    const expectedElapsed = estimatedDuration * progressRatio;
    remainingMs = estimatedDuration - expectedElapsed;
  } else {
    // Calculate based on current progress
    const msPerPercent = elapsedMs / progress;
    remainingMs = msPerPercent * (100 - progress);
  }

  if (remainingMs < 1000) return 'Less than a second';
  if (remainingMs < 60000) return `${Math.ceil(remainingMs / 1000)}s remaining`;
  if (remainingMs < 3600000) return `${Math.ceil(remainingMs / 60000)}m remaining`;
  return `${Math.ceil(remainingMs / 3600000)}h remaining`;
}

interface ThemeColors {
  status: {
    success: { bg: string };
    warning: { bg: string };
    error: { bg: string };
  };
  action: {
    primary: { bg: string };
  };
}

/**
 * Get progress bar color class
 */
function getProgressColor(variant: string, theme: unknown): string {
  const typedTheme = theme as ThemeColors;
  switch (variant) {
    case 'success':
      return typedTheme.status.success.bg;
    case 'warning':
      return typedTheme.status.warning.bg;
    case 'error':
      return typedTheme.status.error.bg;
    case 'primary':
      return typedTheme.action.primary.bg;
    default:
      return typedTheme.action.primary.bg;
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  status = 'in-progress',
  showPercentage = true,
  showETA = true,
  startTime,
  estimatedDuration,
  steps,
  canCancel = false,
  onCancel,
  error,
  successMessage = 'Complete!',
  label,
  size = 'md',
  variant = 'primary',
}) => {
  const { theme } = useTheme();
  const [showSuccess, setShowSuccess] = useState(false);
  const [eta, setEta] = useState<string | null>(null);

  // Size classes
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  // Update ETA periodically
  useEffect(() => {
    if (status !== 'in-progress' || !startTime || !showETA) return;

    const updateETA = () => {
      const calculatedETA = calculateETA(progress, startTime, estimatedDuration);
      setEta(calculatedETA);
    };

    updateETA();
    const interval = setInterval(updateETA, 1000);

    return () => clearInterval(interval);
  }, [status, progress, startTime, estimatedDuration, showETA]);

  // Show success animation
  useEffect(() => {
    if (status === 'completed') {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), NOTIFICATION_AUTO_DISMISS_MS);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status]);

  // Clamp progress to 0-100
  const clampedProgress = useMemo(() => Math.min(Math.max(progress, 0), 100), [progress]);

  // Get progress color
  const progressColor = useMemo(
    () => getProgressColor(variant, theme),
    [variant, theme]
  );

  return (
    <div className="w-full space-y-2">
      {/* Header: percentage and ETA */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {status === 'in-progress' && (
            <Loader2 className={cn("h-4 w-4 animate-spin", theme.text.secondary)} />
          )}
          {status === 'completed' && (
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          )}
          {status === 'error' && (
            <XCircle className="h-4 w-4 text-rose-500" />
          )}

          {showPercentage && status === 'in-progress' && (
            <span className={cn("font-medium", theme.text.primary)}>
              {Math.round(clampedProgress)}%
            </span>
          )}

          {status === 'completed' && (
            <span className="font-medium text-emerald-600">
              {successMessage}
            </span>
          )}

          {status === 'error' && error && (
            <span className="font-medium text-rose-600">{error}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {eta && status === 'in-progress' && (
            <span className={cn("text-xs", theme.text.tertiary)}>{eta}</span>
          )}

          {canCancel && status === 'in-progress' && onCancel && (
            <button
              onClick={onCancel}
              className={cn(
                "p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors",
                theme.text.secondary
              )}
              title="Cancel"
              aria-label="Cancel operation"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={cn(
        "w-full rounded-full overflow-hidden",
        sizeClasses[size],
        theme.surface.highlight
      )}>
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out rounded-full",
            progressColor,
            showSuccess && 'animate-pulse'
          )}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || `Progress: ${clampedProgress}%`}
        />
      </div>

      {/* Steps - IDENTITY-STABLE KEYS: Use step.id */}
      {steps && steps.length > 0 && (
        <div className="mt-4 space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md transition-colors",
                step.status === 'in-progress' && theme.surface.highlight,
                step.status === 'completed' && 'opacity-70'
              )}
            >
              {/* Step Icon */}
              <div className="flex-shrink-0">
                {step.status === 'pending' && (
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2",
                    theme.border.default
                  )} />
                )}
                {step.status === 'in-progress' && (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                )}
                {step.status === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
                {step.status === 'error' && (
                  <XCircle className="w-5 h-5 text-rose-500" />
                )}
              </div>

              {/* Step Label */}
              <div className="flex-1">
                <p className={cn(
                  "text-sm font-medium",
                  step.status === 'completed' ? theme.text.tertiary : theme.text.primary
                )}>
                  {step.label}
                </p>

                {/* Step Progress */}
                {step.status === 'in-progress' && step.progress !== undefined && (
                  <div className="mt-1">
                    <div className={cn(
                      "h-1 rounded-full overflow-hidden",
                      theme.surface.highlight
                    )}>
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Step Number */}
              <span className={cn("text-xs font-medium", theme.text.tertiary)}>
                {index + 1}/{steps.length}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Success Confetti Animation (CSS-based) - DETERMINISTIC RENDERING */}
      {showSuccess && (
        <div className="relative h-0 overflow-visible">
          <div className="absolute inset-0 pointer-events-none">
            {/* LAYOUT STABILITY: Fixed count for predictable layout */}
            {[...Array(10)].map((_unused, i) => (
              <div
                key={`confetti-${i}`}
                className="absolute w-2 h-2 bg-emerald-500 rounded-full animate-confetti"
                style={{
                  left: `${(i * 10) % 100}%`, // Deterministic position
                  animationDelay: `${i * 0.1}s`, // Deterministic delay
                  opacity: 0.5 + (i % 3) * 0.2, // Deterministic opacity
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
