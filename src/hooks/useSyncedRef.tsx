import { useEffect, RefObject } from "react";

export function useSyncedRef<T>(ref: RefObject<T>, value: T) {
  useEffect(() => {
    ref.current = value;
    console.log(value)
  }, [value]);
}