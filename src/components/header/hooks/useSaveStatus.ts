import React, { useMemo } from "react";
import type {
  MarpEditorHeaderProps,
  UseSaveStatusReturn,
  SaveStatusDisplay,
} from "../types";

/**
 * Save status hook
 *
 * Manages save status display logic including status icons, text,
 * and formatting. Handles the visual representation of save states.
 */
const useSaveStatus = (props: MarpEditorHeaderProps): UseSaveStatusReturn => {
  // Destructure props to avoid dependency warnings
  const { hasUnsavedChanges, lastSaved, formatTimeAgo, onClearSavedData } =
    props;

  // Memoize save status display to prevent unnecessary re-renders
  const saveStatusDisplay = useMemo<SaveStatusDisplay | null>(() => {
    if (hasUnsavedChanges) {
      return {
        icon: React.createElement("div", {
          className: "w-2 h-2 rounded-full bg-orange-500 animate-pulse",
        }),
        text: React.createElement(
          "span",
          {
            className: "text-orange-600 dark:text-orange-400",
          },
          "Saving..."
        ),
      };
    } else if (lastSaved) {
      return {
        icon: React.createElement("div", {
          className: "w-2 h-2 rounded-full bg-green-500",
        }),
        text: React.createElement(
          "span",
          {
            className: "text-green-600 dark:text-green-400",
          },
          `Saved ${formatTimeAgo(lastSaved)}`
        ),
      };
    }
    return null;
  }, [hasUnsavedChanges, lastSaved, formatTimeAgo]);

  return {
    saveStatusDisplay,
    onClearSavedData,
    lastSaved,
  };
};

export default useSaveStatus;
