import React from "react";

export function createIsolatedMarpCSS(css: string): string {
  if (!css) return "";

  return `
    /* Marp CSS with enhanced specificity */
    ${css}
    
    /* Targeted fix for list styles only - preserve all other Marp styling */
    .marp-content-isolated ul {
      list-style-type: disc !important;
      margin-left: 1.5em !important;
      padding-left: 0 !important;
    }
    
    .marp-content-isolated ol {
      list-style-type: decimal !important;
      margin-left: 1.5em !important;
      padding-left: 0 !important;
    }
    
    .marp-content-isolated li {
      display: list-item !important;
      margin: 0.25em 0 !important;
    }
    
    .marp-content-isolated ul ul,
    .marp-content-isolated ol ol,
    .marp-content-isolated ul ol,
    .marp-content-isolated ol ul {
      margin-left: 1.5em !important;
    }
  `;
}

export interface MarpStyleProps {
  css: string;
}

export const MarpIsolatedStyle: React.FC<MarpStyleProps> = ({ css }) => {
  if (!css) return null;

  return React.createElement("style", {
    dangerouslySetInnerHTML: {
      __html: createIsolatedMarpCSS(css),
    },
  });
};
