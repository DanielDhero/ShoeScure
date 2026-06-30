const STYLES = {
  // green
  PAID: "bg-mint-soft text-mint-dark",
  Authentic: "bg-mint-soft text-mint-dark",
  Done: "bg-mint-soft text-mint-dark",
  Completed: "bg-mint-soft text-mint-dark",
  Sold: "bg-mint-soft text-mint-dark",
  SOLD: "bg-mint-soft text-mint-dark",
  ACCEPTED: "bg-mint-soft text-mint-dark",
  ACTIVE: "bg-sky-100 text-sky-700",
  // amber
  PENDING: "bg-amber-100 text-amber-700",
  COUNTERED: "bg-sky-100 text-sky-700",
  INACTIVE: "bg-cloud text-muted",
  // red
  REJECTED: "bg-red-100 text-red-600",
  "In Review": "bg-amber-100 text-amber-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Listing: "bg-amber-100 text-amber-700",
  Pending: "bg-amber-100 text-amber-700",
  // red
  FAILED: "bg-red-100 text-red-600",
  EXPIRED: "bg-red-100 text-red-600",
  Fake: "bg-red-100 text-red-600",
  Cancelled: "bg-red-100 text-red-600",
};

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || "bg-cloud text-muted";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}>{status}</span>
  );
}
