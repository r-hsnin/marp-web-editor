/**
 * Marp-related type definitions
 *
 * This file contains all type definitions related to Marp functionality,
 * centralized from the original constants.ts file for better organization
 * and maintainability.
 */

// Marp theme literal type
export type MarpTheme = "default" | "gaia" | "uncover";

// Export format literal type
export type ExportFormat = "html" | "pdf" | "pptx" | "png" | "jpeg";

// UI state types
export type ViewMode = "single" | "overview";
export type MobileTab = "editor" | "preview";

// Configuration interfaces
export interface MarpSettings {
  theme: MarpTheme;
  paginate: boolean;
  header: string;
  footer: string;
  backgroundColor?: string;
  color?: string;
  class?: string;
  [key: string]: unknown;
}

// UI option interfaces
export interface Theme {
  value: MarpTheme;
  label: string;
}

export interface ExportFormatOption {
  value: ExportFormat;
  label: string;
  description?: string;
}
