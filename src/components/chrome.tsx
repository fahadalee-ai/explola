import logoColor from "@/img/logo.png";
import logoWhite from "@/img/logo-white.png";
import { cn } from "@/lib/utils";
import { Link, useRouter, useCanGoBack, useRouterState } from "@tanstack/react-router";
import {
  BadgeCheck,
  Compass,
  Heart,
  Home,
  LayoutDashboard,
  Leaf,
  Loader2,
  MessageSquare,
  Search,
  Star,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import { haptic } from "@/lib/format";
import { defaultProfilePhoto } from "@/lib/photos";

export function UserPhoto({ src, name, className }: { src?: string; name?: string; className?: string }) {
  const [useDefault, setUseDefault] = useState(!src);
  useEffect(() => setUseDefault(!src), [src]);
  const photo = useDefault ? defaultProfilePhoto : src;
  return (
    <span className={cn("relative block overflow-hidden rounded-full bg-[#E7D3B0]", className)}>
      <img
        src={photo}
        alt={name ? `${name}'s profile photo` : "Profile photo"}
        className="absolute inset-0 h-full w-full object-cover"
        onError={() => {
          if (!useDefault) setUseDefault(true);
        }}
      />
    </span>
  );
}

export function Logo({ variant = "color", className }: { variant?: "color" | "white"; className?: string }) {
  return (
    <img
      src={variant === "white" ? logoWhite : logoColor}
      alt="Explola, explore with confidence"
      className={cn("h-14 w-auto max-w-[240px] object-contain", className)}
    />
  );
}

export function Photo({
  src,
  alt,
  className,
  eager,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [on, setOn] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setOn(false);
    setFailed(false);
  }, [src]);
  return (
    <div className={cn("relative overflow-hidden bg-sand", className)}>
      {failed ? (
        <span className="absolute inset-0 flex items-center justify-center bg-[#E7D3B0] text-[11px] text-[#552026]">Photo unavailable</span>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          onLoad={() => setOn(true)}
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-cover transition-opacity duration-500", on ? "opacity-100" : "opacity-0")}
        />
      )}
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "tertiary" | "text" | "destructive";
  loading?: boolean;
  full?: boolean;
};

export function Button({ variant = "primary", loading, full = false, className, children, disabled, ...props }: BtnProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      onClick={(e) => {
        if (!disabled && !loading) haptic(8);
        props.onClick?.(e);
      }}
      className={cn(
        "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[14px] px-5 text-[15px] font-semibold transition active:scale-[0.98] disabled:opacity-40",
        full && "w-full",
        variant === "primary" && "bg-primary text-primary-foreground shadow-warm",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "tertiary" && "border border-border bg-card text-foreground",
        variant === "text" && "min-h-11 bg-transparent text-primary",
        variant === "destructive" && "bg-destructive text-destructive-foreground",
        className,
      )}
    >
      {loading && <Loader2 className="animate-spin" size={18} />}
      {children}
    </button>
  );
}

