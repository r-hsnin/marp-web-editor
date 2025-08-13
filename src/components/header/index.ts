export { default } from "./MarpEditorHeader";
export type * from "./types";

// Optional: Export sub-components and hooks for advanced usage
export * from "./hooks";
export * from "./components";

// Settings components (for backward compatibility if needed)
export { ThemeSelector } from "./components/ThemeSelector";
export { PaginationToggle } from "./components/PaginationToggle";
export { HeaderFooterSettings } from "./components/HeaderFooterSettings";
export { useSettingsControls } from "./hooks/useSettingsControls";
