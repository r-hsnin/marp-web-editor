/**
 * エラー重要度に応じたスタイル取得ユーティリティ
 */

import { ErrorSeverity, ErrorStyles } from "../types";

/**
 * エラー重要度に応じたスタイルを取得する
 * @param severity - エラー重要度
 * @returns スタイル情報
 */
export const getErrorStyles = (severity: ErrorSeverity): ErrorStyles => {
  switch (severity) {
    case "HIGH":
      return {
        container: "border-red-500 bg-red-50 dark:bg-red-950/20",
        icon: "text-red-500",
        title: "text-red-800 dark:text-red-200",
        description: "text-red-700 dark:text-red-300",
        button:
          "border-red-300 hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900/20",
      };
    case "MEDIUM":
      return {
        container: "border-orange-500 bg-orange-50 dark:bg-orange-950/20",
        icon: "text-orange-500",
        title: "text-orange-800 dark:text-orange-200",
        description: "text-orange-700 dark:text-orange-300",
        button:
          "border-orange-300 hover:bg-orange-100 dark:border-orange-700 dark:hover:bg-orange-900/20",
      };
    case "LOW":
      return {
        container: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
        icon: "text-yellow-500",
        title: "text-yellow-800 dark:text-yellow-200",
        description: "text-yellow-700 dark:text-yellow-300",
        button:
          "border-yellow-300 hover:bg-yellow-100 dark:border-yellow-700 dark:hover:bg-yellow-900/20",
      };
    default:
      return {
        container: "border-gray-500 bg-gray-50 dark:bg-gray-950/20",
        icon: "text-gray-500",
        title: "text-gray-800 dark:text-gray-200",
        description: "text-gray-700 dark:text-gray-300",
        button:
          "border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900/20",
      };
  }
};
