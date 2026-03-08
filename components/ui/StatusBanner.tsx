"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type StatusBannerTone = "success" | "error" | "info";

const toneClassMap: Record<StatusBannerTone, string> = {
  success: "border-primary/30 bg-primary/5 text-primary",
  error: "border-error/30 bg-error/5 text-error",
  info: "border-border bg-surface2 text-text",
};

type StatusBannerProps = {
  children: ReactNode;
  tone?: StatusBannerTone;
  className?: string;
};

export default function StatusBanner({
  children,
  tone = "success",
  className,
}: StatusBannerProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        toneClassMap[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}
