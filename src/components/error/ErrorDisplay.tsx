"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

/**
 * ErrorDisplay Component Props
 */
interface ErrorInfo {
  message?: string;
  errorType?: "filesystem" | "timeout" | "syntax" | "network" | "unknown";
  details?: string;
  troubleshooting?: string[];
  canRetry?: boolean;
  operationId?: string;
  processingTime?: number;
  retriesAttempted?: number;
}

interface ErrorDisplayProps {
  error?: ErrorInfo | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  retryAttempt?: number;
  maxRetries?: number;
  isDark?: boolean;
}

/**
 * ErrorDisplay Component
 *
 * Enhanced error display with retry functionality, progress indicators,
 * and troubleshooting guidance for Marp rendering errors.
 */
export default function ErrorDisplay({
  error,
  onRetry,
  isRetrying = false,
  retryAttempt = 0,
  maxRetries = 3,
  isDark = false,
}: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = useCallback(() => {
    setShowDetails((prev) => !prev);
  }, []);

  if (!error) return null;

  const {
    message = "An unknown error occurred",
    errorType = "unknown",
    details = "",
    troubleshooting = [],
    canRetry = true,
    operationId = "",
    processingTime = 0,
    retriesAttempted = 0,
  } = error;

  // Determine error icon and colors based on error type
  const getErrorConfig = (type: ErrorInfo["errorType"]) => {
    switch (type) {
      case "filesystem":
        return {
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12z"
                clipRule="evenodd"
              />
            </svg>
          ),
          bgColor: isDark
            ? "from-red-900/20 to-red-800/20"
            : "from-red-50 to-red-100",
          iconBg: "from-red-500 to-red-600",
          textColor: isDark ? "text-red-300" : "text-red-700",
          title: "File System Error",
        } as const;
      case "timeout":
        return {
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          ),
          bgColor: isDark
            ? "from-yellow-900/20 to-yellow-800/20"
            : "from-yellow-50 to-yellow-100",
          iconBg: "from-yellow-500 to-yellow-600",
          textColor: isDark ? "text-yellow-300" : "text-yellow-700",
          title: "Timeout Error",
        } as const;
      case "syntax":
        return {
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
          bgColor: isDark
            ? "from-orange-900/20 to-orange-800/20"
            : "from-orange-50 to-orange-100",
          iconBg: "from-orange-500 to-orange-600",
          textColor: isDark ? "text-orange-300" : "text-orange-700",
          title: "Syntax Error",
        } as const;
      case "network":
        return {
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
          bgColor: isDark
            ? "from-blue-900/20 to-blue-800/20"
            : "from-blue-50 to-blue-100",
          iconBg: "from-blue-500 to-blue-600",
          textColor: isDark ? "text-blue-300" : "text-blue-700",
          title: "Network Error",
        } as const;
      default:
        return {
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
          bgColor: isDark
            ? "from-gray-900/20 to-gray-800/20"
            : "from-gray-50 to-gray-100",
          iconBg: "from-gray-500 to-gray-600",
          textColor: isDark ? "text-gray-300" : "text-gray-700",
          title: "Unknown Error",
        } as const;
    }
  };

  const config = getErrorConfig(errorType);

  return (
    <div
      className={`h-full flex flex-col bg-gradient-to-br ${config.bgColor} p-8`}
    >
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Error Icon */}
          <div
            className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${config.iconBg} flex items-center justify-center shadow-lg`}
          >
            <div className="text-white">{config.icon}</div>
          </div>

          {/* Error Title */}
          <h3 className={`text-xl font-semibold ${config.textColor}`}>
            {config.title}
          </h3>

          {/* Error Message */}
          <p className={`text-sm ${config.textColor} opacity-90`}>{message}</p>

          {/* Retry Progress */}
          {isRetrying && (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent opacity-60"></div>
                <span className={`text-sm ${config.textColor} opacity-75`}>
                  Retrying... (Attempt {retryAttempt + 1} of {maxRetries})
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((retryAttempt + 1) / maxRetries) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isRetrying && (
            <div className="space-y-3">
              {canRetry && onRetry && (
                <Button onClick={onRetry} className="w-full" variant="default">
                  Try Again
                  {retriesAttempted > 0 && (
                    <span className="ml-2 text-xs opacity-75">
                      ({retriesAttempted} attempts made)
                    </span>
                  )}
                </Button>
              )}

              {details && (
                <Button
                  onClick={toggleDetails}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </Button>
              )}
            </div>
          )}

          {/* Error Details */}
          {showDetails && details && (
            <div
              className={`text-left p-4 rounded-lg bg-black/10 dark:bg-white/10 border border-current/20`}
            >
              <h4 className={`text-sm font-medium ${config.textColor} mb-2`}>
                Error Details:
              </h4>
              <pre
                className={`text-xs ${config.textColor} opacity-75 whitespace-pre-wrap break-words`}
              >
                {details}
              </pre>
              {operationId && (
                <p className={`text-xs ${config.textColor} opacity-50 mt-2`}>
                  Operation ID: {operationId}
                </p>
              )}
              {processingTime > 0 && (
                <p className={`text-xs ${config.textColor} opacity-50`}>
                  Processing time: {processingTime}ms
                </p>
              )}
            </div>
          )}

          {/* Troubleshooting Tips */}
          {troubleshooting.length > 0 && (
            <div
              className={`text-left p-4 rounded-lg bg-black/5 dark:bg-white/5 border border-current/10`}
            >
              <h4 className={`text-sm font-medium ${config.textColor} mb-3`}>
                Troubleshooting Tips:
              </h4>
              <ul className="space-y-2">
                {troubleshooting.map((tip, index) => (
                  <li
                    key={index}
                    className={`text-xs ${config.textColor} opacity-75 flex items-start space-x-2`}
                  >
                    <span className="text-current opacity-50 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
