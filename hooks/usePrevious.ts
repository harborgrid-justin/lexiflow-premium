/**
 * usePrevious Hook
 * Track previous value of a state or prop
 */

import { useEffect, useRef } from 'react';

/**
 * Returns the previous value of a state or prop
 *
 * @example
 * const [count, setCount] = useState(0);
 * const previousCount = usePrevious(count);
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export default usePrevious;
