"use client";

import { useState, useCallback } from "react";
import type { SaveState, SaveResult } from "./saveTypes";

export interface UseSaveStateReturn extends SaveState {
  updateSaveState: (result: SaveResult) => void;
  markAsChanged: () => void;
  markAsSaved: () => void;
  resetState: () => void;
  finishInitialLoad: () => void;
  setIsSaving: (saving: boolean) => void;
  setLastSaved: (date: Date | null) => void;
}

/**
 * 保存状態の管理専用フック
 * 自動保存・手動保存の状態を統一管理
 */
export function useSaveState(): UseSaveStateReturn {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const updateSaveState = useCallback((result: SaveResult) => {
    setIsSaving(false);
    if (result.success && result.timestamp) {
      setLastSaved(result.timestamp);
      setHasUnsavedChanges(false);
    }
  }, []);

  const markAsChanged = useCallback(() => {
    if (!isInitialLoad) {
      setHasUnsavedChanges(true);
    }
  }, [isInitialLoad]);

  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false);
    setLastSaved(new Date());
    setIsSaving(false);
  }, []);

  const resetState = useCallback(() => {
    setLastSaved(null);
    setHasUnsavedChanges(false);
    setIsSaving(false);
    setIsInitialLoad(true);
  }, []);

  const finishInitialLoad = useCallback(() => {
    setIsInitialLoad(false);
  }, []);

  const setIsSavingState = useCallback((saving: boolean) => {
    setIsSaving(saving);
  }, []);

  const setLastSavedState = useCallback((date: Date | null) => {
    setLastSaved(date);
  }, []);

  return {
    lastSaved,
    hasUnsavedChanges,
    isSaving,
    isInitialLoad,
    updateSaveState,
    markAsChanged,
    markAsSaved,
    resetState,
    finishInitialLoad,
    setIsSaving: setIsSavingState,
    setLastSaved: setLastSavedState,
  };
}
