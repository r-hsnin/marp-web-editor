import { Marp } from '@marp-team/marp-core';
import { useEffect, useMemo, useState } from 'react';
import { logger } from '../lib/logger';
import { useThemeLoader } from './useThemeLoader';

export const useMarp = (markdown: string) => {
  const [html, setHtml] = useState<string>('');
  const [css, setCss] = useState<string>('');
  const [comments, setComments] = useState<string[][]>([]);

  const { loadedCss, isLoading, activeThemeId } = useThemeLoader();

  const marp = useMemo(() => {
    const instance = new Marp({
      html: true,
      minifyCSS: false,
      inlineSVG: true,
      script: false,
    });

    if (loadedCss) {
      try {
        // Add loaded CSS (Custom or External Official)
        // themeSet.add returns the added Theme object
        const addedTheme = instance.themeSet.add(loadedCss);
        instance.themeSet.default = addedTheme;
      } catch (e) {
        logger.warn('Failed to apply theme:', e);
      }
    } else if (!isLoading && ['default', 'gaia', 'uncover'].includes(activeThemeId)) {
      // Built-in themes
      if (instance.themeSet.has(activeThemeId)) {
        const theme = instance.themeSet.get(activeThemeId);
        if (theme) {
          instance.themeSet.default = theme;
        }
      }
    }

    return instance;
  }, [loadedCss, isLoading, activeThemeId]);

  useEffect(() => {
    if (!markdown) {
      setHtml('');
      setCss('');
      return;
    }

    if (isLoading) return;

    try {
      const { html, css, comments } = marp.render(markdown);
      setHtml(html);
      setCss(css);
      setComments(comments);
    } catch (e) {
      logger.error('Marp rendering failed:', e);
    }
  }, [markdown, marp, isLoading]);

  return { html, css, comments, isLoading };
};
