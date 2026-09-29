import { TourCard } from "@/components/cards";
import { BackButton, Button, Photo, Rating, Segmented, Sheet, Tag, Verified } from "@/components/chrome";
import { money } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Link, useNavigate, useRouter, useCanGoBack } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { Check, ChevronLeft, ChevronRight, Heart, Info, MapPin, Scale, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";

export function TourDetailScreen({ id }: { id: string }) {
  const { tours, operators, reviews, currency, isSaved, toggleSaved, isCompared, toggleCompare, pushToast, requireAuth, markHelpful } = useApp();
  const navigate = useNavigate();
  const router = useRouter();
  const canBack = useCanGoBack();
  const tour = tours.find((t) => t.id === id);
  const [tab, setTab] = useState("Overview");
  const [photo, setPhoto] = useState(0);
  const [viewer, setViewer] = useState(false);
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [priceInfo, setPriceInfo] = useState(false);
  const [reviewFilter, setReviewFilter] = useState("All");
  const images = tour?.images.length ? tour.images : tour?.image ? [tour.image] : [];
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1, align: "start" });
  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => setPhoto(emblaApi.selectedScrollSnap());
    emblaApi.on("select", sync);
    sync();
    return () => {
      emblaApi.off("select", sync);
    };
  }, [emblaApi]);
  useEffect(() => {
    if (!emblaApi || emblaApi.selectedScrollSnap() === photo) return;
    emblaApi.scrollTo(photo);
  }, [emblaApi, photo]);
  if (!tour) {
    return (
      <div className="min-h-dvh px-5 pt-safe">
        <BackButton fallback="/explore" className="mt-2" />
        <h1 className="mt-6 font-display text-[32px] leading-10">This safari is no longer listed</h1>
        <p className="mt-2 text-[15px] leading-6 text-muted-foreground">It may have been removed. You can browse other safaris.</p>
        <Button className="mt-6" onClick={() => navigate({ to: "/explore" })}>
          Browse safaris
        </Button>
      </div>
    );
  }
  const op = operators.find((o) => o.id === tour.operatorId);
  const saved = isSaved("tour", tour.id);
  const compared = isCompared(tour.id);
  const tourReviews = reviews.filter((r) => r.tourId === tour.id && !r.pending);
  const shown = tourReviews.filter((r) => reviewFilter === "All" || r.tripType === reviewFilter || r.month === reviewFilter);
  const similar = tours.filter((t) => t.id !== tour.id && t.destinationIds.some((d) => tour.destinationIds.includes(d))).slice(0, 6);
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    n: tourReviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  const share = async () => {
    const text = `${tour.title} on Explola`;
    if (navigator.share) await navigator.share({ title: tour.title, text }).catch(() => undefined);
    else {
      await navigator.clipboard?.writeText(text);
      pushToast("Link copied");
    }
  };

  return (
    <div className="pb-28">
      <div className="relative h-[420px]">
        <div className="h-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((src, i) => (
              <button key={src + i} className="h-full min-w-0 flex-[0_0_100%]" onClick={() => { setPhoto(i); setViewer(true); }}>
                <Photo src={src} alt={`${tour.title} photo ${i + 1}`} eager={i === 0} className="h-full w-full" />
              </button>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#3A1418]/80 via-transparent to-[#3A1418]/30" />
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute top-1/2 left-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => emblaApi?.scrollNext()}
              className="absolute top-1/2 right-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
        <div className="absolute top-0 right-0 left-0 flex items-center justify-between px-4 pt-safe">
          <button
            aria-label="Go back"
            onClick={() => (canBack ? router.history.back() : navigate({ to: "/explore" }))}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90"
          >
            ←
          </button>
          <div className="flex gap-2">
            <button aria-label="Share" onClick={share} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
              <Share2 size={18} />
            </button>
            <button
              aria-label={saved ? "Remove from saved" : "Save"}
              onClick={() => toggleSaved("tour", tour.id)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90"
            >
              <Heart size={18} className={saved ? "fill-[#552026] text-[#552026]" : ""} />
            </button>
          </div>
        </div>
        <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show photo ${i + 1}`}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-1.5 rounded-full ${i === photo ? "w-6 bg-[#E3B36F]" : "w-1.5 bg-white/70"}`}
              />
            ))}
          </div>
          <span className="rounded-full bg-black/50 px-3 py-1 text-[12px] text-white">
            {photo + 1}/{images.length}
          </span>
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto px-5 py-3 no-scrollbar">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-[76px] w-[92px] shrink-0 rounded-[14px] p-[3px] ${i === photo ? "bg-primary" : "bg-transparent"}`}
            >
              <span className="block h-full w-full overflow-hidden rounded-[11px]">
                <Photo src={src} alt="" className="h-full w-full" />
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="px-5 pt-5">
        <h1 className="font-display text-[32px] leading-10">{tour.title}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {tour.parks.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 rounded-full bg-sand px-3 py-1 text-[12px]">
              <MapPin size={12} /> {p}
            </span>
          ))}
          <Tag tone="sand">{tour.durationDays} days</Tag>
          <Tag tone="sand">{tour.groupType}</Tag>
        </div>
        <div className="mt-3">
          <Rating value={tour.rating} count={tour.reviewCount} />
        </div>

        {op && (
          <Link to="/operators/$id" params={{ id: op.id }} className="mt-4 flex items-center gap-3 rounded-[16px] bg-card p-3 shadow-warm">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-primary-foreground">{op.initials}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{op.name}</span>
              <span className="mt-1 block">{op.verified && <Verified compact />}</span>
            </span>
            <span aria-hidden>›</span>
          </Link>
        )}

        <div className="mt-4 rounded-[20px] bg-card p-4 shadow-warm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] text-muted-foreground">Estimated range</p>
              <p className="font-display text-[24px]">
                {money(tour.priceFrom, currency)} – {money(tour.priceTo, currency)}
              </p>
              <p className="text-[13px] text-muted-foreground">per person</p>
            </div>
            <button aria-label="What affects pricing" onClick={() => setPriceInfo(true)} className="flex h-11 w-11 items-center justify-center rounded-full bg-sand">
              <Info size={18} />
            </button>
          </div>
          <p className="mt-2 text-[13px] leading-5 text-muted-foreground">Final price depends on dates, group size and preferences. Request a personalized quote for an exact price.</p>
        </div>
      </div>

      <div className="sticky top-0 z-20 mt-4 bg-background/95 px-5 py-2 backdrop-blur">
        <Segmented
          value={tab}
          onChange={setTab}
          options={["Overview", "Itinerary", "Included", "Reviews", "Operator"].map((id) => ({ id, label: id }))}
        />
      </div>

      <div className="px-5 pt-4">
        {tab === "Overview" && (
          <div className="space-y-4">
            <p className="text-[16px] leading-6">{tour.description}</p>
            <h2 className="font-display text-[22px]">Highlights</h2>
            <ul className="space-y-2">
              {tour.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-[15px]">
                  <Check size={16} className="mt-1 text-success" /> {h}
                </li>
              ))}
            </ul>
            <h2 className="font-display text-[22px]">Wildlife you may see</h2>
            <div className="flex flex-wrap gap-2">
              {tour.wildlife.map((w) => (
                <Tag key={w} tone="sand">
                  {w}
                </Tag>
              ))}
            </div>
            <p className="text-[14px] text-muted-foreground">Difficulty: {tour.difficulty}</p>
            <p className="text-[14px] text-muted-foreground">Best months: {tour.bestMonths.join(", ")}</p>
            <p className="text-[14px] text-muted-foreground">Languages: {tour.languages.join(", ")}</p>
            <h2 className="font-display text-[22px]">Accommodation</h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {tour.stays.map((s) => (
                <article key={s.name} className="w-56 shrink-0 overflow-hidden rounded-[16px] bg-card shadow-warm">
                  <Photo src={s.image} alt={s.name} className="h-28" />
                  <div className="p-3">
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-[12px] text-muted-foreground">{s.type}</p>
                    <p className="text-[12px] text-muted-foreground">{s.note}</p>
                  </div>
                </article>
              ))}
            </div>
            <h2 className="font-display text-[22px]">Route</h2>
            <div className="relative h-48 overflow-hidden rounded-[16px] bg-[#E7D3B0]">
              <svg viewBox="0 0 100 60" className="h-full w-full">
                <path d="M10 40 C 30 10, 50 50, 90 20" fill="none" stroke="#552026" strokeWidth="1.5" />
                {tour.parks.map((p, i) => (
                  <g key={p}>
                    <circle cx={15 + i * 30} cy={30 - (i % 2) * 10} r="2.5" fill="#CD984A" />
                    <text x={15 + i * 30} y={48} fontSize="4" textAnchor="middle" fill="#2B1416">
                      {p.split(" ")[0]}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )}

        {tab === "Itinerary" && (
          <ol className="space-y-3">
            {tour.days.map((d) => (
              <li key={d.day} className="overflow-hidden rounded-[16px] bg-card shadow-warm">
                <button className="flex w-full items-center gap-3 p-3 text-left" onClick={() => setOpenDay(openDay === d.day ? null : d.day)}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground">{d.day}</span>
                  <span className="flex-1">
                    <span className="block font-semibold">{d.title}</span>
                    <span className="text-[12px] text-muted-foreground">{d.location}</span>
                  </span>
                  <span>{openDay === d.day ? "–" : "+"}</span>
                </button>
                {openDay === d.day && (
                  <div className="px-3 pb-4">
                    <Photo src={d.image} alt="" className="h-40 rounded-[12px]" />
                    <p className="mt-3 text-[15px] leading-6">{d.description}</p>
                    <p className="mt-2 text-[13px] text-muted-foreground">Stay: {d.stay}</p>
                    <p className="text-[13px] text-muted-foreground">Meals: {d.meals}</p>
                    <p className="text-[13px] text-muted-foreground">Activities: {d.activities}</p>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}

        {tab === "Included" && (
          <div className="grid gap-4">
            <List title="Included" items={tour.included} ok />
            <List title="Not included" items={tour.excluded} />
            <p className="text-[14px] leading-6 text-muted-foreground">Cancellation: {tour.cancellation}</p>
          </div>
        )}

        {tab === "Reviews" && (
          <div>
            <div className="mb-3 space-y-1">
              {breakdown.map((b) => (
                <div key={b.star} className="flex items-center gap-2 text-[12px]">
                  <span className="w-6">{b.star}★</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand">
                    <span className="block h-full bg-gold" style={{ width: `${tourReviews.length ? (b.n / tourReviews.length) * 100 : 0}%` }} />
                  </span>
                  <span className="w-4">{b.n}</span>
                </div>
              ))}
            </div>
            <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
              {["All", "Couple", "Family", "Solo", "Honeymoon"].map((f) => (
                <button key={f} onClick={() => setReviewFilter(f)} className={`rounded-full px-3 py-2 text-[13px] ${reviewFilter === f ? "bg-primary text-primary-foreground" : "bg-sand"}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {shown.map((r) => (
                <article key={r.id} className="rounded-[16px] bg-card p-4 shadow-warm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{r.author}</p>
                    <Rating value={r.rating} />
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    {r.country} · {r.date} · {r.tripType}
                    {r.verified && " · Verified traveler"}
                  </p>
                  <h3 className="mt-2 font-display text-[18px]">{r.title}</h3>
                  <p className="mt-1 text-[14px] leading-6">{r.body}</p>
                  {r.photos.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {r.photos.map((p) => (
                        <img key={p} src={p} alt="" className="h-16 w-16 rounded-[12px] object-cover" />
                      ))}
                    </div>
                  )}
                  {r.reply && <p className="mt-3 rounded-[12px] bg-sand p-3 text-[13px]">Operator: {r.reply}</p>}
                  <button className="mt-2 text-[13px] font-semibold text-primary" onClick={() => markHelpful(r.id)}>
                    Helpful ({r.helpful})
                  </button>
                </article>
              ))}
              {shown.length === 0 && <p className="text-[14px] text-muted-foreground">No reviews in this filter yet.</p>}
            </div>
            <Button
              variant="tertiary"
              full
              className="mt-4"
              onClick={() => {
                if (requireAuth("Log in to review this operator")) navigate({ to: "/review/$id", params: { id: tour.operatorId }, search: { tour: tour.id } });
              }}
            >
              Write a review
            </Button>
          </div>
        )}

        {tab === "Operator" && op && (
          <div className="space-y-3">
            <p className="text-[15px] leading-6">{op.story}</p>
            <p className="text-[14px] text-muted-foreground">{op.team}</p>
            <Button full onClick={() => navigate({ to: "/operators/$id", params: { id: op.id } })}>
              View full profile
            </Button>
          </div>
        )}

        <h2 className="mt-8 font-display text-[22px]">Similar tours</h2>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {similar.map((t) => (
            <TourCard key={t.id} tour={t} layout="rail" />
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[430px] -translate-x-1/2 items-center gap-3 border-t border-border bg-card px-5 py-3 pb-safe">
        <button aria-label={saved ? "Remove from saved" : "Save"} onClick={() => toggleSaved("tour", tour.id)} className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] border border-border">
          <Heart className={saved ? "fill-[#552026] text-[#552026]" : ""} />
        </button>
        <button aria-label={compared ? "Remove from compare" : "Compare"} onClick={() => toggleCompare(tour.id)} className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] border border-border">
          <Scale className={compared ? "text-[#552026]" : ""} />
        </button>
        <Button
          full
          onClick={() => {
            if (requireAuth("Log in to request a quote")) navigate({ to: "/request", search: { tour: tour.id } });
          }}
        >
          Request a Quote
        </Button>
      </div>

      {viewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <button aria-label="Close viewer" className="absolute top-safe right-4 z-10 text-white" style={{ top: "max(1rem, env(safe-area-inset-top))" }} onClick={() => setViewer(false)}>
            <X />
          </button>
          <img src={tour.images[photo]} alt="" className="max-h-full max-w-full object-contain" />
          <div className="absolute bottom-8 flex gap-3 text-white">
            <button aria-label="Previous photo" onClick={() => setPhoto((p) => Math.max(0, p - 1))}>
              Prev
            </button>
            <span>
              {photo + 1}/{tour.images.length}
            </span>
            <button aria-label="Next photo" onClick={() => setPhoto((p) => Math.min(tour.images.length - 1, p + 1))}>
              Next
            </button>
          </div>
        </div>
      )}

      <Sheet open={priceInfo} onClose={() => setPriceInfo(false)} title="What affects the price">
        <ul className="space-y-3 pb-6 text-[14px] leading-6 text-muted-foreground">
          <li>Season and how close you are to peak wildlife months.</li>
          <li>Camp or lodge level, and whether the stay is private.</li>
          <li>Group size. Two travelers share a vehicle differently than a family of five.</li>
          <li>Internal flights versus road transfers.</li>
          <li>Park and permit fees, which operators show inside the quote.</li>
        </ul>
      </Sheet>
    </div>
  );
}

function List({ title, items, ok }: { title: string; items: string[]; ok?: boolean }) {
  return (
    <div>
      <h2 className="font-display text-[22px]">{title}</h2>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[15px]">
            {ok ? <Check size={16} className="mt-1 text-success" /> : <X size={16} className="mt-1 text-destructive" />}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