export function IconButton({ label, className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      {...props}
      className={cn(
        "inline-flex h-12 w-12 items-center justify-center rounded-full bg-card/90 text-foreground shadow-warm backdrop-blur transition active:scale-95",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  error,
  icon,
  trailing,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[13px] font-medium text-foreground">{label}</span>
      <span
        className={cn(
          "flex min-h-[52px] items-center gap-2 rounded-[14px] border bg-sand px-3",
          error ? "border-destructive" : "border-transparent focus-within:border-gold",
        )}
      >
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <input
          {...props}
          className="h-12 w-full bg-transparent text-[16px] text-foreground outline-none placeholder:text-muted-foreground"
        />
        {trailing}
      </span>
      {error ? <span className="mt-1 block text-[12px] text-destructive">{error}</span> : hint ? <span className="mt-1 block text-[12px] text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      <textarea
        {...props}
        className={cn(
          "min-h-28 w-full rounded-[14px] border bg-sand px-3 py-3 text-[16px] outline-none",
          error ? "border-destructive" : "border-transparent focus:border-gold",
        )}
      />
      {error && <span className="mt-1 block text-[12px] text-destructive">{error}</span>}
    </label>
  );
}

export function Chip({
  selected,
  children,
  onClick,
}: {
  selected?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium transition active:scale-[0.98]",
        selected ? "bg-primary text-primary-foreground" : "bg-sand text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid rounded-[14px] bg-sand p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "min-h-10 rounded-[11px] px-2 text-[13px] font-semibold",
            value === o.id ? "bg-card text-foreground shadow-warm" : "text-muted-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Rating({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[13px] font-medium text-foreground">
      <Star size={size} className="fill-gold text-gold" aria-hidden />
      <span>{value.toFixed(1)}</span>
      {typeof count === "number" && <span className="font-normal text-muted-foreground">({count})</span>}
    </span>
  );
}

export function Verified({ compact }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#2B1416] px-2 py-1 text-[11px] font-semibold text-[#E3B36F]">
      <BadgeCheck size={13} aria-hidden />
      {compact ? "Verified" : "Verified Operator"}
    </span>
  );
}

export function Tag({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "green" | "sand" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
        tone === "gold" && "bg-gradient-to-r from-[#CD984A] to-[#E3B36F] text-[#2B1416]",
        tone === "green" && "bg-success/15 text-success",
        tone === "sand" && "bg-sand text-foreground",
      )}
    >
      {tone === "green" && <Leaf size={12} aria-hidden />}
      {children}
    </span>
  );
}

export function PriceLine({ from, to, currencyLabel }: { from: string; to: string; currencyLabel?: string }) {
  return (
    <p className="text-[14px] text-foreground">
      <span className="text-muted-foreground">From </span>
      <span className="font-semibold">
        {from} – {to}
      </span>
      <span className="text-muted-foreground"> per person</span>
      {currencyLabel ? <span className="sr-only"> {currencyLabel}</span> : null}
    </p>
  );
}

export function useGoBack(fallback: "/explore" | "/profile" | "/inquiries" | "/onboarding" | "/operator" = "/explore") {
  const router = useRouter();
  const can = useCanGoBack();
  return () => {
    if (can) router.history.back();
    else router.navigate({ to: fallback });
  };
}

export function BackButton({
  fallback = "/explore",
  className,
}: {
  fallback?: "/explore" | "/profile" | "/inquiries" | "/onboarding" | "/operator";
  className?: string;
}) {
  const go = useGoBack(fallback);
  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={go}
      className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-lg leading-none text-foreground", className)}
    >
      <span aria-hidden>←</span>
    </button>
  );
}

