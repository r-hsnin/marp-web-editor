import { hc } from 'hono/client';
import type { AppType, ExportFormat } from '../../../backend/src/api-types';

export const API_BASE_URL = 'http://localhost:3001/api';

// Ideally, we should extract the route definitions to a shared package.
const client = hc<AppType>('http://localhost:3001');

export type { ExportFormat };

export const exportSlide = async (markdown: string, format: ExportFormat): Promise<void> => {
  try {
    const response = await client.api.export.$post({
      json: { markdown, format },
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
