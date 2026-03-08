"use client";

import type { ReactNode } from "react";

type ReportAsyncStateProps = {
  loading: boolean;
  error: string;
  isEmpty: boolean;
  emptyMessage: string;
  children: ReactNode;
  loadingMessage?: string;
};

export default function ReportAsyncState({
  loading,
  error,
  isEmpty,
  emptyMessage,
  children,
  loadingMessage = "Yukleniyor...",
}: ReportAsyncStateProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-surface p-12">
        <p className="text-sm text-muted">{loadingMessage}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-surface p-12">
        <p className="text-sm text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
