import type { FrontmatterExtraction, MarpSettings } from './settingsTypes';

export const FrontmatterProcessor = {
  /**
   * Extract frontmatter from markdown
   */
  extractFrontmatter: (markdown: string): FrontmatterExtraction => {
    try {
      if (!markdown || typeof markdown !== 'string') {
        return {
          frontmatter: '',
          content: markdown || '',
          hasManualFrontmatter: false,
        };
      }

      const trimmedMarkdown = markdown.trim();

      if (!trimmedMarkdown.startsWith('---')) {
        return {
          frontmatter: '',
          content: markdown,
          hasManualFrontmatter: false,
        };
      }

      const lines = trimmedMarkdown.split('\n');
      let endIndex = -1;

      for (let i = 1; i < lines.length; i++) {
        if (lines[i]?.trim() === '---') {
          endIndex = i;
          break;
        }
      }

      if (endIndex === -1) {
        return {
          frontmatter: '',
          content: markdown,
          hasManualFrontmatter: false,
        };
      }

      const frontmatterLines = lines.slice(0, endIndex + 1);
      const contentLines = lines.slice(endIndex + 1);

      return {
        frontmatter: frontmatterLines.join('\n'),
        content: contentLines.join('\n').trim(),
        hasManualFrontmatter: true,
      };
    } catch (error) {
      console.warn('Failed to extract frontmatter:', error);
      return {
        frontmatter: '',
        content: markdown || '',
        hasManualFrontmatter: false,
      };
    }
  },

  /**
   * Parse settings from frontmatter
   */
  parseSettings: (markdown: string): Partial<MarpSettings> => {
    try {
      const { frontmatter, hasManualFrontmatter } =
        FrontmatterProcessor.extractFrontmatter(markdown);

      if (!hasManualFrontmatter) {
        return {};
      }

      const settings: Partial<MarpSettings> = {};
      const lines = frontmatter.split('\n');

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('#') || trimmedLine === '---') continue;

        const colonIndex = trimmedLine.indexOf(':');
        if (colonIndex > 0) {
          const key = trimmedLine.substring(0, colonIndex).trim().toLowerCase();
          const value = trimmedLine.substring(colonIndex + 1).trim();

          if (key === 'theme') {
            settings.theme = value;
          } else if (key === 'paginate') {
            settings.paginate = value === 'true';
          }
        }
      }

      return settings;
    } catch (error) {
      console.warn('Failed to parse settings:', error);
      return {};
    }
  },

  /**
   * Update frontmatter with new settings
   */
  updateFrontmatter: (markdown: string, newSettings: Partial<MarpSettings>): string => {
    const { content } = FrontmatterProcessor.extractFrontmatter(markdown);

    const currentSettings = FrontmatterProcessor.parseSettings(markdown);
    const mergedSettings = { ...currentSettings, ...newSettings };

    const newFrontmatterLines = ['---', 'marp: true'];

    if (mergedSettings.theme && mergedSettings.theme !== 'default') {
      newFrontmatterLines.push(`theme: ${mergedSettings.theme}`);
    }

    if (mergedSettings.paginate) {
      newFrontmatterLines.push('paginate: true');
    }

    newFrontmatterLines.push('---\n');
    const newFrontmatter = newFrontmatterLines.join('\n');

    return `${newFrontmatter}\n\n${content}`;
  },

  /**
   * Merge content with existing frontmatter
   */
  mergeContentWithFrontmatter: (originalMarkdown: string, newContent: string): string => {
    const { frontmatter, hasManualFrontmatter } =
      FrontmatterProcessor.extractFrontmatter(originalMarkdown);

    if (!hasManualFrontmatter) {
      return newContent;
    }

    return `${frontmatter}\n\n${newContent}`;
  },
};
