/**
 * Marp-related constants
 *
 * This file contains all runtime constants and default values related to Marp functionality,
 * centralized from the original constants.ts file for better organization
 * and maintainability.
 */

import type { Theme, ExportFormatOption, MarpSettings } from "@/types/marp";

// Default markdown content
export const DEFAULT_MARKDOWN = `# Welcome to Marp Web Editor

A powerful web-based editor for creating beautiful presentations with Markdown.

---

## Features

- **Live Preview**: See your changes instantly
- **Split View**: Resizable editor and preview panes
- **Export Options**: HTML, PDF, and PPTX formats
- **Theme Support**: Multiple built-in themes

---

## Getting Started

1. Edit the Markdown in the left pane
2. Watch the preview update in real-time
3. Use Marp directives for advanced formatting
4. Export your presentation when ready

---

## Marp Syntax Examples

### Slide with invert colors
\`\`\`markdown
<!-- _class: invert -->
# Inverted Color Slide
\`\`\`

### Background directive
\`\`\`markdown
<!-- _backgroundColor: #f0f0f0 -->
# Slide with custom background
\`\`\`

---

<!-- _class: invert -->

# Start Creating!

Edit this content to begin making your presentation.
`;

// Theme options for UI
export const THEMES: Theme[] = [
  { value: "default", label: "Default" },
  { value: "gaia", label: "Gaia" },
  { value: "uncover", label: "Uncover" },
] as const;

// Export format options for UI
export const EXPORT_FORMATS: ExportFormatOption[] = [
  { value: "html", label: "HTML", description: "Web page format" },
  { value: "pdf", label: "PDF", description: "Portable document format" },
  { value: "pptx", label: "PPTX", description: "PowerPoint presentation" },
] as const;

// Default settings
export const DEFAULT_MARP_SETTINGS: MarpSettings = {
  theme: "default",
  paginate: true,
  header: "",
  footer: "",
} as const;