export function Header({
  title,
  subtitle,
  back = true,
  fallback = "/explore",
  right,
  transparent,
}: {
  title?: string;
  subtitle?: string;
  back?: boolean;
  fallback?: "/explore" | "/profile" | "/inquiries" | "/onboarding" | "/operator";
  right?: ReactNode;
  transparent?: boolean;
}) {
  return (
    <header className={cn("sticky top-0 z-30 px-5 pt-safe pb-3", transparent ? "bg-transparent" : "bg-background/95 backdrop-blur")}>
      <div className="flex items-center gap-3">
        {back && <BackButton fallback={fallback} />}
        <div className="min-w-0 flex-1">
          {title && <h1 className="truncate font-display text-[22px] leading-tight">{title}</h1>}
          {subtitle && <p className="truncate text-[13px] text-muted-foreground">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

export function EmptyState({
  title,
  body,
  action,
  onAction,
}: {
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-sand text-gold">
        <Compass size={32} />
      </div>
      <h2 className="font-display text-[24px]">{title}</h2>
      <p className="mt-2 text-[14px] leading-6 text-muted-foreground">{body}</p>
      {action && onAction && (
        <Button className="mt-6" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return (
    <div className="mx-5 rounded-[20px] border border-border bg-card p-5 text-center">
      <h2 className="font-display text-[22px]">{title}</h2>
      <p className="mt-2 text-[14px] leading-6 text-muted-foreground">{body}</p>
      {onRetry && (
        <Button className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function SkeletonCards() {
  return (
    <div className="space-y-4 px-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="overflow-hidden rounded-[20px] bg-card shadow-warm">
          <div className="h-44 animate-pulse bg-sand" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-sand" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-sand" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <button aria-label="Close sheet" className="absolute inset-0 bg-[#2B1416]/40" onClick={onClose} />
      <div className="absolute bottom-0 flex max-h-[88dvh] w-full max-w-[430px] flex-col rounded-t-[28px] bg-card shadow-warm-lg">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="font-display text-[22px]">{title}</h2>
          <button aria-label="Close" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-sand">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-safe">{children}</div>
      </div>
    </div>
  );
}

export function Dialog({
  open,
  title,
  body,
  confirm,
  danger,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirm: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button aria-label="Dismiss dialog" className="absolute inset-0 bg-[#2B1416]/45" onClick={onClose} />
      <div className="relative z-10 m-4 w-full max-w-[380px] rounded-[20px] bg-card p-5 shadow-warm-lg">
        <h2 className="font-display text-[22px]">{title}</h2>
        <p className="mt-2 text-[14px] leading-6 text-muted-foreground">{body}</p>
        <div className="mt-5 flex gap-2">
          <Button variant="tertiary" full onClick={onClose}>
            Cancel
          </Button>
          <Button variant={danger ? "destructive" : "primary"} full onClick={onConfirm}>
            {confirm}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Stepper({ value, min = 0, max = 12, onChange, label }: { value: number; min?: number; max?: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[15px]">{label}</span>
      <div className="flex items-center gap-3">
        <button aria-label={`Decrease ${label}`} type="button" disabled={value <= min} onClick={() => onChange(value - 1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-sand text-lg disabled:opacity-40">
          −
        </button>
        <span className="w-6 text-center font-semibold">{value}</span>
        <button aria-label={`Increase ${label}`} type="button" disabled={value >= max} onClick={() => onChange(value + 1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-sand text-lg disabled:opacity-40">
          +
        </button>
      </div>
    </div>
  );
}

export function ToggleRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-[15px] font-medium">{label}</p>
        {hint && <p className="text-[12px] text-muted-foreground">{hint}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn("relative h-8 w-14 shrink-0 rounded-full transition", checked ? "bg-primary" : "bg-sand")}
      >
        <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white shadow transition", checked ? "left-7" : "left-1")} />
      </button>
    </div>
  );
}

function TabItem({ to, label, icon: Icon, active }: { to: string; label: string; icon: LucideIcon; active: boolean }) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn("flex flex-1 flex-col items-center gap-0.5 py-1 text-[12px] font-medium", active ? "text-primary" : "text-muted-foreground")}
    >
      <Icon size={22} strokeWidth={active ? 2.4 : 1.75} className={active ? "fill-primary/15" : ""} />
      {label}
    </Link>
  );
}

export function TravelerTabs() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useApp();
  const item = (href: string) => path.endsWith(href) || path.includes(`${href}/`);
  const profileOn = item("/profile");
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-card/95 pb-safe backdrop-blur" aria-label="Primary">
      <div className="flex px-2 pt-1">
        <TabItem to="/explore" label="Explore" icon={Home} active={item("/explore")} />
        <TabItem to="/search" label="Search" icon={Search} active={item("/search")} />
        <TabItem to="/saved" label="Saved" icon={Heart} active={item("/saved")} />
        <TabItem to="/inquiries" label="Quotes" icon={MessageSquare} active={item("/inquiries") || item("/messages") || item("/chat") || item("/inquiry")} />
        <Link
          to="/profile"
          aria-current={profileOn ? "page" : undefined}
          className={cn("flex flex-1 flex-col items-center gap-0.5 py-1 text-[12px] font-medium", profileOn ? "text-primary" : "text-muted-foreground")}
        >
          <UserPhoto src={user?.avatar} name={user?.firstName} className={cn("h-[22px] w-[22px]", profileOn && "ring-2 ring-primary")} />
          Profile
        </Link>
      </div>
    </nav>
  );
}

export function OperatorTabs() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const on = (href: string) => path.includes(href);
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-card/95 pb-safe backdrop-blur" aria-label="Operator">
      <div className="flex px-1 pt-1">
        <TabItem to="/operator" label="Dashboard" icon={LayoutDashboard} active={path.endsWith("/operator") || path.endsWith("/operator/")} />
        <TabItem to="/operator/inquiries" label="Inquiries" icon={MessageSquare} active={on("/operator/inquiries") || on("/operator/inquiry")} />
        <TabItem to="/operator/listings" label="Listings" icon={Compass} active={on("/operator/listing")} />
        <TabItem to="/operator/reviews" label="Reviews" icon={Star} active={on("/operator/reviews")} />
        <TabItem to="/operator/account" label="Account" icon={UserRound} active={on("/operator/account") || on("/operator/plans")} />
      </div>
    </nav>
  );
}

export function ToastHost() {
  const { toasts } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[70] flex w-full max-w-[430px] -translate-x-1/2 flex-col gap-2 px-5">
      {toasts.map((t) => (
        <div key={t.id} className="rounded-[16px] bg-primary px-4 py-3 text-primary-foreground shadow-warm-lg" role="status">
          <p className="text-[14px] font-semibold">{t.title}</p>
          {t.body && <p className="text-[13px] text-white/80">{t.body}</p>}
        </div>
      ))}
    </div>
  );
}

export function AuthSheet() {
  const { authPrompt, closeAuthPrompt } = useApp();
  return (
    <Sheet open={Boolean(authPrompt)} onClose={closeAuthPrompt} title="Log in to continue">
      <p className="text-[14px] leading-6 text-muted-foreground">{authPrompt}</p>
      <div className="mt-4 space-y-2 pb-4">
        <Link to="/login" onClick={closeAuthPrompt} className="flex min-h-[52px] items-center justify-center rounded-[14px] bg-primary text-[15px] font-semibold text-primary-foreground">
          Log in
        </Link>
        <Link to="/signup" onClick={closeAuthPrompt} className="flex min-h-[52px] items-center justify-center rounded-[14px] border border-border text-[15px] font-semibold">
          Create an account
        </Link>
      </div>
    </Sheet>
  );
}

export function OfflineBar() {
  const { online } = useApp();
  if (online) return null;
  return (
    <div className="bg-warning px-5 py-2 text-center text-[13px] font-medium text-warning-foreground" role="status">
      You are offline. Saving, quotes, and login are paused until you reconnect.
    </div>
  );
}

export function Page({ children, tabs }: { children: ReactNode; tabs?: "traveler" | "operator" }) {
  const { compareIds } = useApp();
  return (
    <div className={cn("min-h-dvh", tabs && "pb-28")}>
      {children}
      {tabs === "traveler" && compareIds.length > 0 && (
        <Link
          to="/compare"
          className="fixed bottom-[4.5rem] left-1/2 z-40 flex min-h-11 w-[calc(100%-2.5rem)] max-w-[390px] -translate-x-1/2 items-center justify-center rounded-full bg-primary px-4 text-[14px] font-semibold text-primary-foreground"
        >
          Compare {compareIds.length} {compareIds.length === 1 ? "safari" : "safaris"}
        </Link>
      )}
      {tabs === "traveler" && <TravelerTabs />}
      {tabs === "operator" && <OperatorTabs />}
    </div>
  );
}
