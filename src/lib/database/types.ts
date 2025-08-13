import type { PrismaClient } from "@prisma/client";

/**
 * Database connection status
 */
export interface DatabaseConnectionStatus {
  connected: boolean;
  error?: string;
  latency?: number;
}

/**
 * Database operation context for logging
 */
export interface DatabaseOperationContext {
  operation: string;
  table?: string;
  operationId?: string;
  startTime: number;
}

/**
 * Extended Prisma client type with additional utilities
 */
export type ExtendedPrismaClient = PrismaClient;

/**
 * Database configuration options
 */
export interface DatabaseConfig {
  logLevel: "query" | "info" | "warn" | "error"[];
  connectionTimeout?: number;
  queryTimeout?: number;
}
