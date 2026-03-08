import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ReportBadgeTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

const toneClassMap: Record<ReportBadgeTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-green-500/10 text-green-500",
  warning: "bg-yellow-500/10 text-yellow-500",
  danger: "bg-red-500/10 text-red-500",
  neutral: "bg-gray-500/10 text-gray-500",
};

type ReportBadgeProps = {
  children: ReactNode;
  tone?: ReportBadgeTone;
  className?: string;
};

export default function ReportBadge({
  children,
  tone = "primary",
  className,
}: ReportBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
        toneClassMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
