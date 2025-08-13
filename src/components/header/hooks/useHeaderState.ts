import { useMemo } from "react";
import type {
  MarpEditorHeaderProps,
  UseHeaderStateReturn,
  HeaderBrandingProps,
  ActionControlsWithExportProps,
  SaveStatusProps,
  UseExportControlsReturn,
} from "../types";

/**
 * Header state management hook
 *
 * Handles state processing and memoization for header sub-components.
 * Distributes props to appropriate sub-components with proper memoization
 * to prevent unnecessary re-renders.
 */
const useHeaderState = (
  props: MarpEditorHeaderProps,
  exportControls: UseExportControlsReturn
): UseHeaderStateReturn => {
  // Memoize props for HeaderBranding component (no props needed)
  const brandingProps = useMemo<HeaderBrandingProps>(() => ({}), []);

  // Memoize props for ActionControls component (including export controls)
  const actionProps = useMemo<ActionControlsWithExportProps>(
    () => ({
      isDark: props.isDark,
      onToggleDarkMode: props.onToggleDarkMode,
      onOpenShareDialog: props.onOpenShareDialog,
      onSaveToLocalStorage: props.onSaveToLocalStorage,
      marpSettings: props.marpSettings,
      marpManualSettings: props.marpManualSettings,
      marpIsHydrated: props.marpIsHydrated,
      onMarpSettingsChange: props.onMarpSettingsChange,
      parseManualFrontmatterValues: props.parseManualFrontmatterValues,
      markdown: props.markdown,
      exportControls,
    }),
    [
      props.isDark,
      props.onToggleDarkMode,
      props.onOpenShareDialog,
      props.onSaveToLocalStorage,
      props.marpSettings,
      props.marpManualSettings,
      props.marpIsHydrated,
      props.onMarpSettingsChange,
      props.parseManualFrontmatterValues,
      props.markdown,
      exportControls,
    ]
  );

  // Memoize props for SaveStatus component
  const saveStatusProps = useMemo<SaveStatusProps>(
    () => ({
      saveStatusDisplay: null, // Will be handled by useSaveStatus hook
      onClearSavedData: props.onClearSavedData,
    }),
    [props.onClearSavedData]
  );

  return {
    brandingProps,
    actionProps,
    saveStatusProps,
  };
};

export default useHeaderState;
