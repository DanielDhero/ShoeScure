import Button from "./Button";

export default function EmptyState({ icon = "📦", title, subtitle, actionLabel, actionHref }) {
  return (
    <div className="grid place-items-center rounded-card border border-dashed border-line bg-cloud/50 px-6 py-20 text-center">
      <div className="text-5xl">{icon}</div>
      <h2 className="mt-4 text-lg font-bold text-ink">{title}</h2>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-muted">{subtitle}</p>}
      {actionLabel && actionHref && (
        <Button href={actionHref} variant="primary" className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
