import { Marp } from '@marp-team/marp-core';
import { useEffect, useMemo, useState } from 'react';

export const useMarp = (markdown: string) => {
  const [html, setHtml] = useState<string>('');
  const [css, setCss] = useState<string>('');
  const [comments, setComments] = useState<string[][]>([]);

  const marp = useMemo(
    () =>
      new Marp({
        html: true,
        minifyCSS: false,
        inlineSVG: true,
        script: false,
      }),
    [],
  );

  useEffect(() => {
    if (!markdown) {
      setHtml('');
      setCss('');
      return;
    }

    try {
      const { html, css, comments } = marp.render(markdown);
      setHtml(html);
      setCss(css);
      setComments(comments);
    } catch (e) {
      console.error('Marp rendering failed:', e);
    }
  }, [markdown, marp]);

  return { html, css, comments };
};
