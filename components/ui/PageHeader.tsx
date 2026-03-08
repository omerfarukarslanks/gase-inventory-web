"use client";

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export default function PageHeader({
  title,
  description,
  className,
}: PageHeaderProps) {
  return (
    <div className={className}>
      <h1 className="text-xl font-semibold text-text">{title}</h1>
      {description ? <p className="text-sm text-muted">{description}</p> : null}
    </div>
  );
}
