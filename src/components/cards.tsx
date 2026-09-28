import { Heart, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Photo, PriceLine, Rating, Tag, Verified } from "@/components/chrome";
import { money } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { Destination, Operator, Tour } from "@/lib/types";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/format";

export function TourCard({ tour, layout = "feed" }: { tour: Tour; layout?: "feed" | "rail" | "hero" }) {
  const { currency, operators, isSaved, toggleSaved } = useApp();
  const op = operators.find((o) => o.id === tour.operatorId);
  const saved = isSaved("tour", tour.id);
  if (layout === "hero") {
    return (
      <Link to="/tour/$id" params={{ id: tour.id }} className="relative block h-[420px] w-full shrink-0 snap-center overflow-hidden">
        <Photo src={tour.image} alt={tour.title} eager className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3A1418] via-[#552026]/55 to-transparent" />
        <button
          aria-label={saved ? "Remove from saved" : "Save trip"}
          onClick={(e) => {
            e.preventDefault();
            haptic(12);
            toggleSaved("tour", tour.id);
          }}
          className="absolute top-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/90"
        >
          <Heart size={20} className={saved ? "fill-[#552026] text-[#552026]" : "text-[#2B1416]"} />
        </button>
        <div className="absolute right-0 bottom-0 left-0 p-5 text-white">
          {tour.featured && <Tag>Featured</Tag>}
          <h2 className="mt-2 font-display text-[32px] leading-[40px] text-white">{tour.title}</h2>
          <p className="mt-1 text-[14px] text-white/85">{op?.name}</p>
          <p className="mt-2 text-[14px] text-white">
            From {money(tour.priceFrom, currency)} – {money(tour.priceTo, currency)} per person
          </p>
        </div>
      </Link>
    );
  }
  return (
    <Link
      to="/tour/$id"
      params={{ id: tour.id }}
      className={cn(
        "block overflow-hidden rounded-[20px] bg-card shadow-warm",
        layout === "rail" ? "w-[260px] shrink-0" : "w-full",
      )}
    >
      <div className="relative">
        <Photo src={tour.image} alt="" className={layout === "rail" ? "h-36" : "h-48"} />
        <button
          aria-label={saved ? "Remove from saved" : "Save trip"}
          onClick={(e) => {
            e.preventDefault();
            haptic(12);
            toggleSaved("tour", tour.id);
          }}
          className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90"
        >
          <Heart size={18} className={saved ? "fill-[#552026] text-[#552026]" : "text-[#2B1416]"} />
        </button>
      </div>
      <div className="space-y-1 p-4">
        <div className="flex flex-wrap gap-1">
          {tour.categories.slice(0, 2).map((c) => (
            <Tag key={c} tone="sand">
              {c}
            </Tag>
          ))}
        </div>
        <h3 className="font-display text-[20px] leading-7">{tour.title}</h3>
        <p className="flex items-center gap-1 text-[13px] text-muted-foreground">
          <MapPin size={13} /> {tour.parks[0]} · {tour.durationDays} days
        </p>
        <Rating value={tour.rating} count={tour.reviewCount} />
        <PriceLine from={money(tour.priceFrom, currency)} to={money(tour.priceTo, currency)} />
        <p className="text-[12px] text-muted-foreground">{op?.name}</p>
      </div>
    </Link>
  );
}

export function OperatorCard({ operator, layout = "rail" }: { operator: Operator; layout?: "rail" | "list" }) {
  const saved = useApp().isSaved("operator", operator.id);
  const toggle = useApp().toggleSaved;
  return (
    <Link
      to="/operators/$id"
      params={{ id: operator.id }}
      className={cn("block overflow-hidden rounded-[20px] bg-card shadow-warm", layout === "rail" ? "w-[220px] shrink-0" : "w-full")}
    >
      <div className="relative">
        <Photo src={operator.cover} alt="" className="h-28" />
        <div className="absolute -bottom-5 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-lg text-primary-foreground">
          {operator.initials}
        </div>
        <button
          aria-label={saved ? "Unsave operator" : "Save operator"}
          onClick={(e) => {
            e.preventDefault();
            toggle("operator", operator.id);
          }}
          className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90"
        >
          <Heart size={16} className={saved ? "fill-[#552026] text-[#552026]" : ""} />
        </button>
      </div>
      <div className="px-4 pt-7 pb-4">
        <h3 className="font-display text-[18px] leading-6">{operator.name}</h3>
        <p className="text-[12px] text-muted-foreground">{operator.location}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Rating value={operator.rating} count={operator.reviewCount} />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {operator.verified && <Verified compact />}
          {operator.featured && <Tag>Featured</Tag>}
          {operator.eco && <Tag tone="green">Eco-Certified</Tag>}
        </div>
      </div>
    </Link>
  );
}

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link to="/destination/$id" params={{ id: destination.id }} className="relative block h-44 w-36 shrink-0 overflow-hidden rounded-[16px]">
      <Photo src={destination.image} alt={destination.name} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#3A1418] to-transparent" />
      <p className="absolute right-3 bottom-3 left-3 font-display text-[18px] text-white">{destination.name}</p>
    </Link>
  );
}
