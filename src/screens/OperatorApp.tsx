import { BackButton, Button, Dialog, OperatorTabs, Page, Segmented, TextArea } from "@/components/chrome";
import { money, relTime, uid } from "@/lib/format";
import { plans } from "@/lib/seed";
import { useApp } from "@/lib/store";
import type { ListingStatus, Tour, TourDay } from "@/lib/types";
import { useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";

function Guard({ children }: { children: ReactNode }) {
  const { user } = useApp();
  const navigate = useNavigate();
  if (!user || user.role !== "operator") {
    return (
      <div className="px-5 pt-safe">
        <h1 className="font-display text-[28px]">Operator mode</h1>
        <p className="mt-2 text-muted-foreground">Register as a tour operator to manage listings and inquiries.</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/operator/onboarding" })}>
          Start verification
        </Button>
      </div>
    );
  }
  return <>{children}</>;
}

export function OperatorDashboard() {
  const app = useApp();
  const navigate = useNavigate();
  const opId = app.user?.operatorId;
  const incoming = app.inquiries.filter((i) => opId && i.operatorIds.includes(opId));
  const mine = app.tours.filter((t) => t.operatorId === opId);
  const rating = app.operators.find((o) => o.id === opId)?.rating ?? 0;
  const data = [
    { w: "W1", n: 2 },
    { w: "W2", n: 4 },
    { w: "W3", n: 3 },
    { w: "W4", n: incoming.length || 1 },
  ];
  return (
    <Guard>
      <Page tabs="operator">
        <div className="px-5 pt-safe">
          {app.user?.verificationStatus === "pending" && (
            <p className="mb-3 rounded-[14px] bg-gold/30 px-3 py-3 text-[13px]">Under review. We usually verify within 3 to 5 days.</p>
          )}
          <p className="eyebrow">Dashboard</p>
          <h1 className="font-display text-[32px]">Jambo, {app.user?.firstName}</h1>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              [String(incoming.filter((i) => i.status === "sent").length), "New inquiries"],
              ["96%", "Response rate"],
              ["1.2k", "Profile views"],
              [rating.toFixed(1), "Average rating"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-[16px] bg-card p-4 shadow-warm">
                <p className="font-display text-[28px]">{n}</p>
                <p className="text-[12px] text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 h-40 rounded-[16px] bg-card p-3 shadow-warm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="w" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Bar dataKey="n" fill="#552026" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <h2 className="mt-5 font-display text-[22px]">Recent inquiries</h2>
          <ul className="mt-2">
            {incoming.slice(0, 4).map((i) => (
              <li key={i.id}>
                <button className="flex w-full justify-between py-3 text-left" onClick={() => navigate({ to: "/operator/inquiry/$id", params: { id: i.id } })}>
                  <span>{i.travelerType} · {i.lengthDays} days</span>
                  <span className="text-[12px] text-muted-foreground">{relTime(i.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-[16px] bg-sand p-4 text-[14px] leading-6">Tip: listings with a day-by-day photo and a clear price range receive more serious inquiries.</p>
          <p className="mt-2 text-[12px] text-muted-foreground">{mine.length} listings on your plan.</p>
        </div>
      </Page>
    </Guard>
  );
}

export function OperatorInquiries() {
  const app = useApp();
  const navigate = useNavigate();
  const opId = app.user?.operatorId;
  const [filter, setFilter] = useState("all");
  const list = app.inquiries.filter((i) => opId && i.operatorIds.includes(opId) && (filter === "all" || i.status === filter));
  return (
    <Guard>
      <Page tabs="operator">
        <div className="px-5 pt-safe">
          <h1 className="font-display text-[32px]">Inquiries</h1>
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
            {["all", "sent", "quoted", "closed"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-2 text-[13px] font-semibold ${filter === f ? "bg-primary text-primary-foreground" : "bg-sand"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {list.map((i) => (
              <button key={i.id} onClick={() => navigate({ to: "/operator/inquiry/$id", params: { id: i.id } })} className="w-full rounded-[16px] bg-card p-4 text-left shadow-warm">
                <p className="font-semibold">{i.travelerType} · {i.adults} adults</p>
                <p className="text-[13px] text-muted-foreground">{i.message || "No note yet"}</p>
                <p className="mt-1 text-[12px] uppercase tracking-wide text-gold">{i.status}</p>
              </button>
            ))}
            {list.length === 0 && <p className="text-[14px] text-muted-foreground">No inquiries in this filter.</p>}
          </div>
        </div>
      </Page>
    </Guard>
  );
}

export function OperatorInquiryDetail({ id }: { id: string }) {
  const app = useApp();
  const inq = app.inquiries.find((i) => i.id === id);
  const [price, setPrice] = useState("4800");
  const [inclusions, setInclusions] = useState("Park fees, private vehicle, meals and accommodation.");
  const [validity, setValidity] = useState("2026-12-01");
  const [note, setNote] = useState("");
  const [reply, setReply] = useState("Thank you for writing. I will send a detailed quote shortly.");
  if (!inq || !app.user?.operatorId) return <p className="px-5 pt-safe">Inquiry unavailable.</p>;
  const traveler = app.accounts.find((a) => a.id === inq.userId);
  return (
    <div className="px-5 pt-safe pb-28">
      <BackButton fallback="/operator" />
      <h1 className="mt-4 font-display text-[28px]">{traveler?.firstName || "Traveler"}</h1>
      <p className="text-[14px] text-muted-foreground">{traveler?.country} · {inq.contactMethod}</p>
      <div className="mt-3 rounded-[16px] bg-sand p-4 text-[14px] leading-6">
        <p>{inq.adults} adults, {inq.children} children · {inq.travelerType}</p>
        <p>{inq.lengthDays} days · {inq.accommodation}</p>
        <p>Budget {money(inq.budgetMin, app.currency)} – {money(inq.budgetMax, app.currency)}</p>
        <p>{inq.message}</p>
        {inq.needs && <p>Needs: {inq.needs}</p>}
      </div>
      <h2 className="mt-5 font-display text-[22px]">Send a quote</h2>
      <div className="mt-2 space-y-2">
        <input className="h-12 w-full rounded-[14px] bg-sand px-3" value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Price per person" />
        <TextArea label="Inclusions" value={inclusions} onChange={(e) => setInclusions(e.target.value)} />
        <input type="date" className="h-12 w-full rounded-[14px] bg-sand px-3" value={validity} onChange={(e) => setValidity(e.target.value)} aria-label="Valid until" />
        <TextArea label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button
          full
          onClick={() =>
            app.sendQuote({
              inquiryId: inq.id,
              operatorId: app.user!.operatorId!,
              price: Number(price) || 0,
              inclusions,
              validity,
              note,
            })
          }
        >
          Send quote
        </Button>
      </div>
      <h2 className="mt-6 font-display text-[22px]">Quick reply</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {["We can host those dates.", "May I suggest a slightly longer stay?", "A porter is included for the trek."].map((t) => (
          <button key={t} className="rounded-full bg-sand px-3 py-2 text-left text-[12px]" onClick={() => setReply(t)}>
            {t}
          </button>
        ))}
      </div>
      <TextArea label="Message" value={reply} onChange={(e) => setReply(e.target.value)} />
      <Button
        variant="secondary"
        className="mt-2"
        onClick={() => {
          const conv = app.conversations.find((c) => c.inquiryId === inq.id)?.id || app.ensureConversation(app.user!.operatorId!, inq.id);
          if (conv) app.sendMessage(conv, reply);
          app.pushToast("Reply sent");
        }}
      >
        Send message
      </Button>
      <OperatorTabs />
    </div>
  );
}

export function ListingsScreen() {
  const app = useApp();
  const navigate = useNavigate();
  const mine = app.tours.filter((t) => t.operatorId === app.user?.operatorId);
  return (
    <Guard>
      <Page tabs="operator">
        <div className="px-5 pt-safe">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-[32px]">Listings</h1>
            <button className="text-[14px] font-semibold text-primary" onClick={() => navigate({ to: "/operator/listing/$id", params: { id: "new" } })}>
              New
            </button>
          </div>
          <p className="text-[13px] text-muted-foreground">Published limit on your plan: {app.listingLimit}</p>
          <div className="mt-4 space-y-3">
            {mine.map((t) => (
              <button key={t.id} onClick={() => navigate({ to: "/operator/listing/$id", params: { id: t.id } })} className="flex w-full gap-3 rounded-[16px] bg-card p-3 text-left shadow-warm">
                <img src={t.image} alt="" className="h-16 w-16 rounded-[12px] object-cover" />
                <span>
                  <span className="block font-semibold">{t.title}</span>
                  <span className="text-[12px] uppercase tracking-wide text-gold">{t.status}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </Page>
    </Guard>
  );
}

const blankDay = (n: number): TourDay => ({
  day: n,
  title: `Day ${n}`,
  description: "",
  location: "",
  stay: "",
  meals: "Breakfast, lunch and dinner",
  activities: "Game drive",
  image: "",
});

export function ListingEditor({ id }: { id: string }) {
  const app = useApp();
  const navigate = useNavigate();
  const existing = app.tours.find((t) => t.id === id);
  const [tour, setTour] = useState<Tour>(() =>
    existing || {
      id: uid("t"),
      title: "",
      operatorId: app.user?.operatorId || "",
      destinationIds: [],
      parks: [],
      image: "",
      images: [],
      durationDays: 5,
      groupType: "Private",
      rating: 0,
      reviewCount: 0,
      priceFrom: 2000,
      priceTo: 4000,
      categories: ["Safari"],
      accommodation: "Mid-range",
      description: "",
      highlights: [],
      wildlife: [],
      difficulty: "Easy",
      bestMonths: ["Jul", "Aug"],
      languages: ["English"],
      included: ["Park fees", "Guide"],
      excluded: ["International flights", "Insurance"],
      cancellation: "Free changes up to 30 days prior.",
      days: [blankDay(1)],
      stays: [],
      status: "draft",
    },
  );
  const [discard, setDiscard] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const save = (status: ListingStatus) => {
    const next = { ...tour, status, image: tour.image || tour.days[0]?.image || "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1400&q=80", images: tour.images.length ? tour.images : [tour.image].filter(Boolean) };
    const err = app.upsertTour(next as Tour);
    if (err) setError(err);
    else navigate({ to: "/operator/listings" });
  };
  if (preview) {
    return (
      <div className="px-5 pt-safe pb-10">
        <button className="text-[14px] font-semibold" onClick={() => setPreview(false)}>Close preview</button>
        <h1 className="mt-3 font-display text-[32px]">{tour.title || "Untitled"}</h1>
        <p className="mt-2 text-[15px] leading-6">{tour.description}</p>
        <p className="mt-2">{money(tour.priceFrom, app.currency)} – {money(tour.priceTo, app.currency)}</p>
        <ol className="mt-4 space-y-2">
          {tour.days.map((d) => (
            <li key={d.day} className="rounded-[12px] bg-sand p-3">
              Day {d.day}: {d.title}
            </li>
          ))}
        </ol>
      </div>
    );
  }
  return (
    <div className="px-5 pt-safe pb-10">
      <button aria-label="Go back" onClick={() => setDiscard(true)} className="flex h-11 w-11 items-center justify-center rounded-full border border-border">←</button>
      <h1 className="mt-3 font-display text-[28px]">{existing ? "Edit listing" : "New listing"}</h1>
      {error && <p className="mt-2 text-[13px] text-destructive">{error}</p>}
      <div className="mt-4 space-y-3">
        <input className="h-12 w-full rounded-[14px] bg-sand px-3" placeholder="Title" value={tour.title} onChange={(e) => setTour({ ...tour, title: e.target.value })} />
        <textarea className="min-h-24 w-full rounded-[14px] bg-sand px-3 py-2" placeholder="Description" value={tour.description} onChange={(e) => setTour({ ...tour, description: e.target.value })} />
        <div className="flex flex-wrap gap-2">
          {app.destinations.map((d) => (
            <button key={d.id} type="button" onClick={() => setTour({ ...tour, destinationIds: tour.destinationIds.includes(d.id) ? tour.destinationIds.filter((x) => x !== d.id) : [...tour.destinationIds, d.id] })} className={`rounded-full px-3 py-2 text-[12px] ${tour.destinationIds.includes(d.id) ? "bg-primary text-primary-foreground" : "bg-sand"}`}>
              {d.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input className="h-12 rounded-[14px] bg-sand px-3" type="number" aria-label="Duration" value={tour.durationDays} onChange={(e) => setTour({ ...tour, durationDays: Number(e.target.value) })} />
          <input className="h-12 rounded-[14px] bg-sand px-3" placeholder="Parks, comma separated" value={tour.parks.join(", ")} onChange={(e) => setTour({ ...tour, parks: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
          <input className="h-12 rounded-[14px] bg-sand px-3" type="number" aria-label="Price from" value={tour.priceFrom} onChange={(e) => setTour({ ...tour, priceFrom: Number(e.target.value) })} />
          <input className="h-12 rounded-[14px] bg-sand px-3" type="number" aria-label="Price to" value={tour.priceTo} onChange={(e) => setTour({ ...tour, priceTo: Number(e.target.value) })} />
        </div>
        <h2 className="font-display text-[20px]">Itinerary</h2>
        {tour.days.map((d, i) => (
          <div key={i} className="rounded-[14px] bg-card p-3 shadow-warm">
            <input className="h-10 w-full bg-transparent font-semibold outline-none" value={d.title} onChange={(e) => {
              const days = tour.days.slice();
              days[i] = { ...d, title: e.target.value };
              setTour({ ...tour, days });
            }} />
            <textarea className="mt-1 min-h-16 w-full bg-transparent text-[14px] outline-none" placeholder="Description" value={d.description} onChange={(e) => {
              const days = tour.days.slice();
              days[i] = { ...d, description: e.target.value };
              setTour({ ...tour, days });
            }} />
            <input className="mt-1 h-10 w-full bg-transparent text-[13px] outline-none" placeholder="Location, stay, meals" value={`${d.location}`} onChange={(e) => {
              const days = tour.days.slice();
              days[i] = { ...d, location: e.target.value };
              setTour({ ...tour, days });
            }} />
          </div>
        ))}
        <Button variant="tertiary" onClick={() => setTour({ ...tour, days: [...tour.days, blankDay(tour.days.length + 1)] })}>
          Add day
        </Button>
        <label className="block text-[13px]">
          Photo
          <input type="file" accept="image/*" className="mt-1 block" onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setTour({ ...tour, image: String(reader.result), images: [String(reader.result), ...tour.images] });
            reader.readAsDataURL(file);
          }} />
        </label>
        <TextArea label="Cancellation policy" value={tour.cancellation} onChange={(e) => setTour({ ...tour, cancellation: e.target.value })} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="tertiary" onClick={() => setPreview(true)}>Preview</Button>
        <Button variant="secondary" onClick={() => save("draft")}>Save draft</Button>
        <Button onClick={() => save("review")}>Submit for review</Button>
        <Button onClick={() => save("published")}>Publish</Button>
      </div>
      <Dialog open={discard} title="Discard unsaved changes?" body="Your edits stay only if you save a draft." confirm="Discard" danger onClose={() => setDiscard(false)} onConfirm={() => navigate({ to: "/operator/listings" })} />
    </div>
  );
}

export function OperatorReviews() {
  const app = useApp();
  const [reply, setReply] = useState<Record<string, string>>({});
  const [report, setReport] = useState("");
  const list = app.reviews.filter((r) => r.operatorId === app.user?.operatorId);
  return (
    <Guard>
      <Page tabs="operator">
        <div className="px-5 pt-safe">
          <h1 className="font-display text-[32px]">Reviews</h1>
          <div className="mt-4 space-y-3">
            {list.map((r) => (
              <article key={r.id} className="rounded-[16px] bg-card p-4 shadow-warm">
                <p className="font-semibold">{r.author} · {r.rating.toFixed(1)}</p>
                <p className="font-display text-[18px]">{r.title}</p>
                <p className="text-[14px] leading-6">{r.body}</p>
                {r.pending && <p className="mt-1 text-[12px] text-warning">Pending moderation</p>}
                {r.reply && <p className="mt-2 text-[13px] text-muted-foreground">Your reply: {r.reply}</p>}
                <textarea className="mt-2 min-h-16 w-full rounded-[12px] bg-sand px-3 py-2 text-[14px]" placeholder="Write a reply" value={reply[r.id] || ""} onChange={(e) => setReply({ ...reply, [r.id]: e.target.value })} />
                <Button className="mt-2" onClick={() => app.replyToReview(r.id, reply[r.id] || "")}>
                  Reply
                </Button>
              </article>
            ))}
          </div>
          <h2 className="mt-6 font-display text-[20px]">Report a review</h2>
          <textarea className="mt-2 min-h-20 w-full rounded-[14px] bg-sand px-3 py-2" value={report} onChange={(e) => setReport(e.target.value)} />
          <Button variant="tertiary" className="mt-2" onClick={() => { app.addTicket("Review report", report); setReport(""); }}>
            Report
          </Button>
        </div>
      </Page>
    </Guard>
  );
}

export function OperatorAccount() {
  const app = useApp();
  const navigate = useNavigate();
  const op = app.operators.find((o) => o.id === app.user?.operatorId);
  const [name, setName] = useState(op?.name || "");
  const [bio, setBio] = useState(op?.bio || "");
  return (
    <Guard>
      <Page tabs="operator">
        <div className="px-5 pt-safe">
          <h1 className="font-display text-[32px]">Account</h1>
          <input className="mt-4 h-12 w-full rounded-[14px] bg-sand px-3" value={name} onChange={(e) => setName(e.target.value)} aria-label="Business name" />
          <textarea className="mt-2 min-h-24 w-full rounded-[14px] bg-sand px-3 py-2" value={bio} onChange={(e) => setBio(e.target.value)} />
          <Button className="mt-2" onClick={() => op && app.updateOperator(op.id, { name, bio })}>
            Save business profile
          </Button>
          <button className="mt-6 block w-full py-3 text-left font-semibold" onClick={() => navigate({ to: "/operator/plans" })}>
            Subscription and billing
          </button>
          <div className="rounded-[16px] bg-sand p-4 text-[14px]">
            <p className="font-semibold">Team</p>
            <p className="text-muted-foreground">Invite a colleague from your verified email domain. Seats are included on Professional and Premium.</p>
          </div>
          <Button variant="text" className="mt-4" onClick={() => { app.setMode("traveler"); navigate({ to: "/explore" }); }}>
            Switch to traveler view
          </Button>
        </div>
      </Page>
    </Guard>
  );
}

export function PlansScreen() {
  const app = useApp();
  const [interval, setInterval] = useState<"month" | "year">("year");
  const [pay, setPay] = useState<null | (typeof plans)[number]>(null);
  const [card, setCard] = useState("4242424242424242");
  const [cancel, setCancel] = useState(false);
  const sub = app.subscription?.userId === app.user?.id ? app.subscription : null;
  return (
    <div className="px-5 pt-safe pb-28">
      <h1 className="font-display text-[32px]">Plans</h1>
      <div className="mt-3">
        <Segmented
          value={interval}
          onChange={(v) => setInterval(v as "month" | "year")}
          options={[
            { id: "month", label: "Monthly" },
            { id: "year", label: "Annual · save" },
          ]}
        />
      </div>
      <div className="mt-4 space-y-3">
        {plans.map((p) => (
          <article key={p.id} className="rounded-[20px] bg-card p-4 shadow-warm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[22px]">{p.name}</h2>
              {sub?.planId === p.id && sub.status === "active" && <span className="rounded-full bg-gold px-2 py-1 text-[11px] font-semibold text-[#2B1416]">Current</span>}
            </div>
            <p className="mt-1 text-[14px] text-muted-foreground">{p.blurb}</p>
            <p className="mt-2 font-display text-[28px]">${interval === "year" ? p.yearly : p.monthly}<span className="text-[14px] text-muted-foreground">/{interval === "year" ? "year" : "mo"}</span></p>
            <ul className="mt-2 space-y-1 text-[13px]">
              {p.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <Button className="mt-3" full onClick={() => setPay(p)}>
              {sub?.planId === p.id ? "Update payment" : "Choose plan"}
            </Button>
          </article>
        ))}
      </div>
      <h2 className="mt-6 font-display text-[20px]">Invoices</h2>
      <ul>
        {app.invoices.filter((i) => i.userId === app.user?.id).map((i) => (
          <li key={i.id} className="flex justify-between py-2 text-[14px]">
            <span>{i.date} · {i.label}</span>
            <span>{i.amount}</span>
          </li>
        ))}
      </ul>
      {sub?.status === "active" && (
        <Button variant="text" onClick={() => setCancel(true)}>
          Cancel subscription
        </Button>
      )}
      {pay && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2B1416]/40">
          <form
            className="w-full max-w-[430px] rounded-t-[28px] bg-card p-5"
            onSubmit={(e) => {
              e.preventDefault();
              app.setSubscription(pay.id, interval, card.slice(-4));
              setPay(null);
            }}
          >
            <h2 className="font-display text-[22px]">Payment method</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">Demo checkout. Connect Stripe before charging a real card. Only the last four digits are stored.</p>
            <input className="mt-3 h-12 w-full rounded-[14px] bg-sand px-3" value={card} onChange={(e) => setCard(e.target.value)} aria-label="Card number" />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input className="h-12 rounded-[14px] bg-sand px-3" placeholder="MM/YY" aria-label="Expiry" />
              <input className="h-12 rounded-[14px] bg-sand px-3" placeholder="CVC" aria-label="CVC" />
            </div>
            <Button full className="mt-4" type="submit">
              Confirm {pay.name}
            </Button>
            <Button variant="text" full type="button" onClick={() => setPay(null)}>
              Close
            </Button>
          </form>
        </div>
      )}
      <Dialog open={cancel} danger title="Cancel subscription?" body="You keep the plan until the renewal date, then listings above the free limit pause." confirm="Cancel plan" onClose={() => setCancel(false)} onConfirm={() => { app.cancelSubscription(); setCancel(false); }} />
      <OperatorTabs />
    </div>
  );
}

export function OperatorOnboarding() {
  const app = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Tanzania");
  const [city, setCity] = useState("");
  const [year, setYear] = useState("2018");
  const [license, setLicense] = useState("");
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const [types, setTypes] = useState<string[]>(["Safari"]);
  const [done, setDone] = useState(false);
  if (!app.user) {
    return (
      <div className="px-5 pt-safe">
        <p>Create an account as a tour operator first.</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/signup" })}>Create account</Button>
      </div>
    );
  }
  if (done) {
    return (
      <div className="px-5 pt-safe">
        <h1 className="mt-10 font-display text-[32px]">Under review</h1>
        <p className="mt-2 text-[15px] leading-6 text-muted-foreground">We usually verify within 3 to 5 days. You can draft listings while you wait. They stay unpublished until approval.</p>
        <Button className="mt-6" onClick={() => navigate({ to: "/operator" })}>Go to dashboard</Button>
      </div>
    );
  }
  return (
    <div className="px-5 pt-safe pb-10">
      <h1 className="font-display text-[32px]">Operator profile</h1>
      <p className="mt-1 text-[14px] text-muted-foreground">Tell us about the business travelers will trust.</p>
      <div className="mt-4 space-y-3">
        <input className="h-12 w-full rounded-[14px] bg-sand px-3" placeholder="Business name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="h-12 w-full rounded-[14px] bg-sand px-3" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
        <input className="h-12 w-full rounded-[14px] bg-sand px-3" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <input className="h-12 w-full rounded-[14px] bg-sand px-3" placeholder="Year established" value={year} onChange={(e) => setYear(e.target.value)} />
        <input className="h-12 w-full rounded-[14px] bg-sand px-3" placeholder="Licence or registration number" value={license} onChange={(e) => setLicense(e.target.value)} />
        <label className="block text-[13px]">
          Upload licence
          <input type="file" className="mt-1 block" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
          {fileName && <span className="text-success">{fileName} attached</span>}
        </label>
        <textarea className="min-h-24 w-full rounded-[14px] bg-sand px-3 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {["Safari", "Gorilla Trekking", "Honeymoon", "Family", "Luxury"].map((t) => (
            <button key={t} type="button" onClick={() => setTypes(types.includes(t) ? types.filter((x) => x !== t) : [...types, t])} className={`rounded-full px-3 py-2 text-[12px] ${types.includes(t) ? "bg-primary text-primary-foreground" : "bg-sand"}`}>
              {t}
            </button>
          ))}
        </div>
        <Button
          full
          disabled={!name || !license}
          onClick={() => {
            const id = uid("op");
            app.registerOperator({
              id,
              name,
              location: `${city}, ${country}`,
              country,
              established: Number(year) || 2020,
              rating: 0,
              reviewCount: 0,
              verified: false,
              featured: false,
              eco: false,
              topRated: false,
              initials: name.slice(0, 2).toUpperCase(),
              cover: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?auto=format&fit=crop&w=1400&q=80",
              bio: description,
              story: description,
              team: "Add your guides after verification.",
              sustainability: "",
              languages: ["English"],
              responseTime: "Within 24 hours",
              tripsHosted: 0,
              credentials: [{ name: "Licence submitted", detail: `${license}${fileName ? ` · ${fileName}` : ""}` }],
              tourTypes: types,
              reviewStatus: "pending",
              ownerId: app.user?.id,
            });
            setDone(true);
          }}
        >
          Submit for verification
        </Button>
      </div>
    </div>
  );
}
