"use client";

import Link from "next/link";

type ReportPageHeaderProps = {
  title: string;
  description: string;
};

export default function ReportPageHeader({
  title,
  description,
}: ReportPageHeaderProps) {
  return (
    <div>
      <Link
        href="/reports"
        className="mb-2 inline-block text-sm text-primary hover:underline"
      >
        &larr; Raporlar
      </Link>
      <h1 className="text-xl font-semibold text-text">{title}</h1>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}
