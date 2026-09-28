import { OperatorCard, TourCard } from "@/components/cards";
import { BackButton, Button, Photo, Segmented, Verified } from "@/components/chrome";
import { useApp } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

const tabs = ["Overview", "Best Time", "Wildlife and Parks", "Tours", "Operators", "Travel Tips"];

export function DestinationScreen({ id }: { id: string }) {
  const { destinations, tours, operators } = useApp();
  const navigate = useNavigate();
  const dest = destinations.find((d) => d.id === id);
  const [tab, setTab] = useState("Overview");
  if (!dest) return <p className="px-5 pt-safe">This destination is unavailable.</p>;
  const related = tours.filter((t) => t.destinationIds.includes(dest.id) && t.status === "published");
  const ops = operators.filter((o) => o.country === dest.country && o.verified);
  return (
    <div className="pb-28">
      <div className="relative h-72">
        <Photo src={dest.image} alt={dest.name} eager className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3A1418] to-transparent" />
        <div className="absolute left-4" style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}>
          <BackButton className="h-12 w-12 border-0 bg-white/90" />
        </div>
        <div className="absolute right-5 bottom-6 left-5 text-white">
          <h1 className="font-display text-[36px] leading-10">{dest.name}</h1>
          <p className="text-[15px] text-white/85">{dest.tagline}</p>
        </div>
      </div>
      <div className="sticky top-0 z-20 bg-background/95 px-5 py-3 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`shrink-0 rounded-full px-3 py-2 text-[13px] font-semibold ${tab === t ? "bg-primary text-primary-foreground" : "bg-sand"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4 px-5 pt-2">
        {tab === "Overview" && (
          <>
            <p className="text-[16px] leading-6">{dest.description}</p>
            <ul className="space-y-2">
              {dest.highlights.map((h) => (
                <li key={h} className="rounded-[14px] bg-sand px-3 py-3 text-[14px]">{h}</li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(dest.facts).map(([k, v]) => (
                <div key={k} className="rounded-[16px] bg-card p-3 shadow-warm">
                  <p className="eyebrow">{k}</p>
                  <p className="mt-1 text-[13px] leading-5">{v}</p>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === "Best Time" && (
          <div className="space-y-2">
            {dest.months.map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="w-10 text-[13px] font-semibold">{m.month}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand">
                  <span className="block h-full bg-gold" style={{ width: `${(m.score / 3) * 100}%` }} />
                </span>
                <span className="w-36 text-[12px] text-muted-foreground">{m.note}</span>
              </div>
            ))}
          </div>
        )}
        {tab === "Wildlife and Parks" && (
          <>
            <div className="flex flex-wrap gap-2">
              {dest.wildlife.map((w) => (
                <span key={w} className="rounded-full bg-sand px-3 py-2 text-[13px]">{w}</span>
              ))}
            </div>
            <ul className="space-y-2">
              {dest.parks.map((p) => (
                <li key={p} className="rounded-[14px] bg-card px-3 py-3 shadow-warm">{p}</li>
              ))}
            </ul>
          </>
        )}
        {tab === "Tours" && (
          <div className="space-y-4">
            {related.map((t) => (
              <TourCard key={t.id} tour={t} />
            ))}
          </div>
        )}
        {tab === "Operators" && (
          <div className="space-y-3">
            {ops.map((o) => (
              <OperatorCard key={o.id} operator={o} layout="list" />
            ))}
          </div>
        )}
        {tab === "Travel Tips" && (
          <ul className="space-y-2">
            {dest.tips.map((t) => (
              <li key={t} className="rounded-[16px] bg-sand px-4 py-3 text-[14px] leading-6">{t}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 bg-card px-5 py-3 pb-safe">
        <Button full onClick={() => navigate({ to: "/request", search: { destination: dest.id } })}>
          Request a Quote for {dest.name}
        </Button>
      </div>
    </div>
  );
}

export function OperatorProfileScreen({ id }: { id: string }) {
  const { operators, tours, reviews, requireAuth, ensureConversation } = useApp();
  const navigate = useNavigate();
  const op = operators.find((o) => o.id === id);
  const [tab, setTab] = useState("About");
  if (!op) return <p className="px-5 pt-safe">This operator is unavailable.</p>;
  const list = tours.filter((t) => t.operatorId === op.id && t.status === "published");
  const revs = reviews.filter((r) => r.operatorId === op.id && !r.pending);
  const years = new Date().getFullYear() - op.established;
  const hourMatch = op.responseTime.match(/(\d+)\s*hour/i);
  const replyLabel = hourMatch ? `${hourMatch[1]}h` : op.responseTime;
  return (
    <div className="pb-36">
      <div className="relative h-56">
        <Photo src={op.cover} alt="" eager className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3A1418]/80 to-transparent" />
        <div className="absolute left-4" style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}>
          <BackButton className="h-12 w-12 border-0 bg-white/90" />
        </div>
        <div className="absolute bottom-4 left-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary font-display text-xl text-primary-foreground ring-4 ring-background">{op.initials}</div>
      </div>
      <div className="px-5 pt-4">
        <h1 className="font-display text-[32px] leading-10">{op.name}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          {op.verified && <Verified />}
          {op.featured && <span className="rounded-full bg-gradient-to-r from-[#CD984A] to-[#E3B36F] px-2 py-1 text-[11px] font-semibold text-[#2B1416]">Featured</span>}
          {op.topRated && <span className="rounded-full bg-sand px-2 py-1 text-[11px] font-semibold">Top Rated</span>}
          {op.eco && <span className="rounded-full bg-success/15 px-2 py-1 text-[11px] font-semibold text-success">Eco-Certified</span>}
        </div>
        <p className="mt-2 text-[14px] text-muted-foreground">
          {op.location} · Est. {op.established} · {op.rating.toFixed(1)} ({op.reviewCount})
        </p>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[
            [`${years}`, "Years"],
            [`${op.tripsHosted}`, "Trips"],
            [replyLabel, "Reply"],
            [`${op.languages.length}`, "Languages"],
          ].map(([n, l]) => (
            <div key={l} className="rounded-[14px] bg-sand px-1 py-3">
              <p className="font-display text-[16px]">{n}</p>
              <p className="text-[10px] text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Segmented
            value={tab}
            onChange={setTab}
            options={["About", "Tours", "Reviews", "Photos", "Credentials"].map((id) => ({ id, label: id }))}
          />
        </div>
        <div className="mt-4 space-y-3">
          {tab === "About" && (
            <>
              <p className="text-[15px] leading-6">{op.story}</p>
              <h2 className="font-display text-[20px]">Team and guides</h2>
              <p className="text-[14px] leading-6 text-muted-foreground">{op.team}</p>
              <h2 className="font-display text-[20px]">Sustainability</h2>
              <p className="text-[14px] leading-6 text-muted-foreground">{op.sustainability}</p>
              <p className="text-[13px] text-muted-foreground">Languages: {op.languages.join(", ")}</p>
            </>
          )}
          {tab === "Tours" && list.map((t) => <TourCard key={t.id} tour={t} />)}
          {tab === "Reviews" &&
            revs.map((r) => (
              <article key={r.id} className="rounded-[16px] bg-card p-4 shadow-warm">
                <p className="font-semibold">{r.author}</p>
                <p className="font-display text-[18px]">{r.title}</p>
                <p className="text-[14px] leading-6">{r.body}</p>
              </article>
            ))}
          {tab === "Photos" && (
            <div className="grid grid-cols-2 gap-2">
              {list.flatMap((t) => t.images).slice(0, 8).map((src) => (
                <Photo key={src} src={src} alt={`${op.name} safari`} className="h-32 rounded-[12px]" />
              ))}
            </div>
          )}
          {tab === "Credentials" &&
            op.credentials.map((c) => (
              <div key={c.name} className="rounded-[16px] bg-sand p-4">
                <p className="font-semibold">{c.name}</p>
                <p className="text-[13px] text-muted-foreground">{c.detail}</p>
              </div>
            ))}
        </div>
      </div>
      <div className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[430px] -translate-x-1/2 gap-2 bg-card px-5 py-3 pb-safe">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => {
            if (!requireAuth("Log in to message this operator")) return;
            const conv = ensureConversation(op.id);
            if (conv) navigate({ to: "/chat/$id", params: { id: conv } });
          }}
        >
          Message
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            if (!requireAuth("Log in to request a quote")) return;
            navigate({ to: "/request", search: { operator: op.id } });
          }}
        >
          Request a Quote
        </Button>
      </div>
    </div>
  );
}
