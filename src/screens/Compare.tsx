import { BackButton, Button, EmptyState, Photo, PriceLine } from "@/components/chrome";
import { money } from "@/lib/format";
import { useApp } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";

export function CompareScreen() {
  const { compareIds, tours, operators, currency, toggleCompare, requireAuth } = useApp();
  const navigate = useNavigate();
  const rows = compareIds.map((id) => tours.find((tour) => tour.id === id)).filter((tour) => Boolean(tour));

  return (
    <div className="min-h-dvh px-5 pt-safe pb-10">
      <BackButton fallback="/explore" className="mt-2" />
      <h1 className="mt-4 font-display text-[32px]">Compare</h1>
      <p className="mt-1 text-[15px] leading-6 text-muted-foreground">Up to three safaris, with price, length, and stay level.</p>
      {rows.length === 0 && (
        <EmptyState title="Nothing to compare yet" body="Open a safari and tap Compare. You can hold three at a time." action="Browse safaris" onAction={() => navigate({ to: "/explore" })} />
      )}
      {rows.length > 0 && (
        <div className="mt-5 flex gap-3 overflow-x-auto pb-4">
          {rows.map((tour) => {
            if (!tour) return null;
            const op = operators.find((item) => item.id === tour.operatorId);
            return (
              <article key={tour.id} className="w-[220px] shrink-0 overflow-hidden rounded-[20px] bg-card shadow-warm">
                <Photo src={tour.image} alt="" className="h-32 w-full" />
                <div className="space-y-2 p-3">
                  <h2 className="font-display text-[18px] leading-6">{tour.title}</h2>
                  <p className="text-[13px] text-muted-foreground">{op?.name}</p>
                  <PriceLine from={money(tour.priceFrom, currency)} to={money(tour.priceTo, currency)} />
                  <p className="text-[13px]">{tour.durationDays} days</p>
                  <p className="text-[13px]">{tour.accommodation}</p>
                  <p className="text-[13px] leading-5 text-muted-foreground">{tour.parks.slice(0, 2).join(" · ")}</p>
                  <Button
                    full
                    onClick={() => {
                      if (requireAuth("Log in to request a quote")) navigate({ to: "/request", search: { tour: tour.id } });
                    }}
                  >
                    Request a quote
                  </Button>
                  <button type="button" className="w-full py-2 text-[13px] font-semibold text-muted-foreground" onClick={() => toggleCompare(tour.id)}>
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
