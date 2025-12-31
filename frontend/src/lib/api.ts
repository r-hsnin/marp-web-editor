import type { AppType, ExportFormat, Template } from '@marp-editor/shared';
import { hc } from 'hono/client';
import { API_BASE } from './config';

const client = hc<AppType>(`${API_BASE}/`);

export type { ExportFormat, Template };

export const exportSlide = async (
  markdown: string,
  format: ExportFormat,
  theme?: string,
): Promise<void> => {
  try {
    const response = await client.api.export.$post({
      json: { markdown, format, theme },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    // Handle file download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Determine file extension based on format
    const extension = format;

    // Marp export filenames usually handled by backend Content-Disposition,
    // but we can set a default here if needed.
    // However, the browser might respect the header.
    // Let's try to extract filename from Content-Disposition if available
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `presentation.${extension}`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) {
        filename = match[1];
      }
    }

    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

export const fetchThemes = async (): Promise<string[]> => {
  try {
    const response = await client.api.themes.$get();
    if (!response.ok) {
      throw new Error('Failed to fetch themes');
    }
    const data = await response.json();
    return data.themes;
  } catch (error) {
    console.error('Failed to fetch themes:', error);
    return [];
  }
};

export const fetchTemplates = async (): Promise<Template[]> => {
  try {
    const response = await client.api.templates.$get();
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    const data = await response.json();
    return data.templates;
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return [];
  }
};

export const fetchTemplate = async (name: string): Promise<string> => {
  try {
    const response = await client.api.templates[':name'].$get({
      param: { name },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch template');
    }
    return await response.text();
  } catch (error) {
    console.error(`Failed to fetch template ${name}:`, error);
    throw error;
  }
};
