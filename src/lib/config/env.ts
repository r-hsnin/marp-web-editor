/**
 * Environment variable configuration management
 * Centralized configuration for environment-dependent settings
 */

export interface EnvironmentConfig {
  // インフラ・リソース設定
  uploadDir: string;
  maxFileSize: number;
  maxMarkdownSize: number;
  marpExportMaxBuffer: number;

  // タイムアウト設定
  marpCliTimeout: number;
  marpExportTimeout: number;
}

/**
 * Parse environment variable as number with validation
 */
function parseEnvNumber(
  value: string | undefined,
  defaultValue: number
): number {
  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `Invalid environment variable value: ${value}, using default: ${defaultValue}`
      );
    }
    return defaultValue;
  }

  return parsed;
}

/**
 * Parse environment variable as string with validation
 */
function parseEnvString(
  value: string | undefined,
  defaultValue: string
): string {
  if (!value || value.trim() === "") {
    return defaultValue;
  }

  return value.trim();
}

/**
 * Validate and adjust configuration values
 */
function validateConfig(config: EnvironmentConfig): EnvironmentConfig {
  const validated = { ...config };

  // ファイルサイズの上限チェック (100MB)
  if (validated.maxFileSize > 100 * 1024 * 1024) {
    if (process.env.NODE_ENV === "development") {
      console.warn("MAX_FILE_SIZE too large, using 100MB");
    }
    validated.maxFileSize = 100 * 1024 * 1024;
  }

  // Markdownサイズの上限チェック (10MB)
  if (validated.maxMarkdownSize > 10 * 1024 * 1024) {
    if (process.env.NODE_ENV === "development") {
      console.warn("MAX_MARKDOWN_SIZE too large, using 10MB");
    }
    validated.maxMarkdownSize = 10 * 1024 * 1024;
  }

  // エクスポートバッファの上限チェック (500MB)
  if (validated.marpExportMaxBuffer > 500 * 1024 * 1024) {
    if (process.env.NODE_ENV === "development") {
      console.warn("MARP_EXPORT_MAX_BUFFER too large, using 500MB");
    }
    validated.marpExportMaxBuffer = 500 * 1024 * 1024;
  }

  // タイムアウトの下限チェック (1秒)
  if (validated.marpCliTimeout < 1000) {
    if (process.env.NODE_ENV === "development") {
      console.warn("MARP_CLI_TIMEOUT too small, using 1000ms");
    }
    validated.marpCliTimeout = 1000;
  }

  if (validated.marpExportTimeout < 1000) {
    if (process.env.NODE_ENV === "development") {
      console.warn("MARP_EXPORT_TIMEOUT too small, using 1000ms");
    }
    validated.marpExportTimeout = 1000;
  }

  // タイムアウトの上限チェック (10分)
  const maxTimeout = 10 * 60 * 1000;
  if (validated.marpCliTimeout > maxTimeout) {
    if (process.env.NODE_ENV === "development") {
      console.warn("MARP_CLI_TIMEOUT too large, using 10 minutes");
    }
    validated.marpCliTimeout = maxTimeout;
  }

  if (validated.marpExportTimeout > maxTimeout) {
    if (process.env.NODE_ENV === "development") {
      console.warn("MARP_EXPORT_TIMEOUT too large, using 10 minutes");
    }
    validated.marpExportTimeout = maxTimeout;
  }

  return validated;
}

/**
 * Load and validate environment configuration
 */
function loadEnvironmentConfig(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    // インフラ・リソース設定
    uploadDir: parseEnvString(process.env.UPLOAD_DIR, "uploads"),
    maxFileSize: parseEnvNumber(process.env.MAX_FILE_SIZE, 5242880), // 5MB
    maxMarkdownSize: parseEnvNumber(process.env.MAX_MARKDOWN_SIZE, 1048576), // 1MB
    marpExportMaxBuffer: parseEnvNumber(
      process.env.MARP_EXPORT_MAX_BUFFER,
      52428800
    ), // 50MB

    // タイムアウト設定
    marpCliTimeout: parseEnvNumber(process.env.MARP_CLI_TIMEOUT, 30000), // 30秒
    marpExportTimeout: parseEnvNumber(process.env.MARP_EXPORT_TIMEOUT, 60000), // 60秒
  };

  return validateConfig(config);
}

/**
 * Environment configuration singleton
 * Loaded once at application startup
 */
export const ENV_CONFIG: EnvironmentConfig = loadEnvironmentConfig();

// Development mode logging
if (process.env.NODE_ENV === "development") {
  console.log("Environment configuration loaded:", {
    uploadDir: ENV_CONFIG.uploadDir,
    maxFileSize: `${Math.round(ENV_CONFIG.maxFileSize / 1024 / 1024)}MB`,
    maxMarkdownSize: `${Math.round(ENV_CONFIG.maxMarkdownSize / 1024 / 1024)}MB`,
    marpExportMaxBuffer: `${Math.round(ENV_CONFIG.marpExportMaxBuffer / 1024 / 1024)}MB`,
    marpCliTimeout: `${ENV_CONFIG.marpCliTimeout}ms`,
    marpExportTimeout: `${ENV_CONFIG.marpExportTimeout}ms`,
  });
}
