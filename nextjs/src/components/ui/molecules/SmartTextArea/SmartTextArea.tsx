/**
 * @module components/common/SmartTextArea
 * @category Common
 * @description Auto-resizing textarea with character count, word count, and reading time.
 * 
 * FEATURES:
 * - Dynamic height adjustment based on content
 * - Real-time character/word counting with warnings
 * - Reading time estimation
 * - Undo/redo support
 * - Accessibility compliant
 */

import React, { useRef, useEffect, useState, useCallback, useMemo, useId } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SmartTextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  error?: string;
  /** Maximum character limit */
  maxLength?: number;
  /** Minimum number of rows */
  minRows?: number;
  /** Maximum number of rows before scrolling */
  maxRows?: number;
  /** Show character counter */
  showCounter?: boolean;
  /** Show word counter */
  showWordCount?: boolean;
  /** Show reading time estimation */
  showReadingTime?: boolean;
  /** Warning threshold (percentage of maxLength) */
  warningThreshold?: number;
  /** Value controlled externally */
  value?: string;
  /** Change handler with additional metadata */
  onChange?: (value: string, metadata: TextMetadata) => void;
  /** Custom validation function */
  validate?: (value: string) => string | null;
}

export interface TextMetadata {
  charCount: number;
  wordCount: number;
  lineCount: number;
  readingTimeMinutes: number;
  isOverLimit: boolean;
  percentUsed: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_MIN_ROWS = 3;
const DEFAULT_MAX_ROWS = 20;
const DEFAULT_WARNING_THRESHOLD = 80; // 80% of maxLength
const WORDS_PER_MINUTE = 200; // Average reading speed
const LINE_HEIGHT_PX = 24; // Must match CSS line-height

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Calculate text metadata
 */
const calculateMetadata = (text: string, maxLength?: number): TextMetadata => {
  const charCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const lineCount = text.split('\n').length;
  const readingTimeMinutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
  const isOverLimit = maxLength ? charCount > maxLength : false;
  const percentUsed = maxLength ? Math.min((charCount / maxLength) * 100, 100) : 0;

  return {
    charCount,
    wordCount,
    lineCount,
    readingTimeMinutes,
    isOverLimit,
    percentUsed,
  };
};

/**
 * Get status indicator based on usage
 */
const getStatusIndicator = (percentUsed: number, isOverLimit: boolean, warningThreshold: number) => {
  if (isOverLimit) return { icon: AlertCircle, color: 'text-rose-600', label: 'Over limit' };
  if (percentUsed >= warningThreshold) return { icon: AlertTriangle, color: 'text-amber-600', label: 'Approaching limit' };
  return { icon: CheckCircle, color: 'text-emerald-600', label: 'Within limit' };
};

// ============================================================================
// COMPONENT
// ============================================================================

export function SmartTextArea({
  label,
  error,
  maxLength,
  minRows = DEFAULT_MIN_ROWS,
  maxRows = DEFAULT_MAX_ROWS,
  showCounter = true,
  showWordCount = true,
  showReadingTime = false,
  warningThreshold = DEFAULT_WARNING_THRESHOLD,
  value = '',
  onChange,
  validate,
  className = '',
  ...props
}: SmartTextAreaProps) {
  const { theme } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [internalValue, setInternalValue] = useState(value);
  const [validationError, setValidationError] = useState<string | null>(null);
  const textareaId = useId();
  const errorId = useId();

  // Sync external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Calculate metadata
  const metadata = useMemo(
    () => calculateMetadata(internalValue, maxLength),
    [internalValue, maxLength]
  );

  // Auto-resize textarea based on content
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to recalculate
    textarea.style.height = 'auto';

    // Calculate new height based on content
    const newHeight = Math.min(
      Math.max(
        minRows * LINE_HEIGHT_PX,
        textarea.scrollHeight
      ),
      maxRows * LINE_HEIGHT_PX
    );

    textarea.style.height = `${newHeight}px`;
  }, [minRows, maxRows]);

  // Adjust height when value changes
  useEffect(() => {
    adjustHeight();
  }, [internalValue, adjustHeight]);

  // Handle ResizeObserver for dynamic adjustments
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const resizeObserver = new ResizeObserver(() => {
      adjustHeight();
    });

    resizeObserver.observe(textarea);

    return () => {
      resizeObserver.disconnect();
    };
  }, [adjustHeight]);

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      
      // Enforce maxLength (browser may not respect it in some cases)
      const finalValue = maxLength && newValue.length > maxLength 
        ? newValue.slice(0, maxLength) 
        : newValue;

      setInternalValue(finalValue);

      // Run custom validation
      if (validate) {
        const validationResult = validate(finalValue);
        setValidationError(validationResult);
      }

      // Notify parent with metadata
      if (onChange) {
        const newMetadata = calculateMetadata(finalValue, maxLength);
        onChange(finalValue, newMetadata);
      }
    },
    [maxLength, onChange, validate]
  );

  // Get status indicator
  const status = getStatusIndicator(
    metadata.percentUsed,
    metadata.isOverLimit,
    warningThreshold
  );

  // Determine border color based on state
  const borderColorClass = error || validationError
    ? theme.border.error
    : metadata.isOverLimit
    ? 'border-rose-500 focus:ring-rose-500'
    : metadata.percentUsed >= warningThreshold
    ? 'border-amber-500 focus:ring-amber-500'
    : cn(theme.border.default, theme.border.focused);

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label 
          htmlFor={textareaId}
          className={cn(
            "block text-xs font-semibold uppercase tracking-wide mb-1.5 ml-0.5",
            theme.text.secondary
          )}
        >
          {label}
        </label>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          id={textareaId}
          ref={textareaRef}
          value={internalValue}
          onChange={handleChange}
          maxLength={maxLength}
          className={cn(
            "w-full px-3 py-2 border rounded-md text-sm shadow-sm outline-none transition-all resize-none",
            "placeholder:text-slate-400 dark:placeholder:text-slate-600",
            theme.surface.input,
            theme.text.primary,
            borderColorClass,
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:ring-2 focus:ring-offset-0",
            className
          )}
          style={{
            lineHeight: `${LINE_HEIGHT_PX}px`,
            minHeight: `${minRows * LINE_HEIGHT_PX}px`,
            maxHeight: `${maxRows * LINE_HEIGHT_PX}px`,
          }}
          aria-invalid={!!(error || validationError)}
          aria-describedby={error || validationError ? errorId : undefined}
          {...props}
        />

        {/* Status Indicator (when counter is shown and at warning/error) */}
        {showCounter && maxLength && metadata.percentUsed >= warningThreshold && (
          <div 
            className="absolute top-2 right-2 pointer-events-none"
            title={status.label}
          >
            <status.icon className={cn("h-4 w-4", status.color)} />
          </div>
        )}
      </div>

      {/* Footer with counters and metadata */}
      <div className={cn(
        "mt-1.5 flex items-center justify-between text-xs",
        theme.text.tertiary
      )}>
        {/* Left side: metadata */}
        <div className="flex items-center gap-3">
          {showWordCount && metadata.wordCount > 0 && (
            <span>
              {metadata.wordCount} {metadata.wordCount === 1 ? 'word' : 'words'}
            </span>
          )}
          {showReadingTime && metadata.readingTimeMinutes > 0 && (
            <span>
              ~{metadata.readingTimeMinutes} min read
            </span>
          )}
        </div>

        {/* Right side: character counter */}
        {showCounter && maxLength && (
          <span className={cn(
            "font-medium transition-colors",
            metadata.isOverLimit 
              ? 'text-rose-600' 
              : metadata.percentUsed >= warningThreshold 
              ? 'text-amber-600' 
              : theme.text.tertiary
          )}>
            {metadata.charCount} / {maxLength}
          </span>
        )}
      </div>

      {/* Error message */}
      {(error || validationError) && (
        <p 
          id={errorId}
          className={cn("mt-1.5 text-xs font-medium flex items-center gap-1", theme.status.error.text)}
          role="alert"
        >
          <AlertCircle className="h-3 w-3" />
          {error || validationError}
        </p>
      )}
    </div>
  );
}

export default SmartTextArea;
