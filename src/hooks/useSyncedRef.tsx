import { useEffect, MutableRefObject } from "react";

export function useSyncedRef<T>(ref: MutableRefObject<T>, value: T) {
  useEffect(() => {
    ref.current = value;
  }, [value]);
}