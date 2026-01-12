import {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

/**
 * Hook for Input Latency Protection and Update Priority Segregation
 *
 * REQUIREMENTS ADDRESSED:
 * - INPUT LATENCY PROTECTION: Separate input state from expensive derived state
 * - IMPLEM: Use startTransition for downstream updates
 * - UPDATE PRIORITY SEGREGATION: Urgent (typing) vs Deferred (updates)
 *
 * @param initialValue Initial input value
 * @param onChange Callback for the expensive update (deferred)
 * @param options Configuration options
 */
export function useOptimizedInput<T = string>(
  initialValue: T,
  onChange?: (value: T) => void,
  options: {
    debounceMs?: number;
    priority?: "urgent" | "normal" | "low"; // unused for now but good for API design
  } = {}
) {
  const [displayValue, setDisplayValue] = useState<T>(initialValue);
  const [isPending, startTransition] = useTransition();

  // Keep track of the actual value committed to parent to avoid fighting
  const committedValueRef = useRef<T>(initialValue);

  // Sync from parent if initialValue changes (and we aren't editing?)
  // This is tricky for controlled inputs. Usually we want to trust the parent.
  // But for optimized input, we maintain local state.
  useEffect(() => {
    if (initialValue !== committedValueRef.current) {
      setDisplayValue(initialValue);
      committedValueRef.current = initialValue;
    }
  }, [initialValue]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | T) => {
      // Handle both event object and direct value
      const newValue =
        e && typeof e === "object" && "target" in e
          ? (e.target.value as unknown as T)
          : (e as T);

      // 1. URGENT UPDATE: Immediate React state update for the UI input
      // This ensures typing remains at 60fps/latency < 100ms
      setDisplayValue(newValue);

      // 2. DEFERRED UPDATE: Schedule the expensive side effect/parent update
      startTransition(() => {
        committedValueRef.current = newValue;
        onChange?.(newValue);
      });
    },
    [onChange]
  );

  return {
    value: displayValue,
    onChange: handleChange,
    isPending,
    setValue: setDisplayValue,
  };
}
