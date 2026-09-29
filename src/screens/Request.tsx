import { BackButton, Button, Chip, Field, Photo, Segmented, Stepper, Tag, TextArea, Verified, useGoBack } from "@/components/chrome";
import { CATEGORIES, haptic, money } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { StayLevel } from "@/lib/types";
import { useNavigate } from "@tanstack/react-router";
import { CalendarRange, Check, ChevronLeft, Clock, MapPin, MessageSquare, Users } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as Slider from "@radix-ui/react-slider";

export function RequestScreen({ tourId, destinationId, operatorId }: { tourId?: string; destinationId?: string; operatorId?: string }) {
  const app = useApp();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const tour = app.tours.find((t) => t.id === tourId);
  const destPreset = destinationId || tour?.destinationIds[0] || "";
  const [more, setMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [dests, setDests] = useState<string[]>(destPreset ? [destPreset] : []);
  const [flexible, setFlexible] = useState(true);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [length, setLength] = useState(tour?.durationDays || 7);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [ages, setAges] = useState("");
  const [travelerType, setTravelerType] = useState("Couple");
  const [stay, setStay] = useState<StayLevel>(tour?.accommodation || "Mid-range");
  const [budget, setBudget] = useState<[number, number]>([tour?.priceFrom || 2000, tour?.priceTo || 5000]);
  const [interests, setInterests] = useState<string[]>(tour?.categories.slice(0, 2) || []);
  const [occasion, setOccasion] = useState("");
  const [needs, setNeeds] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState(app.user?.phone || "");
  const [contact, setContact] = useState("In-app message");
  const [ops, setOps] = useState<string[]>(operatorId ? [operatorId] : tour ? [tour.operatorId] : []);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [inquiryId, setInquiryId] = useState("");
  const restored = useRef(false);

  useEffect(() => {
    if (!app.hydrated || restored.current) return;
    restored.current = true;
    const draft = app.quoteDraft;
    if (!draft || draft.tourId !== tourId || (draft.destinationId || "") !== (destinationId || "") || (draft.operatorId || "") !== (operatorId || "")) return;
    setDests(draft.dests);
    setFlexible(draft.flexible);
    setStart(draft.start);
    setEnd(draft.end);
    setLength(draft.length);
    setAdults(draft.adults);
    setChildren(draft.children);
    setAges(draft.ages);
    setTravelerType(draft.travelerType);
    setStay(draft.stay);
    setBudget(draft.budget);
    setInterests(draft.interests);
    setOccasion(draft.occasion);
    setNeeds(draft.needs);
    setMessage(draft.message);
    setPhone(draft.phone);
    setContact(draft.contact);
    setOps(draft.ops);
    setConsent(draft.consent);
    if (draft.occasion || draft.needs || draft.message) setMore(true);
  }, [app.hydrated, app.quoteDraft, tourId, destinationId, operatorId]);

  const persistDraft = () => {
    app.saveQuoteDraft({
      tourId,
      destinationId,
      operatorId,
      dests,
      flexible,
      start,
      end,
      length,
      adults,
      children,
      ages,
      travelerType,
      stay,
      budget,
      interests,
      occasion,
      needs,
      message,
      phone,
      contact,
      ops,
      consent,
    });
  };

  const operator = app.operators.find((o) => o.id === (tour?.operatorId || operatorId));
  const chosenDests = dests.map((id) => app.destinations.find((d) => d.id === id)).filter(Boolean);
  const heroImage = tour?.image || chosenDests[0]?.image || operator?.cover || "";
  const chosenOps = ops.map((id) => app.operators.find((o) => o.id === id)).filter(Boolean);

  const toggle = (list: string[], id: string, set: (v: string[]) => void, max?: number) => {
    if (list.includes(id)) set(list.filter((x) => x !== id));
    else if (!max || list.length < max) set([...list, id]);
  };

  const send = () => {
    if (sending) return;
    if (!app.online) return setError("You are offline. Reconnect to send this quote request.");
    if (dests.length === 0) return setError("Choose at least one destination.");
    if (ops.length === 0 || !consent) return setError("Choose an operator and confirm you agree to be contacted.");
    setError("");
    setSending(true);
    const id = app.sendInquiry({
      tourId: tour?.id,
      destinationIds: dests,
      operatorIds: ops,
      flexible,
      startDate: start,
      endDate: end,
      lengthDays: length,
      adults,
      children,
      childAges: ages,
      travelerType,
      accommodation: stay,
      budgetMin: budget[0],
      budgetMax: budget[1],
      interests,
      occasion,
      needs,
      message,
      phone,
      contactMethod: contact,
    });
    setSending(false);
    if (id) {
      haptic(20);
      setInquiryId(id);
      setSent(true);
    }
  };

  if (!app.user) {
    return (
      <div className="min-h-dvh px-5 pt-safe">
        <BackButton />
        <div className="mt-8 overflow-hidden rounded-[24px] bg-card shadow-warm">
          {heroImage && <Photo src={heroImage} alt="" eager className="h-44" />}
          <div className="p-5">
            <p className="eyebrow">Request a quote</p>
            <h1 className="mt-2 font-display text-[32px] leading-10">{tour?.title || "Plan this trip with a verified operator"}</h1>
            <p className="mt-2 text-[15px] leading-6 text-muted-foreground">Log in so the operator can reply with a private itinerary and a clear price range.</p>
            <Button
              full
              className="mt-5"
              onClick={() => {
                app.setAuthReturn(window.location.pathname + window.location.search);
                navigate({ to: "/login" });
              }}
            >
              Log in to continue
            </Button>
            <Button variant="tertiary" full className="mt-2" onClick={() => navigate({ to: "/signup" })}>
              Create an account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-dvh bg-background pb-36">
        <div className="relative h-[280px]">
          {heroImage && <Photo src={heroImage} alt="" eager className="absolute inset-0 h-full w-full" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A0C0E] via-[#2B1416]/55 to-[#2B1416]/25" />
          <div className="absolute right-5 bottom-16 left-5 text-white">
            <Tag>Quote requested</Tag>
            <h1 className="mt-3 font-display text-[34px] leading-[40px] text-white" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.45)" }}>
              Inquiry sent
            </h1>
            <p className="mt-1 text-[15px] text-[#F7EEE3]">Operators typically reply within 24 to 48 hours.</p>
          </div>
        </div>

        <div className="relative z-10 -mt-10 space-y-3 px-5">
          <div className="flex items-center gap-3 rounded-[20px] bg-card p-4 shadow-warm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-[#2B1416] animate-pop">
              <Check size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-display text-[18px]">On its way</p>
              <p className="text-[13px] text-muted-foreground">Reference {inquiryId.replace("inq-", "").slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <article className="overflow-hidden rounded-[20px] bg-card shadow-warm">
            <div className="border-b border-border px-4 py-4">
              <p className="eyebrow">Your request</p>
              <h2 className="mt-1 font-display text-[22px] leading-7">{tour?.title || "Custom safari"}</h2>
              {operator && <p className="mt-1 text-[13px] text-muted-foreground">{operator.name}</p>}
            </div>
            <dl className="grid gap-3 px-4 py-4 text-[14px]">
              <Row icon={<MapPin size={16} />} label="Destinations" value={chosenDests.map((d) => d!.name).join(", ") || "Africa"} />
              <Row
                icon={<CalendarRange size={16} />}
                label="When"
                value={flexible ? `Flexible · ${length} days` : `${start || "Start"} to ${end || "end"} · ${length} days`}
              />
              <Row
                icon={<Users size={16} />}
                label="Travelers"
                value={`${adults} adult${adults === 1 ? "" : "s"}${children ? `, ${children} children` : ""} · ${travelerType}`}
              />
              <Row icon={<MessageSquare size={16} />} label="Style" value={`${stay} · ${money(budget[0], app.currency)} – ${money(budget[1], app.currency)}`} />
            </dl>
          </article>

          <section className="rounded-[20px] bg-card p-4 shadow-warm">
            <p className="eyebrow">What happens next</p>
            <ol className="mt-3 space-y-3">
              {[
                ["Delivered", "Your inquiry is with the operators you selected."],
                ["A tailored quote", "They reply in the app with an itinerary and a price range."],
                ["You decide", "Compare, ask questions, and keep exploring until it feels right."],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand font-display text-[14px] text-primary">{i + 1}</span>
                  <span>
                    <span className="block text-[15px] font-semibold">{title}</span>
                    <span className="block text-[13px] leading-5 text-muted-foreground">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {chosenOps.length > 0 && (
            <section className="rounded-[20px] bg-card p-4 shadow-warm">
              <p className="eyebrow">Hearing from</p>
              <ul className="mt-3 space-y-3">
                {chosenOps.map((o) => (
                  <li key={o!.id} className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-display text-[14px] text-primary-foreground">{o!.initials}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{o!.name}</span>
                      <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                        <Clock size={12} /> Replies in {o!.responseTime}
                      </span>
                    </span>
                    {o!.verified && <Verified compact />}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 space-y-1 border-t border-border bg-card px-5 py-3 pb-safe">
          <Button full onClick={() => navigate({ to: "/inquiries" })}>
            View my quotes
          </Button>
          <Button variant="text" full onClick={() => navigate({ to: "/explore" })}>
            Keep exploring
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="px-5 pt-safe">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Go back"
            onClick={goBack}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="min-w-0 flex-1 font-display text-[28px] leading-8">Request a quote</h1>
        </div>

        {tour && (
          <div className="mt-4 flex gap-3 overflow-hidden rounded-[20px] bg-card shadow-warm">
            <Photo src={tour.image} alt="" eager className="h-24 w-24 shrink-0" />
            <div className="min-w-0 flex-1 py-3 pr-3">
              <p className="font-display text-[17px] leading-5">{tour.title}</p>
              <p className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground">
                <MapPin size={12} /> {tour.parks.join(" · ")}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {tour.durationDays} days · {money(tour.priceFrom, app.currency)} – {money(tour.priceTo, app.currency)}
              </p>
            </div>
          </div>
        )}

        <p className="mt-4 text-[15px] leading-6 text-muted-foreground">Tell us where, when, and who is traveling. Style and notes are optional.</p>
        {error && <p className="mt-3 rounded-[14px] bg-destructive/10 px-3 py-2 text-[13px] text-destructive">{error}</p>}
      </div>

      <div className="mt-4 px-5">
        <div className="space-y-4">
            <section className="rounded-[20px] bg-card p-4 shadow-warm">
              <p className="eyebrow">Destinations</p>
              <div className="mt-3 flex gap-3 overflow-x-auto py-1 no-scrollbar">
                {app.destinations.map((d) => {
                  const on = dests.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggle(dests, d.id, setDests)}
                      className={`h-[124px] w-[124px] shrink-0 rounded-[18px] p-[3px] ${on ? "bg-primary" : ""}`}
                    >
                      <span className="relative block h-full w-full overflow-hidden rounded-[15px]">
                        <Photo src={d.image} alt="" className="absolute inset-0 h-full w-full" />
                        <span className="absolute inset-0 bg-gradient-to-t from-[#1A0C0E]/80 to-transparent" />
                        {on && (
                          <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[#2B1416]">
                            <Check size={14} />
                          </span>
                        )}
                        <span className="absolute right-2 bottom-2 left-2 text-left text-[12px] font-semibold text-white">{d.name}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
            <section className="rounded-[20px] bg-card p-4 shadow-warm">
              <p className="eyebrow">Dates</p>
              <div className="mt-3">
                <Segmented
                  value={flexible ? "flex" : "fixed"}
                  onChange={(v) => setFlexible(v === "flex")}
                  options={[
                    { id: "flex", label: "Flexible dates" },
                    { id: "fixed", label: "Fixed dates" },
                  ]}
                />
              </div>
              {!flexible && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Field label="Start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                  <Field label="End" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
                </div>
              )}
              <div className="mt-4">
                <Stepper label="Trip length (days)" value={length} min={2} max={21} onChange={setLength} />
              </div>
            </section>
          <section className="space-y-4 rounded-[20px] bg-card p-4 shadow-warm">
            <Stepper label="Adults" value={adults} min={1} onChange={setAdults} />
            <Stepper label="Children" value={children} onChange={setChildren} />
            {children > 0 && <Field label="Ages of children" value={ages} onChange={(e) => setAges(e.target.value)} placeholder="8 and 11" />}
            <div>
              <p className="eyebrow mb-2">Traveling as</p>
              <div className="flex flex-wrap gap-2">
                {["Solo", "Couple", "Family", "Group"].map((t) => (
                  <Chip key={t} selected={travelerType === t} onClick={() => setTravelerType(t)}>
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
          </section>
          <section className="rounded-[20px] bg-card p-4 shadow-warm">
            <p className="font-display text-[22px]">
              {money(budget[0], app.currency)} – {money(budget[1], app.currency)}
            </p>
            <p className="text-[12px] text-muted-foreground">Budget per person, before flights</p>
            <Slider.Root className="relative mt-3 flex h-11 items-center" min={800} max={12000} step={100} value={budget} onValueChange={(v) => setBudget([v[0], v[1]])}>
              <Slider.Track className="relative h-1.5 grow rounded-full bg-sand">
                <Slider.Range className="absolute h-full bg-primary" />
              </Slider.Track>
              <Slider.Thumb aria-label="Budget minimum" className="h-7 w-7 rounded-full border-2 border-primary bg-card" />
              <Slider.Thumb aria-label="Budget maximum" className="h-7 w-7 rounded-full border-2 border-primary bg-card" />
            </Slider.Root>
          </section>
          <button type="button" className="text-[14px] font-semibold text-primary" onClick={() => setMore(!more)}>
            {more ? "Hide style and note" : "Add style and a note"}
          </button>
          {more && (
          <div className="space-y-4">
            <section className="rounded-[20px] bg-card p-4 shadow-warm">
              <p className="eyebrow">Stay</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["Budget", "Mid-range", "Luxury"] as StayLevel[]).map((s) => (
                  <Chip key={s} selected={stay === s} onClick={() => setStay(s)}>
                    {s}
                  </Chip>
                ))}
              </div>
            </section>
            <section className="rounded-[20px] bg-card p-4 shadow-warm">
              <p className="eyebrow">Interests</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <Chip key={c} selected={interests.includes(c)} onClick={() => toggle(interests, c, setInterests)}>
                    {c}
                  </Chip>
                ))}
              </div>
              <div className="mt-4">
                <Field label="Special occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="Honeymoon, anniversary" />
              </div>
              <div className="mt-3">
                <TextArea label="Accessibility or dietary needs" value={needs} onChange={(e) => setNeeds(e.target.value)} />
              </div>
            </section>
          <section className="space-y-4 rounded-[20px] bg-card p-4 shadow-warm">
            <TextArea label="Notes for the operator" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="River crossings if the herds are there, a slower pace, a birthday dinner..." />
            <Field label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div>
              <p className="eyebrow mb-2">Preferred contact</p>
              <div className="flex flex-wrap gap-2">
                {["In-app message", "Email", "Phone"].map((c) => (
                  <Chip key={c} selected={contact === c} onClick={() => setContact(c)}>
                    {c}
                  </Chip>
                ))}
              </div>
            </div>
          </section>
          </div>
          )}
          <section className="rounded-[20px] bg-card p-4 shadow-warm">
              <p className="eyebrow">Send to up to 3 operators</p>
              <div className="mt-3 space-y-2">
                {app.operators
                  .filter((o) => o.verified && (dests.length === 0 || dests.some((d) => app.destinations.find((x) => x.id === d)?.country === o.country) || o.id === tour?.operatorId))
                  .slice(0, 8)
                  .map((o) => {
                    const on = ops.includes(o.id);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => toggle(ops, o.id, setOps, 3)}
                        className={`flex w-full items-center gap-3 rounded-[16px] px-3 py-3 text-left ${on ? "bg-primary text-primary-foreground" : "bg-sand"}`}
                      >
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-[13px] ${on ? "bg-white/15" : "bg-card"}`}>{o.initials}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-semibold">{o.name}</span>
                          <span className={`block text-[12px] ${on ? "text-white/75" : "text-muted-foreground"}`}>{o.location}</span>
                        </span>
                        <span className="text-[12px] font-semibold">{on ? "Selected" : "Add"}</span>
                      </button>
                    );
                  })}
              </div>
              <label className="mt-4 flex items-start gap-3 text-[14px] leading-5">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 accent-[#552026]" />
                Operators may contact me about this quote. I understand Explola does not take payment.
              </label>
            </section>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[430px] -translate-x-1/2 gap-2 border-t border-border bg-card px-5 py-3 pb-safe">
        <Button
          variant="tertiary"
          className="shrink-0 whitespace-nowrap px-4"
          onClick={() => {
            persistDraft();
            app.pushToast("Draft saved on this device");
          }}
        >
          Save draft
        </Button>
        <Button full disabled={sending || !app.online} loading={sending} onClick={send}>
          Send quote request
        </Button>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <span>
        <span className="block text-[12px] text-muted-foreground">{label}</span>
        <span className="block font-medium">{value}</span>
      </span>
    </div>
  );
}
