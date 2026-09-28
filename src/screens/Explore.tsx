import { DestinationCard, OperatorCard, TourCard } from "@/components/cards";
import { Chip, ErrorState, Page, Photo, SkeletonCards, UserPhoto } from "@/components/chrome";
import { CATEGORIES, MONTHS } from "@/lib/format";
import { photo } from "@/lib/photos";
import { useApp } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";
import { useState } from "react";

const asks = ["Great Migration safari", "Kilimanjaro trekking", "Mikumi safari"];

const collections = [
  { place: "Tanzania · The Great Migration", title: "Two million animals, one river crossing", image: photo.herd, q: "Great Migration", meta: "4–12 days" },
  { place: "Kenya · Masai Mara & beyond", title: "Big cats, endless plains, the Great Migration", image: photo.lion, q: "Masai Mara", meta: "5–8 days" },
  { place: "Tanzania · Northern circuit", title: "The safari you have always pictured", image: photo.savanna, q: "Serengeti", meta: "6–10 days" },
  { place: "Tanzania · Southern circuit", title: "Big cats and boat safaris, no crowds", image: photo.boat, q: "Ruaha", meta: "7–12 days" },
  { place: "East Africa · Budget safaris", title: "The Big Five, without the big spend", image: photo.jeep, q: "Safari", meta: "From a lighter range" },
  { place: "Kilimanjaro · Meru · Mount Kenya", title: "Climb East Africa's great peaks", image: photo.dawn, q: "Kilimanjaro", meta: "Trekking departures" },
];

const parks = [
  { name: "Ngorongoro Crater", country: "Tanzania", image: photo.savanna, q: "Ngorongoro" },
  { name: "Serengeti National Park", country: "Tanzania", image: photo.herd, q: "Serengeti" },
  { name: "Tarangire National Park", country: "Tanzania", image: photo.elephants, q: "Tarangire" },
  { name: "Lake Manyara National Park", country: "Tanzania", image: photo.giraffe, q: "Manyara" },
  { name: "Maasai Mara", country: "Kenya", image: photo.lion, q: "Mara" },
];

const guides = [
  { kicker: "Safari planning", title: "Maasai Mara vs Serengeti: which safari is better?", image: photo.herd, q: "Serengeti" },
  { kicker: "Travel tips", title: "10 wild animals in Tanzania to see on safari", image: photo.elephants, q: "Tanzania" },
  { kicker: "Safari planning", title: "African safari best time of year, month by month", image: photo.sunset, q: "safari" },
];

const steps = [
  ["Browse safaris", "Search by country, park and budget."],
  ["Compare and shortlist", "Filter by price, duration, comfort and style."],
  ["Request quotes", "Message vetted operators directly. No booking fees."],
  ["Confirm and travel", "Agree the details and pay the operator directly."],
];

