import Link from "next/link";
import { cn } from "@/lib/cn";

export type ReportCatalogItem = {
  href: string;
  label: string;
  description: string;
};

type ReportCatalogSectionProps = {
  title: string;
  items: ReportCatalogItem[];
  className?: string;
};

export function ReportCatalogSection({
  title,
  items,
  className,
}: ReportCatalogSectionProps) {
  return (
    <section className={className}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ReportCatalogCard
            key={item.href}
            href={item.href}
            label={item.label}
            description={item.description}
          />
        ))}
      </div>
    </section>
  );
}

type ReportCatalogCardProps = ReportCatalogItem & {
  className?: string;
};

export function ReportCatalogCard({
  href,
  label,
  description,
  className,
}: ReportCatalogCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-xl2 border border-border bg-surface p-4 transition-colors hover:border-primary/30 hover:bg-primary/5",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-text group-hover:text-primary">
        {label}
      </h3>
      <p className="mt-1 text-xs text-muted">{description}</p>
    </Link>
  );
}
