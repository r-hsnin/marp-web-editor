"use client";

import { useState, useEffect, useCallback } from "react";
import { logger } from "../logging/logger";
import { LOG_CATEGORIES } from "../logging/logCategories";
import type { SaveData, SaveResult } from "./saveTypes";
import type { JSONValue } from "../../types/base";

export interface UseLocalStorageReturn<T> {
  data: T | null;
  setData: (data: T) => Promise<SaveResult>;
  removeData: () => Promise<SaveResult>;
  isLoading: boolean;
  error: string | null;
}

/**
 * 型安全なLocalStorage操作フック
 * JSON のシリアライズ・デシリアライズを自動処理
 */
export function useLocalStorage<T extends JSONValue = JSONValue>(
  key: string,
  defaultValue: T | null = null
): UseLocalStorageReturn<T> {
  const [data, setDataState] = useState<T | null>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初期データの読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (typeof window === "undefined") {
          setDataState(defaultValue);
          return;
        }

        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored) as T;
          setDataState(parsed);

          logger.debug(LOG_CATEGORIES.SAVE, "LocalStorage data loaded", {
            key,
            dataSize: stored.length,
          });
        } else {
          setDataState(defaultValue);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        setDataState(defaultValue);

        logger.error(LOG_CATEGORIES.SAVE, "Failed to load from LocalStorage", {
          key,
          error: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key, defaultValue]);

  const setData = useCallback(
    async (newData: T): Promise<SaveResult> => {
      try {
        setError(null);

        if (typeof window === "undefined") {
          return { success: false, error: "LocalStorage not available" };
        }

        const serialized = JSON.stringify(newData);
        localStorage.setItem(key, serialized);
        setDataState(newData);

        const timestamp = new Date();

        logger.debug(LOG_CATEGORIES.SAVE, "Data saved to LocalStorage", {
          key,
          dataSize: serialized.length,
          timestamp: timestamp.toISOString(),
        });

        return { success: true, timestamp };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setError(errorMessage);

        logger.error(LOG_CATEGORIES.SAVE, "Failed to save to LocalStorage", {
          key,
          error: errorMessage,
        });

        return { success: false, error: errorMessage };
      }
    },
    [key]
  );

  const removeData = useCallback(async (): Promise<SaveResult> => {
    try {
      setError(null);

      if (typeof window === "undefined") {
        return { success: false, error: "LocalStorage not available" };
      }

      localStorage.removeItem(key);
      setDataState(defaultValue);

      logger.debug(LOG_CATEGORIES.SAVE, "Data removed from LocalStorage", {
        key,
      });

      return { success: true, timestamp: new Date() };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(errorMessage);

      logger.error(LOG_CATEGORIES.SAVE, "Failed to remove from LocalStorage", {
        key,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }, [key, defaultValue]);

  return {
    data,
    setData,
    removeData,
    isLoading,
    error,
  };
}

/**
 * エディタコンテンツ専用のLocalStorageフック
 */
export function useEditorStorage() {
  return useLocalStorage<SaveData>("marp-editor-content", null);
}
