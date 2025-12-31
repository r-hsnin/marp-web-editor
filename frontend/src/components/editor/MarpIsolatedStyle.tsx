import React from 'react';

export function createIsolatedMarpCSS(css: string): string {
  if (!css) return '';

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

    /* Twemoji emoji fix - prevent line break */
    .marp-content-isolated img.emoji,
    .marp-content-isolated img[data-marp-twemoji] {
      display: inline !important;
      vertical-align: -0.1em !important;
      height: 1em !important;
      width: 1em !important;
      margin: 0 0.05em 0 0.1em !important;
    }
  `;
}

export interface MarpStyleProps {
  css: string;
}

export const MarpIsolatedStyle: React.FC<MarpStyleProps> = ({ css }) => {
  if (!css) return null;

  return React.createElement('style', {
    // biome-ignore lint/security/noDangerouslySetInnerHtml: Necessary for injecting dynamic CSS
    dangerouslySetInnerHTML: {
      __html: createIsolatedMarpCSS(css),
    },
  });
};
