/**
 * Editor component unified export
 * Provides the new restructured editor component
 */

// Main component (editor functionality only)
export { default } from "./MarpEditor";

// Toolbar component
export { ToolbarButtons } from "./Toolbar";

// Editor state hook
export { useEditorState } from "./hooks/useEditorState";

// Type definitions
export type * from "./types";
