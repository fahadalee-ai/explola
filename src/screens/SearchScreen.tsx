import { DestinationCard, OperatorCard, TourCard } from "@/components/cards";
import { Button, Chip, EmptyState, Page, Segmented, Sheet } from "@/components/chrome";
import { ACTIVITIES, CATEGORIES, MONTHS, emptyFilters } from "@/lib/format";
import { activeFilterCount, filterTours, sortTours } from "@/lib/search";
import { useApp } from "@/lib/store";
import type { Filters } from "@/lib/types";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import * as Slider from "@radix-ui/react-slider";

export function SearchScreen({ initialQuery = "", initialTab }: { initialQuery?: string; initialTab?: "tours" | "operators" | "destinations" }) {
  const { tours, operators, destinations, recentSearches, addRecentSearch, removeRecentSearch } = useApp();
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery);
  const [browseAll, setBrowseAll] = useState(Boolean(initialTab));
  useEffect(() => {
    if (!initialQuery) return;
    setQuery(initialQuery);
    setSubmitted(initialQuery);
  }, [initialQuery]);
  const [tab, setTab] = useState(initialTab ?? "tours");
  useEffect(() => {
    if (!initialTab) return;
    setTab(initialTab);
    setBrowseAll(true);
  }, [initialTab]);
  const [sort, setSort] = useState("recommended");
  const [filters, setFilters] = useState<Filters>(emptyFilters());
  const [open, setOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const count = activeFilterCount(filters);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const names = [
      ...destinations.map((d) => d.name),
      ...destinations.flatMap((d) => d.parks),
      ...operators.map((o) => o.name),
      ...tours.map((t) => t.title),
    ];
    return [...new Set(names.filter((n) => n.toLowerCase().includes(q)))].slice(0, 6);
  }, [query, destinations, operators, tours]);

  const results = sortTours(filterTours(tours, operators, destinations, filters, submitted), sort);
  const opResults = operators.filter((o) => {
    if (o.reviewStatus !== "approved") return false;
    if (!submitted) return true;
    return `${o.name} ${o.location} ${o.country}`.toLowerCase().includes(submitted.toLowerCase());
  });
  const destResults = destinations.filter((d) => !submitted || `${d.name} ${d.country} ${d.parks.join(" ")}`.toLowerCase().includes(submitted.toLowerCase()));
  const showResults = Boolean(submitted) || count > 0 || browseAll;

  const go = (q: string) => {
    setQuery(q);
    setSubmitted(q);
    if (q) addRecentSearch(q);
  };

  return (
    <Page tabs="traveler">
      <div className="px-5 pt-safe">
        <h1 className="font-display text-[32px]">Search</h1>
        <label className="mt-3 flex min-h-[52px] items-center gap-2 rounded-[14px] bg-sand px-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go(query)}
            placeholder="Destinations, parks, operators"
            className="h-12 w-full bg-transparent text-[16px] outline-none"
            aria-label="Search safaris"
          />
          {query && (
            <button aria-label="Clear search" onClick={() => { setQuery(""); setSubmitted(""); }}>
              <X size={16} />
            </button>
          )}
        </label>
      </div>

      {!showResults && (
        <div className="px-5 pt-5">
          {suggestions.length > 0 && (
            <ul className="mb-4 overflow-hidden rounded-[16px] bg-card shadow-warm">
              {suggestions.map((s) => (
                <li key={s}>
                  <button className="w-full px-4 py-3 text-left text-[15px]" onClick={() => go(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="eyebrow">Recent</p>
          <ul className="mt-2">
            {recentSearches.map((r) => (
              <li key={r} className="flex items-center justify-between border-b border-border py-3">
                <button className="text-[15px]" onClick={() => go(r)}>
                  {r}
                </button>
                <button aria-label={`Delete ${r}`} className="px-2 text-muted-foreground" onClick={() => removeRecentSearch(r)}>
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
          <p className="eyebrow mt-6">Popular</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Serengeti", "Gorilla trekking", "Zanzibar", "Okavango", "Cape Town"].map((p) => (
              <Chip key={p} onClick={() => go(p)}>
                {p}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {showResults && (
        <div className="px-5 pt-4">
          <Segmented
            value={tab}
            onChange={(id) => setTab(id as "tours" | "operators" | "destinations")}
            options={[
              { id: "tours", label: "Tours" },
              { id: "operators", label: "Operators" },
              { id: "destinations", label: "Destinations" },
            ]}
          />
          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => setSortOpen(true)} className="min-h-11 rounded-full bg-sand px-4 text-[13px] font-semibold">
              Sort
            </button>
            <button onClick={() => setOpen(true)} className="relative min-h-11 rounded-full bg-sand px-4 text-[13px] font-semibold">
              Filters
              {count > 0 && <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] text-primary-foreground">{count}</span>}
            </button>
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            {tab === "tours" ? results.length : tab === "operators" ? opResults.length : destResults.length} results
          </p>

          {tab === "tours" ? (
            results.length === 0 ? (
              <EmptyState title="No safaris match your filters" body="Try a wider budget, a different month, or clear a filter." action="Reset filters" onAction={() => { setFilters(emptyFilters()); setSubmitted(""); setQuery(""); }} />
            ) : (
              <div className="mt-3 space-y-4">
                {results.map((t) => (
                  <TourCard key={t.id} tour={t} />
                ))}
              </div>
            )
          ) : tab === "operators" ? (
            opResults.length === 0 ? (
              <EmptyState title="No operators match" body="Try another name, or clear the search to see verified operators." action="Clear search" onAction={() => { setQuery(""); setSubmitted(""); }} />
            ) : (
              <div className="mt-3 space-y-3">
                {opResults.map((o) => (
                  <OperatorCard key={o.id} operator={o} layout="list" />
                ))}
              </div>
            )
          ) : destResults.length === 0 ? (
            <EmptyState title="No destinations match" body="Try a country or park name, or clear the search." action="Clear search" onAction={() => { setQuery(""); setSubmitted(""); }} />
          ) : (
            <div className="mt-3 flex flex-wrap gap-3">
              {destResults.map((d) => (
                <DestinationCard key={d.id} destination={d} />
              ))}
            </div>
          )}
        </div>
      )}

      <Sheet open={sortOpen} onClose={() => setSortOpen(false)} title="Sort">
        <div className="space-y-2 pb-6">
          {[
            ["recommended", "Recommended"],
            ["price-asc", "Price: low to high"],
            ["price-desc", "Price: high to low"],
            ["rating", "Top rated"],
            ["duration", "Duration"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={`flex min-h-12 w-full items-center rounded-[14px] px-3 text-left ${sort === id ? "bg-primary text-primary-foreground" : "bg-sand"}`}
              onClick={() => {
                setSort(id);
                setSortOpen(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={open} onClose={() => setOpen(false)} title="Filters">
        <div className="space-y-5 pb-4">
          <label className="block text-[13px] font-medium">
            Country
            <select className="mt-1 h-12 w-full rounded-[14px] bg-sand px-3" value={filters.country} onChange={(e) => setFilters({ ...filters, country: e.target.value })}>
              <option value="">Any</option>
              {[...new Set(destinations.map((d) => d.country))].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <FieldLike label="Park or region" value={filters.park} onChange={(park) => setFilters({ ...filters, park })} />
          <div>
            <p className="text-[13px] font-medium">Trip type</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Chip key={c} selected={filters.types.includes(c)} onClick={() => setFilters({ ...filters, types: filters.types.includes(c) ? filters.types.filter((t) => t !== c) : [...filters.types, c] })}>
                  {c}
                </Chip>
              ))}
            </div>
          </div>
          <Range label="Duration (days)" min={3} max={14} value={filters.duration} onChange={(duration) => setFilters({ ...filters, duration })} />
          <Range label="Budget per person (USD)" min={800} max={12000} step={100} value={filters.budget} onChange={(budget) => setFilters({ ...filters, budget })} />
          <label className="block text-[13px] font-medium">
            Travel month
            <select className="mt-1 h-12 w-full rounded-[14px] bg-sand px-3" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}>
              <option value="">Any</option>
              {MONTHS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="block text-[13px] font-medium">
            Accommodation
            <select className="mt-1 h-12 w-full rounded-[14px] bg-sand px-3" value={filters.stay} onChange={(e) => setFilters({ ...filters, stay: e.target.value })}>
              <option value="">Any</option>
              <option>Budget</option>
              <option>Mid-range</option>
              <option>Luxury</option>
            </select>
          </label>
          <div>
            <p className="text-[13px] font-medium">Activities</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ACTIVITIES.map((a) => (
                <Chip key={a} selected={filters.activities.includes(a)} onClick={() => setFilters({ ...filters, activities: filters.activities.includes(a) ? filters.activities.filter((x) => x !== a) : [...filters.activities, a] })}>
                  {a}
                </Chip>
              ))}
            </div>
          </div>
          <label className="block text-[13px] font-medium">
            Operator rating
            <select className="mt-1 h-12 w-full rounded-[14px] bg-sand px-3" value={filters.rating} onChange={(e) => setFilters({ ...filters, rating: Number(e.target.value) })}>
              <option value={0}>Any</option>
              <option value={4}>4+</option>
              <option value={4.5}>4.5+</option>
            </select>
          </label>
          <label className="flex items-center justify-between py-1 text-[15px]">
            Verified only
            <input type="checkbox" checked={filters.verifiedOnly} onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })} className="h-5 w-5 accent-[#552026]" />
          </label>
          <label className="block text-[13px] font-medium">
            Language
            <select className="mt-1 h-12 w-full rounded-[14px] bg-sand px-3" value={filters.language} onChange={(e) => setFilters({ ...filters, language: e.target.value })}>
              <option value="">Any</option>
              {["English", "French", "German", "Swahili"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="block text-[13px] font-medium">
            Private or group
            <select className="mt-1 h-12 w-full rounded-[14px] bg-sand px-3" value={filters.groupType} onChange={(e) => setFilters({ ...filters, groupType: e.target.value })}>
              <option value="">Any</option>
              <option>Private</option>
              <option>Small group</option>
            </select>
          </label>
          <div className="sticky bottom-0 flex gap-2 bg-card py-3">
            <Button variant="tertiary" full onClick={() => setFilters(emptyFilters())}>
              Reset
            </Button>
            <Button
              full
              onClick={() => {
                setOpen(false);
                if (!submitted) setSubmitted(query || " ");
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </Sheet>
    </Page>
  );
}

function FieldLike({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-[13px] font-medium">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-12 w-full rounded-[14px] bg-sand px-3 text-[16px] outline-none" />
    </label>
  );
}

function Range({ label, min, max, step = 1, value, onChange }: { label: string; min: number; max: number; step?: number; value: [number, number]; onChange: (v: [number, number]) => void }) {
  return (
    <div>
      <div className="flex justify-between text-[13px] font-medium">
        <span>{label}</span>
        <span>
          {value[0]} – {value[1]}
        </span>
      </div>
      <Slider.Root className="relative mt-3 flex h-11 w-full touch-none items-center" min={min} max={max} step={step} value={value} onValueChange={(v) => onChange([v[0], v[1]])}>
        <Slider.Track className="relative h-1.5 grow rounded-full bg-sand">
          <Slider.Range className="absolute h-full rounded-full bg-primary" />
        </Slider.Track>
        <Slider.Thumb aria-label="Minimum" className="block h-7 w-7 rounded-full border-2 border-primary bg-card" />
        <Slider.Thumb aria-label="Maximum" className="block h-7 w-7 rounded-full border-2 border-primary bg-card" />
      </Slider.Root>
    </div>
  );
}
