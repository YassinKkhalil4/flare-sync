
import { useCallback, useRef } from 'react';

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const ref = useRef<T>();
  
  return useCallback((...args: Parameters<T>) => {
    if (!ref.current) {
      ref.current = callback;
    }
    return ref.current(...args);
  }, deps) as T;
}
