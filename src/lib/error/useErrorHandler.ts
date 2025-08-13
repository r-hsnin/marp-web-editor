"use client";

import { useState, useCallback, useRef } from "react";
import type {
  // AppError, // 未使用
  ErrorState,
  ErrorHandlingOptions,
  ErrorHandlerResult,
} from "./errorTypes";
import {
  processError,
  executeWithErrorHandling,
  executeWithRetry,
} from "./errorProcessor";

export interface UseErrorHandlerReturn {
  errorState: ErrorState;
  handleError: (
    error: Error | string,
    options?: ErrorHandlingOptions
  ) => Promise<ErrorHandlerResult>;
  executeWithHandling: <T>(
    fn: () => Promise<T> | T,
    options?: ErrorHandlingOptions
  ) => Promise<ErrorHandlerResult & { data?: T }>;
  executeWithRetry: <T>(
    fn: () => Promise<T> | T,
    options?: ErrorHandlingOptions
  ) => Promise<ErrorHandlerResult & { data?: T }>;
  clearError: () => void;
  isProcessing: boolean;
}

/**
 * エラーハンドリング用のReactフック
 * 旧ErrorHandlerクラスの機能をフック形式で提供
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    isProcessing: false,
    retryCount: 0,
  });

  const processingRef = useRef(false);

  const handleError = useCallback(
    async (
      error: Error | string,
      options: ErrorHandlingOptions = {}
    ): Promise<ErrorHandlerResult> => {
      setErrorState((prev) => ({ ...prev, isProcessing: true }));
      processingRef.current = true;

      try {
        const result = await processError(error, options);

        setErrorState({
          hasError: true,
          error: result.error || null,
          isProcessing: false,
          retryCount: 0,
        });

        return result;
      } finally {
        processingRef.current = false;
        setErrorState((prev) => ({ ...prev, isProcessing: false }));
      }
    },
    []
  );

  const executeWithHandling = useCallback(
    async <T>(
      fn: () => Promise<T> | T,
      options: ErrorHandlingOptions = {}
    ): Promise<ErrorHandlerResult & { data?: T }> => {
      setErrorState((prev) => ({ ...prev, isProcessing: true }));
      processingRef.current = true;

      try {
        const result = await executeWithErrorHandling(fn, options);

        if (result.success) {
          setErrorState({
            hasError: false,
            error: null,
            isProcessing: false,
            retryCount: 0,
          });
        } else {
          setErrorState({
            hasError: true,
            error: result.error || null,
            isProcessing: false,
            retryCount: 0,
          });
        }

        return result;
      } finally {
        processingRef.current = false;
        setErrorState((prev) => ({ ...prev, isProcessing: false }));
      }
    },
    []
  );

  const executeWithRetryHandler = useCallback(
    async <T>(
      fn: () => Promise<T> | T,
      options: ErrorHandlingOptions = {}
    ): Promise<ErrorHandlerResult & { data?: T }> => {
      setErrorState((prev) => ({ ...prev, isProcessing: true }));
      processingRef.current = true;

      try {
        const result = await executeWithRetry(fn, options);

        if (result.success) {
          setErrorState({
            hasError: false,
            error: null,
            isProcessing: false,
            retryCount: 0,
          });
        } else {
          setErrorState({
            hasError: true,
            error: result.error || null,
            isProcessing: false,
            retryCount: options.maxRetries || 3,
          });
        }

        return result;
      } finally {
        processingRef.current = false;
        setErrorState((prev) => ({ ...prev, isProcessing: false }));
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      isProcessing: false,
      retryCount: 0,
    });
  }, []);

  return {
    errorState,
    handleError,
    executeWithHandling,
    executeWithRetry: executeWithRetryHandler,
    clearError,
    isProcessing: processingRef.current,
  };
}