function SectionTitle({ title, hint, onViewAll }: { title: string; hint?: string; onViewAll: () => void }) {
  return (
    <div className="px-5">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display text-[24px]">{title}</h2>
        <button type="button" onClick={onViewAll} className="shrink-0 pb-1 text-[13px] font-semibold text-primary">
          View all
        </button>
      </div>
      {hint && <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ExploreScreen() {
  const { user, destinations, operators, tours, reviews, unreadCount, online } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth());
  const [pull, setPull] = useState(0);

  const featured = tours.filter((t) => t.featured && t.status === "published");
  const trending = tours.filter((t) => t.trending && t.status === "published");
  const topOps = operators.filter((o) => o.verified && o.reviewStatus === "approved").slice(0, 8);
  const stories = reviews.filter((r) => r.photos.length && !r.pending).slice(0, 6);
  const seasonal = destinations.filter((d) => d.months[month]?.score >= 2).slice(0, 4);
  const event = destinations.flatMap((d) => d.events.filter((e) => e.month === month).map((e) => `${d.name}: ${e.title}`))[0];

  const refresh = () => {
    if (!online) {
      setFailed(true);
      return;
    }
    setFailed(false);
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <Page tabs="traveler">
      <div
        onTouchStart={(e) => {
          if (window.scrollY < 4) setPull(e.touches[0].clientY);
        }}
        onTouchEnd={(e) => {
          if (pull && e.changedTouches[0].clientY - pull > 70) refresh();
          setPull(0);
        }}
      >
        <header className="flex items-start justify-between px-5 pt-safe">
          <div>
            <p className="eyebrow">Explore</p>
            <h1 className="font-display text-[28px] leading-9">{user ? `Jambo, ${user.firstName}` : "Discover your safari"}</h1>
            <p className="mt-1 text-[14px] leading-5 text-muted-foreground">Compare safaris from verified operators, side by side.</p>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Notifications" onClick={() => navigate({ to: "/notifications" })} className="relative flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-warm">
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-gold" />}
            </button>
            <button aria-label="Profile" onClick={() => navigate({ to: "/profile" })} className="overflow-hidden rounded-full shadow-warm">
              <UserPhoto src={user?.avatar} name={user?.firstName || "Explola"} className="h-12 w-12" />
            </button>
          </div>
        </header>

        <button onClick={() => navigate({ to: "/search" })} className="mx-5 mt-4 flex min-h-[52px] w-[calc(100%-2.5rem)] items-center gap-3 rounded-[14px] bg-sand px-4 text-left text-muted-foreground">
          <Search size={18} /> Where do you want to go?
        </button>
        <div className="h-scroll mt-3 flex gap-2 px-5 pb-2">
          {asks.map((ask) => (
            <Chip key={ask} onClick={() => navigate({ to: "/search", search: { q: ask } })}>
              {ask}
            </Chip>
          ))}
        </div>
        <button onClick={() => navigate({ to: "/request" })} className="mx-5 mt-2 block text-left text-[14px] font-semibold text-primary">
          Plan with our concierge
        </button>

        {!online && (
          <div className="mx-5 mt-4">
            <ErrorState title="No internet" body="Pull to refresh when you are back online." onRetry={refresh} />
          </div>
        )}
        {failed && online && (
          <div className="mx-5 mt-4">
            <ErrorState title="Something went wrong" body="We could not refresh Explore." onRetry={refresh} />
          </div>
        )}

        {loading ? (
          <div className="mt-6">
            <SkeletonCards />
          </div>
        ) : (
          <>
            <section className="mt-5">
              <SectionTitle title="Featured safaris" onViewAll={() => navigate({ to: "/search", search: { tab: "tours" } })} />
              <div className="h-scroll mt-3 flex snap-x snap-mandatory gap-3 px-5 pb-2">
                {featured.map((t) => (
                  <div key={t.id} className="w-[88%] shrink-0 snap-center overflow-hidden rounded-[20px]">
                    <TourCard tour={t} layout="hero" />
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6">
              <SectionTitle title="Browse by interest" onViewAll={() => navigate({ to: "/search", search: { tab: "tours" } })} />
              <div className="h-scroll mt-3 flex gap-2 px-5 pb-2">
                {CATEGORIES.map((c) => (
                  <Chip key={c} onClick={() => navigate({ to: "/search", search: { q: c } })}>
                    {c}
                  </Chip>
                ))}
              </div>
            </section>

            <section className="mt-6">
              <SectionTitle title="Safari by country" onViewAll={() => navigate({ to: "/search", search: { tab: "destinations" } })} />
              <div className="h-scroll mt-3 flex gap-3 px-5 pb-2">
                {destinations.map((d) => (
                  <DestinationCard key={d.id} destination={d} />
                ))}
              </div>
            </section>

            <section className="mt-6">
              <SectionTitle title="Safari collections" hint="Curated themes to start your search" onViewAll={() => navigate({ to: "/search", search: { tab: "tours" } })} />
              <div className="h-scroll mt-3 flex snap-x snap-mandatory gap-3 px-5 pb-2">
                {collections.map((c) => (
                  <button key={c.title} type="button" onClick={() => navigate({ to: "/search", search: { q: c.q } })} className="relative h-52 w-[280px] shrink-0 snap-start overflow-hidden rounded-[20px] text-left">
                    <Photo src={c.image} alt="" className="absolute inset-0 h-full w-full" />
                    <span className="absolute inset-0 bg-gradient-to-t from-[#1A0C0E] via-[#2B1416]/35 to-transparent" />
                    <span className="absolute right-4 bottom-4 left-4 text-white">
                      <span className="block text-[12px] text-[#E3B36F]">{c.place}</span>
                      <span className="mt-1 block font-display text-[22px] leading-7">{c.title}</span>
                      <span className="mt-1 block text-[12px] text-white/80">{c.meta}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-6">
              <SectionTitle title="Popular parks and reserves" onViewAll={() => navigate({ to: "/search", search: { tab: "destinations" } })} />
              <div className="h-scroll mt-3 flex gap-3 px-5 pb-2">
                {parks.map((p) => (
                  <button key={p.name} type="button" onClick={() => navigate({ to: "/search", search: { q: p.q } })} className="relative h-44 w-40 shrink-0 overflow-hidden rounded-[16px] text-left">
                    <Photo src={p.image} alt={p.name} className="absolute inset-0 h-full w-full" />
                    <span className="absolute inset-0 bg-gradient-to-t from-[#3A1418] to-transparent" />
                    <span className="absolute right-3 bottom-3 left-3 text-white">
                      <span className="block font-display text-[18px] leading-6">{p.name}</span>
                      <span className="block text-[12px] text-white/80">{p.country}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-6">
              <SectionTitle title="Trusted tour operators" hint="Every operator is identity-verified and licensed" onViewAll={() => navigate({ to: "/search", search: { tab: "operators" } })} />
              <div className="h-scroll mt-3 flex gap-3 px-5 pb-2">
                {topOps.map((o) => (
                  <OperatorCard key={o.id} operator={o} />
                ))}
              </div>
            </section>

            <section className="mt-6">
              <SectionTitle title="Trending safaris" onViewAll={() => navigate({ to: "/search", search: { tab: "tours" } })} />
              <div className="h-scroll mt-3 flex gap-3 px-5 pb-2">
                {trending.map((t) => (
                  <TourCard key={t.id} tour={t} layout="rail" />
                ))}
              </div>
            </section>

            <section className="mt-6">
              <SectionTitle title="It's migration season" hint="River crossings are peaking. Here is where to go, and when." onViewAll={() => navigate({ to: "/search", search: { q: "Great Migration" } })} />
              <div className="h-scroll mt-3 flex gap-3 px-5 pb-2">
                {guides.map((g) => (
                  <button key={g.title} type="button" onClick={() => navigate({ to: "/search", search: { q: g.q } })} className="w-[260px] shrink-0 overflow-hidden rounded-[20px] bg-card text-left shadow-warm">
                    <Photo src={g.image} alt="" className="h-36 w-full" />
                    <span className="block p-4">
                      <span className="eyebrow">{g.kicker}</span>
                      <span className="mt-1 block font-display text-[18px] leading-6">{g.title}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-6">
              <SectionTitle title="Best time to go" onViewAll={() => navigate({ to: "/search", search: { tab: "destinations" } })} />
              <div className="h-scroll mt-3 flex gap-2 px-5 pb-2">
                {MONTHS.map((m, i) => (
                  <Chip key={m} selected={i === month} onClick={() => setMonth(i)}>
                    {m}
                  </Chip>
                ))}
              </div>
              {event && <p className="mt-3 px-5 text-[14px] text-muted-foreground">{event}</p>}
              <div className="h-scroll mt-3 flex gap-3 px-5 pb-2">
                {seasonal.map((d) => (
                  <DestinationCard key={d.id} destination={d} />
                ))}
              </div>
            </section>

            <section className="mt-6">
              <SectionTitle title="Traveler stories" onViewAll={() => navigate({ to: "/search", search: { tab: "tours" } })} />
              <div className="h-scroll mt-3 flex gap-3 px-5 pb-2">
                {stories.map((r) => (
                  <article key={r.id} className="w-[260px] shrink-0 overflow-hidden rounded-[20px] bg-card shadow-warm">
                    <img src={r.photos[0]} alt="" className="h-36 w-full object-cover" />
                    <div className="p-4">
                      <p className="font-display text-[18px] leading-6">{r.title}</p>
                      <p className="mt-1 line-clamp-3 text-[13px] leading-5 text-muted-foreground">{r.body}</p>
                      <p className="mt-2 text-[12px] text-muted-foreground">
                        {r.author} · {r.country}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-8 px-5">
              <h2 className="font-display text-[24px]">How it works</h2>
              <ol className="mt-3 space-y-3">
                {steps.map(([title, body], i) => (
                  <li key={title} className="flex gap-3 rounded-[16px] bg-card p-4 shadow-warm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand font-display text-[16px] text-primary">{i + 1}</span>
                    <span>
                      <span className="block text-[15px] font-semibold">{title}</span>
                      <span className="block text-[13px] leading-5 text-muted-foreground">{body}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mx-5 mt-8 grid grid-cols-2 gap-2">
              {["Verified operators", "Transparent pricing ranges", "Authentic reviews", "Direct connection, no middlemen"].map((item) => (
                <div key={item} className="rounded-[16px] bg-sand px-3 py-4 text-[13px] font-medium leading-5">
                  {item}
                </div>
              ))}
            </section>

            <button onClick={() => navigate({ to: "/request" })} className="mx-5 mt-6 mb-4 block w-[calc(100%-2.5rem)] rounded-[20px] bg-gradient-to-r from-[#552026] to-[#3A1418] p-5 text-left text-white">
              <p className="font-display text-[22px] leading-7">Plan with our concierge</p>
              <p className="mt-1 text-[14px] text-white/80">Tell us the trip and get quotes from verified operators.</p>
            </button>
          </>
        )}
      </div>
    </Page>
  );
}
