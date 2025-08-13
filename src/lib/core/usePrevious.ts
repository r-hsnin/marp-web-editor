import { useRef, useEffect } from "react";

/**
 * 前回の値を保持するカスタムフック
 * @param value - 追跡したい値
 * @returns 前回の値
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
