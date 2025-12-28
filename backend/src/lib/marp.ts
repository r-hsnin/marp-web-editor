import { existsSync } from 'node:fs';
import fs, { access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { ExportFormat } from '@marp-editor/shared';
import { v4 as uuidv4 } from 'uuid';
import { BUILTIN_THEMES, isValidName } from './validation.js';

export type { ExportFormat };

export interface ConvertOptions {
  markdown: string;
  format: ExportFormat;
  theme?: string;
}

export class MarpConverter {
  private async createTempFile(content: string, extension = 'md'): Promise<string> {
    const tempDir = tmpdir();
    const fileName = `${uuidv4()}.${extension}`;
    const filePath = join(tempDir, fileName);
    await fs.writeFile(filePath, content, 'utf-8');
    return filePath;
  }

  /**
   * Convert relative URLs in CSS to absolute file:// URLs
   */
  private resolveRelativeUrls(css: string, cssDir: string): string {
    return css.replace(/url\(["']?(\.\.?\/[^"')]+)["']?\)/g, (_, relativePath) => {
      const absolutePath = resolve(cssDir, relativePath);
      const fileUrl = pathToFileURL(absolutePath).href;
      return `url("${fileUrl}")`;
    });
  }

  private async cleanup(files: string[]) {
    await Promise.all(
      files.map(async (file) => {
        try {
          await fs.unlink(file);
        } catch {
          // Ignore cleanup errors
        }
      }),
    );
  }

  private getBrowserPath(): string | undefined {
    if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
    if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;

    // Windows Fallback to Edge
    if (process.platform === 'win32') {
      const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
      if (existsSync(edgePath)) {
        return edgePath;
      }
    }
    return undefined;
  }

  async convert(options: ConvertOptions): Promise<Buffer> {
    const { markdown, format, theme } = options;
    const inputPath = await this.createTempFile(markdown, 'md');
    const outputPath = inputPath.replace(/\.md$/, `.${format}`);
    const filesToCleanup = [inputPath, outputPath];

    try {
      // Locate the marp-cli.js script
      const cliPath = resolve(
        process.cwd(),
        'node_modules',
        '@marp-team',
        'marp-cli',
        'marp-cli.js',
      );

      // Use 'node' instead of 'bun' for the child process.
      // Puppeteer/Chrome interaction is unstable under Bun on Windows.
      const args = ['node', cliPath, inputPath, '-o', outputPath, '--allow-local-files'];

      if (theme) {
        // Check if it's a built-in theme
        if (BUILTIN_THEMES.includes(theme as (typeof BUILTIN_THEMES)[number])) {
          args.push('--theme', theme);
        } else {
          // Custom theme - validate name to prevent path traversal
          if (!isValidName(theme)) {
            console.warn(`Invalid theme name: ${theme}. Using default.`);
          } else {
            const themePath = resolve(process.cwd(), 'themes', `${theme}.css`);
            try {
              await access(themePath);
              // Read CSS and convert relative URLs to absolute file:// URLs
              const cssContent = await fs.readFile(themePath, 'utf-8');
              const resolvedCss = this.resolveRelativeUrls(cssContent, dirname(themePath));
              const tempThemePath = await this.createTempFile(resolvedCss, 'css');
              filesToCleanup.push(tempThemePath);
              args.push('--theme-set', tempThemePath);
              args.push('--theme', theme);
            } catch {
              console.warn(`Theme file not found: ${themePath}`);
            }
          }
        }
      }

      const browserPath = this.getBrowserPath();
      const env: Record<string, string | undefined> = {
        ...process.env,
      };

      if (browserPath) {
        console.log(`Using browser at: ${browserPath}`);
        env.CHROME_PATH = browserPath;
      }

      console.log(`Running Marp CLI: ${args.join(' ')}`);

      const proc = Bun.spawn(args, {
        env,
        stdout: 'pipe',
        stderr: 'pipe',
      });

      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      const exitCode = await proc.exited;

      if (exitCode !== 0) {
        console.error('Marp CLI stdout:', stdout);
        console.error('Marp CLI stderr:', stderr);
        throw new Error(`Marp CLI failed with exit code ${exitCode}: ${stderr}`);
      }

      const outputBuffer = await fs.readFile(outputPath);
      return outputBuffer;
    } catch (error) {
      console.error('Marp conversion failed:', error);
      throw error;
    } finally {
      await this.cleanup(filesToCleanup);
    }
  }
}

export const marpConverter = new MarpConverter();
