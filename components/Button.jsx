import Link from "next/link";

const VARIANTS = {
  primary: "bg-ink text-white hover:bg-black",
  mint: "bg-mint text-ink hover:bg-mint-dark hover:text-white",
  outline: "border border-ink/20 text-ink hover:border-ink hover:bg-cloud",
  ghost: "text-ink hover:bg-cloud",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

const SIZES = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  className = "",
  disabled,
  loading,
  ...props
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={cls} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} disabled={disabled || loading} {...props}>
      {loading ? "Memproses..." : children}
    </button>
  );
}
