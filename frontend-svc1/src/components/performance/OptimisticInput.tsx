import React, { useEffect, useRef, useState, useTransition } from 'react';

interface OptimisticInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  metricName?: string;
}

/**
 * An input component that prioritizes typing responsiveness over downstream updates.
 * Uses useTransition to defer expensive parent updates.
 * (Principle 10: Input Predictability Under Heavy Render Load)
 * (Principle 3: Intent-Preserving UI)
 */
export const OptimisticInput: React.FC<OptimisticInputProps> = ({
  value: externalValue,
  onChange,
  metricName = 'OptimisticInput',
  ...props
}) => {
  // Local state for immediate feedback
  const [localValue, setLocalValue] = useState(externalValue);
  const [isPending, startTransition] = useTransition();
  const localValueRef = useRef(localValue);

  useEffect(() => {
    localValueRef.current = localValue;
  }, [localValue]);

  // Sync local state if external value changes (e.g. reset form)
  // But ONLY if we are not currently pending an update to avoid race conditions/cursor jumps
  useEffect(() => {
    if (!isPending && externalValue !== localValueRef.current) {
      setLocalValue(externalValue);
    }
  }, [externalValue, isPending]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // 1. Update local state immediately (High Priority)
    setLocalValue(newValue);

    // 2. Defer the parent update (Low Priority)
    startTransition(() => {
      const start = performance.now();
      onChange(newValue);
      const end = performance.now();

      // Simple metric logging (Principle 2)
      if (end - start > 100) {
        console.warn(`[${metricName}] Slow update: ${(end - start).toFixed(2)}ms`);
      }
    });
  };

  return (
    <div className="relative">
      <input
        {...props}
        value={localValue}
        onChange={handleChange}
        className={`${props.className || ''} ${isPending ? 'opacity-70' : ''}`}
      />
      {isPending && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
};
