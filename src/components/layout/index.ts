/**
 * Layout component unified export
 * Provides the new restructured layout components
 */

// Main component
export { default } from "./MarpLayout";

// Layout components
export { DesktopLayout } from "./DesktopLayout";
export { MobileLayout } from "./MobileLayout";

// Layout state hook
export { useLayoutState } from "./hooks/useLayoutState";

// Type definitions
export type {
  MarpLayoutProps,
  UseLayoutStateReturn,
  MobileLayoutProps,
  DesktopLayoutProps,
  ToasterProps,
} from "./types";
