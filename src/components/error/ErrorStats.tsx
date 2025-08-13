/**
 * エラー統計情報表示コンポーネント
 */

"use client";

import React from "react";
import { ErrorStatsProps } from "./types";

export const ErrorStats: React.FC<ErrorStatsProps> = ({ stats }) => {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <div>リトライ可能: {stats.retryableErrors}件</div>
        <div className="flex space-x-4">
          {Object.entries(stats.bySeverity).map(([severity, count]) => (
            <span key={severity}>
              {severity}: {count}件
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
