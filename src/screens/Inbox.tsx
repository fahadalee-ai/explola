import { OperatorCard, TourCard } from "@/components/cards";
import { BackButton, Button, Chip, Dialog, EmptyState, Field, Page, Segmented, Sheet, TextArea, UserPhoto } from "@/components/chrome";
import { MONTHS, money, relTime } from "@/lib/format";
import { useApp } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export function SavedScreen() {
  const { saved, user, tours, operators, collections, addCollection, setSavedCollection, setAuthReturn } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState("tours");
  const [collection, setCollection] = useState("All");
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const mine = saved.filter((s) => s.userId === user?.id);
  const toursSaved = mine.filter((s) => s.kind === "tour" && (collection === "All" || s.collection === collection));
  const opsSaved = mine.filter((s) => s.kind === "operator");
  return (
    <Page tabs="traveler">
      <div className="px-5 pt-safe">
        <h1 className="font-display text-[32px]">Saved</h1>
        <div className="mt-4">
          <Segmented value={tab} onChange={setTab} options={[{ id: "tours", label: "Tours" }, { id: "operators", label: "Operators" }]} />
        </div>
        {tab === "tours" && (
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
            {["All", ...collections].map((c) => (
              <Chip key={c} selected={collection === c} onClick={() => setCollection(c)}>
                {c}
              </Chip>
            ))}
            <Chip onClick={() => setCollectionOpen(true)}>+ Collection</Chip>
          </div>
        )}
        <div className="mt-4 space-y-4">
          {!user && (
            <EmptyState
              title="Log in to see saved safaris"
              body="Hearts you tap stay with your account on this device."
              action="Log in"
              onAction={() => {
                setAuthReturn(window.location.pathname + window.location.search);
                navigate({ to: "/login" });
              }}
            />
          )}
          {user && tab === "tours" && toursSaved.length === 0 && (
            <EmptyState title="Save trips you love" body="Tap the heart on a safari and it will wait for you here." action="Start exploring" onAction={() => navigate({ to: "/explore" })} />
          )}
          {tab === "tours" &&
            toursSaved.map((s) => {
              const tour = tours.find((t) => t.id === s.refId);
              if (!tour) return null;
              return (
                <div key={s.id}>
                  <TourCard tour={tour} />
                  <label className="mt-2 block text-[12px] text-muted-foreground">
                    Collection
                    <span className="relative mt-1 block">
                      <select
                        className="h-11 w-full appearance-none rounded-[12px] bg-sand pr-10 pl-3 text-[15px] text-foreground"
                        value={s.collection || ""}
                        onChange={(e) => setSavedCollection(s.id, e.target.value)}
                      >
                        <option value="">None</option>
                        {collections.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-foreground" aria-hidden />
                    </span>
                  </label>
                </div>
              );
            })}
          {user && tab === "operators" && opsSaved.length === 0 && <EmptyState title="No operators saved" body="Save an operator to compare them later." action="Browse operators" onAction={() => navigate({ to: "/search", search: { tab: "operators" } })} />}
          {tab === "operators" &&
            opsSaved.map((s) => {
              const op = operators.find((o) => o.id === s.refId);
              return op ? <OperatorCard key={s.id} operator={op} layout="list" /> : null;
            })}
        </div>
      </div>
      <Sheet open={collectionOpen} onClose={() => setCollectionOpen(false)} title="New collection">
        <div className="space-y-3 pb-6">
          <Field label="Name" value={collectionName} onChange={(e) => setCollectionName(e.target.value)} placeholder="Anniversary ideas" />
          <Button
            full
            disabled={!collectionName.trim()}
            onClick={() => {
              addCollection(collectionName.trim());
              setCollection(collectionName.trim());
              setCollectionName("");
              setCollectionOpen(false);
            }}
          >
            Save
          </Button>
        </div>
      </Sheet>
    </Page>
  );
}

const statusLabel: Record<string, string> = {
  sent: "Sent",
  viewed: "Viewed",
  quoted: "Quote received",
  closed: "Closed",
  draft: "Draft",
};

export function InquiriesScreen() {
  const { inquiries, user, tours, operators, quotes, setAuthReturn } = useApp();
  const navigate = useNavigate();
  const [pane, setPane] = useState("quotes");
  const [tab, setTab] = useState("active");
  const mine = inquiries.filter((i) => i.userId === user?.id);
  const filtered = mine.filter((i) => {
    if (tab === "active") return i.status === "sent" || i.status === "viewed";
    if (tab === "quoted") return i.status === "quoted";
    return i.status === "closed";
  });
  return (
    <Page tabs="traveler">
      <div className="px-5 pt-safe">
        <h1 className="font-display text-[32px]">Quotes</h1>
        <div className="mt-4">
          <Segmented
            value={pane}
            onChange={setPane}
            options={[
              { id: "quotes", label: "Quotes" },
              { id: "messages", label: "Messages" },
            ]}
          />
        </div>
        {pane === "messages" ? (
          <div className="mt-4">
            <MessagesScreen embedded />
          </div>
        ) : (
          <>
        <div className="mt-4">
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { id: "active", label: "Active" },
              { id: "quoted", label: "Quoted" },
              { id: "closed", label: "Closed" },
            ]}
          />
        </div>
        {!user && (
          <EmptyState
            title="Log in to see quotes"
            body="Quote requests live with your account."
            action="Log in"
            onAction={() => {
              setAuthReturn(window.location.pathname + window.location.search);
              navigate({ to: "/login" });
            }}
          />
        )}
        {user && filtered.length === 0 && <EmptyState title="No quotes yet" body="When you request a quote, the conversation starts here." action="Request a quote" onAction={() => navigate({ to: "/request" })} />}
        <div className="mt-4 space-y-3">
          {filtered.map((inq) => {
            const tour = tours.find((t) => t.id === inq.tourId);
            const op = operators.find((o) => o.id === inq.operatorIds[0]);
            const qcount = quotes.filter((q) => q.inquiryId === inq.id).length;
            return (
              <button key={inq.id} onClick={() => navigate({ to: "/inquiry/$id", params: { id: inq.id } })} className="flex w-full gap-3 rounded-[20px] bg-card p-3 text-left shadow-warm">
                <img src={tour?.image || op?.cover} alt="" className="h-20 w-20 rounded-[12px] object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold">{tour?.title || "Custom trip"}</span>
                    {inq.unread && <span className="h-2.5 w-2.5 rounded-full bg-gold" />}
                  </span>
                  <span className="block text-[13px] text-muted-foreground">{op?.name}</span>
                  <span className="mt-1 block text-[12px] text-muted-foreground">{inq.flexible ? "Flexible dates" : inq.startDate}</span>
                  <span className="mt-2 inline-flex rounded-full bg-sand px-2 py-1 text-[11px] font-semibold">
                    {statusLabel[inq.status]}
                    {qcount ? ` · ${qcount}` : ""}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
          </>
        )}
      </div>
    </Page>
  );
}

export function InquiryDetailScreen({ id }: { id: string }) {
  const app = useApp();
  const navigate = useNavigate();
  const inq = app.inquiries.find((i) => i.id === id);
  const [closeOpen, setCloseOpen] = useState(false);
  const [undoStatus, setUndoStatus] = useState<"sent" | "viewed" | "quoted" | "draft" | null>(null);
  useEffect(() => {
    if (inq?.unread) app.markInquiryRead(id);
  }, [id]);
  if (!inq) {
    return (
      <div className="min-h-dvh px-5 pt-safe">
        <BackButton fallback="/inquiries" className="mt-2" />
        <h1 className="mt-6 font-display text-[32px] leading-10">This quote is unavailable</h1>
        <p className="mt-2 text-[15px] leading-6 text-muted-foreground">It may have been removed from this device.</p>
      </div>
    );
  }
  const tour = app.tours.find((t) => t.id === inq.tourId);
  const quotes = app.quotes.filter((q) => q.inquiryId === inq.id);
  const conv = app.conversations.find((c) => c.inquiryId === inq.id && c.userId === inq.userId);
  return (
    <div className="px-5 pt-safe pb-10">
      <BackButton fallback="/inquiries" />
      <h1 className="mt-4 font-display text-[28px]">{tour?.title || "Your quote"}</h1>
      <p className="text-[13px] text-muted-foreground">{statusLabel[inq.status]} · {relTime(inq.createdAt)}</p>
      {inq.status === "closed" ? (
        <p className="mt-4 rounded-[14px] bg-sand px-3 py-3 text-[14px]">This quote is closed.</p>
      ) : (
        <ol className="mt-4 grid grid-cols-3 gap-2">
          {(["sent", "viewed", "quoted"] as const).map((s, i) => {
            const order = ["sent", "viewed", "quoted"];
            const reached = order.indexOf(inq.status) >= i;
            return (
              <li key={s} className={`rounded-[12px] px-2 py-2 text-center text-[12px] font-semibold ${reached ? "bg-primary text-primary-foreground" : "bg-sand text-muted-foreground"}`}>
                {i + 1}. {s === "quoted" ? "Quote" : statusLabel[s]}
              </li>
            );
          })}
        </ol>
      )}
      <div className="mt-4 rounded-[16px] bg-sand p-4 text-[14px] leading-6">
        <p>{inq.adults} adults · {inq.travelerType} · {inq.lengthDays} days</p>
        <p>{inq.accommodation}</p>
        <p>
          Budget {money(inq.budgetMin, app.currency)} – {money(inq.budgetMax, app.currency)}
        </p>
        {inq.message && <p className="mt-2">{inq.message}</p>}
      </div>
      <h2 className="mt-6 font-display text-[22px]">Quotes</h2>
      {quotes.length === 0 && <p className="mt-2 text-[14px] text-muted-foreground">No quote yet. Operators usually reply within 24 to 48 hours.</p>}
      <div className="mt-3 space-y-3">
        {quotes.map((q) => {
          const op = app.operators.find((o) => o.id === q.operatorId);
          return (
            <article key={q.id} className="rounded-[16px] bg-card p-4 shadow-warm">
              <p className="font-semibold">{op?.name}</p>
              <p className="font-display text-[28px]">{money(q.price, app.currency)}</p>
              <p className="text-[13px] text-muted-foreground">per person · valid until {q.validity}</p>
              <p className="mt-2 text-[14px] leading-6">{q.inclusions}</p>
              <p className="mt-2 text-[14px]">{q.note}</p>
            </article>
          );
        })}
      </div>
      {inq.accepted && (
        <section className="mt-6 rounded-[16px] bg-card p-4 shadow-warm">
          <p className="eyebrow">Next step</p>
          <h2 className="mt-1 font-display text-[22px]">Pay the operator directly</h2>
          <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
            Explola does not charge a booking fee. Agree the details in messages, then pay {app.operators.find((o) => o.id === inq.operatorIds[0])?.name || "the operator"} directly.
            They typically reply within {app.operators.find((o) => o.id === inq.operatorIds[0])?.responseTime || "a day or two"}.
          </p>
        </section>
      )}
      <div className="mt-6 space-y-2">
        <Button
          full
          onClick={() => {
            const c = conv?.id || app.ensureConversation(inq.operatorIds[0], inq.id);
            if (c) navigate({ to: "/chat/$id", params: { id: c } });
          }}
        >
          Ask a question
        </Button>
        {inq.status === "quoted" && !inq.accepted && (
          <Button
            variant="secondary"
            full
            onClick={() => {
              app.acceptInquiry(inq.id);
              app.pushToast("The operator can see you are ready to talk");
            }}
          >
            I'm ready to talk
          </Button>
        )}
        {undoStatus && (
          <Button
            variant="tertiary"
            full
            onClick={() => {
              app.setInquiryStatus(inq.id, undoStatus);
              setUndoStatus(null);
            }}
          >
            Undo close
          </Button>
        )}
        {inq.status !== "closed" && (
          <Button variant="tertiary" full onClick={() => setCloseOpen(true)}>
            Close quote
          </Button>
        )}
      </div>
      <Dialog
        open={closeOpen}
        danger
        title="Close this quote?"
        body="The operator will see it as closed. You can undo this from this screen."
        confirm="Close quote"
        onClose={() => setCloseOpen(false)}
        onConfirm={() => {
          if (inq.status !== "closed") setUndoStatus(inq.status === "draft" ? "draft" : inq.status);
          app.closeInquiry(inq.id);
          setCloseOpen(false);
        }}
      />
    </div>
  );
}

export function MessagesScreen({ embedded = false }: { embedded?: boolean }) {
  const { conversations, messages, operators, user, archiveConversation, unarchiveConversation } = useApp();
  const navigate = useNavigate();
  const [undoId, setUndoId] = useState<string | null>(null);
  const mine = conversations.filter((c) => c.userId === user?.id && !c.archived);
  return (
    <div className={embedded ? "" : "min-h-dvh px-5 pt-safe pb-10"}>
      {!embedded && <BackButton fallback="/inquiries" />}
      {!embedded && <h1 className="mt-4 font-display text-[32px]">Messages</h1>}
      {!user && <EmptyState title="Log in to see messages" body="Replies from operators stay with your account." action="Log in" onAction={() => navigate({ to: "/login" })} />}
      {user && mine.length === 0 && <EmptyState title="No messages" body="When you write to an operator, the thread appears here." />}
      {undoId && (
        <button
          type="button"
          className="mt-3 w-full rounded-[14px] bg-sand px-3 py-3 text-left text-[14px] font-semibold"
          onClick={() => {
            unarchiveConversation(undoId);
            setUndoId(null);
          }}
        >
          Message archived. Undo
        </button>
      )}
      <ul className="mt-4">
        {mine.map((c) => {
          const op = operators.find((o) => o.id === c.operatorId);
          const thread = messages.filter((m) => m.conversationId === c.id);
          const last = thread[thread.length - 1];
          const unread = thread.some((m) => m.from === "operator" && !m.read);
          return (
            <li key={c.id} className="flex items-center gap-3 border-b border-border py-3">
              <button className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => navigate({ to: "/chat/$id", params: { id: c.id } })}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">{op?.initials}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex justify-between">
                    <span className="font-semibold">{op?.name}</span>
                    <span className="text-[12px] text-muted-foreground">{last ? relTime(last.createdAt) : ""}</span>
                  </span>
                  <span className="block truncate text-[13px] text-muted-foreground">{last?.text || "Start the conversation"}</span>
                </span>
                {unread && <span className="h-2.5 w-2.5 rounded-full bg-gold" />}
              </button>
              <button
                aria-label="Archive"
                className="text-[12px] font-semibold text-muted-foreground"
                onClick={() => {
                  archiveConversation(c.id);
                  setUndoId(c.id);
                }}
              >
                Archive
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ChatScreen({ id }: { id: string }) {
  const app = useApp();
  const conv = app.conversations.find((c) => c.id === id);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    app.markThreadRead(id);
  }, [id]);
  if (!conv) {
    return (
      <div className="min-h-dvh px-5 pt-safe">
        <BackButton fallback="/inquiries" className="mt-2" />
        <h1 className="mt-6 font-display text-[32px] leading-10">This conversation is unavailable</h1>
        <p className="mt-2 text-[15px] leading-6 text-muted-foreground">It may have been archived or removed.</p>
      </div>
    );
  }
  const op = app.operators.find((o) => o.id === conv.operatorId);
  const thread = app.messages.filter((m) => m.conversationId === id);
  const fromTraveler = app.user?.operatorId !== conv.operatorId;
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 pt-safe pb-3">
        <BackButton fallback="/inquiries" />
        <div>
          <p className="font-semibold">{op?.name}</p>
          <p className="text-[12px] text-muted-foreground">{op?.responseTime}</p>
        </div>
      </header>
      <div className="flex-1 space-y-2 px-4 py-4">
        {thread.map((m) => {
          const mine = fromTraveler ? m.from === "traveler" : m.from === "operator";
          return (
            <div key={m.id} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-[18px] px-3 py-2 text-[14px] leading-6 ${mine ? "bg-primary text-primary-foreground" : "bg-sand"}`}>
                {m.image && <img src={m.image} alt="" className="mb-2 max-h-40 rounded-[12px]" />}
                {m.text}
                <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-muted-foreground"}`}>{m.read ? "Read" : relTime(m.createdAt)}</p>
              </div>
              {mine && fromTraveler && <UserPhoto src={app.user?.avatar} name={app.user?.firstName} className="h-8 w-8 shrink-0" />}
            </div>
          );
        })}
        {typing && <p className="text-[12px] text-muted-foreground">{op?.name} is typing…</p>}
      </div>
      <form
        className="flex items-end gap-2 border-t border-border px-4 py-3 pb-safe"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          app.sendMessage(id, text.trim());
          setText("");
          if (fromTraveler) {
            setTyping(true);
            setTimeout(() => setTyping(false), 1200);
          }
        }}
      >
        <label className="flex h-12 w-12 items-center justify-center rounded-full bg-sand text-[12px]">
          Img
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => app.sendMessage(id, "Photo", String(reader.result));
              reader.readAsDataURL(file);
            }}
          />
        </label>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message" className="h-12 flex-1 rounded-[14px] bg-sand px-3 outline-none" />
        <Button type="submit" className="min-h-12 px-4">
          Send
        </Button>
      </form>
    </div>
  );
}

export function ReviewScreen({ operatorId, tourId }: { operatorId: string; tourId?: string }) {
  const app = useApp();
  const navigate = useNavigate();
  const op = app.operators.find((o) => o.id === operatorId);
  const allowed = app.inquiries.some((i) => i.userId === app.user?.id && i.operatorIds.includes(operatorId) && (i.status === "quoted" || i.status === "closed"));
  const [rating, setRating] = useState(5);
  const [date, setDate] = useState("");
  const [tripType, setTripType] = useState("Couple");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [recommend, setRecommend] = useState(true);
  const [done, setDone] = useState(false);
  if (!allowed) {
    return (
      <div className="px-5 pt-safe">
        <BackButton fallback="/explore" />
        <h1 className="mt-4 font-display text-[28px]">Verified travelers only</h1>
        <p className="mt-2 text-[15px] leading-6 text-muted-foreground">You can review {op?.name || "this operator"} after an inquiry has received a quote or been closed.</p>
        <Button className="mt-6" onClick={() => navigate({ to: "/explore" })}>
          Back to exploring
        </Button>
      </div>
    );
  }
  if (done) {
    return (
      <div className="px-5 pt-safe">
        <BackButton fallback="/explore" />
        <div className="mt-16 flex h-16 w-16 items-center justify-center rounded-full bg-gold text-2xl animate-pop">✓</div>
        <h1 className="mt-4 font-display text-[32px]">Review submitted</h1>
        <p className="mt-2 text-muted-foreground">It is pending a short moderation check, then it will show as a verified traveler review.</p>
        <Button className="mt-6" onClick={() => navigate({ to: "/profile" })}>
          Done
        </Button>
      </div>
    );
  }
  return (
    <div className="px-5 pt-safe pb-10">
      <BackButton fallback="/explore" />
      <h1 className="mt-4 font-display text-[28px]">Review {op?.name}</h1>
      <div className="mt-4 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} aria-label={`${n} stars`} className={`text-3xl ${n <= rating ? "text-gold" : "text-sand"}`} onClick={() => setRating(n)}>
            ★
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        <label className="block text-[13px] font-medium">
          Trip date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 h-12 w-full rounded-[14px] bg-sand px-3" />
        </label>
        <div className="flex flex-wrap gap-2">
          {["Solo", "Couple", "Family", "Honeymoon", "Friends"].map((t) => (
            <Chip key={t} selected={tripType === t} onClick={() => setTripType(t)}>
              {t}
            </Chip>
          ))}
        </div>
        <TextArea label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextArea label="Your review" value={body} onChange={(e) => setBody(e.target.value)} />
        <label className="block text-[13px] font-medium">
          Photos (up to 6)
          <input
            type="file"
            accept="image/*"
            multiple
            className="mt-2 block text-[13px]"
            onChange={(e) => {
              const files = [...(e.target.files || [])].slice(0, 6 - photos.length);
              files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = () => setPhotos((p) => [...p, String(reader.result)].slice(0, 6));
                reader.readAsDataURL(file);
              });
            }}
          />
        </label>
        <label className="flex items-center gap-2 text-[14px]">
          <input type="checkbox" checked={recommend} onChange={(e) => setRecommend(e.target.checked)} /> I recommend this operator
        </label>
        <p className="text-[12px] leading-5 text-muted-foreground">Be specific and kind. Reviews are checked before they are published.</p>
        <Button
          full
          disabled={!title || body.length < 20}
          onClick={() => {
            const ok = app.addReview({
              tourId: tourId || app.tours.find((t) => t.operatorId === operatorId)?.id || "",
              operatorId,
              rating,
              title,
              body,
              date: date || new Date().toISOString().slice(0, 10),
              tripType,
              month: MONTHS[new Date().getMonth()] || "Jan",
              photos,
              recommend,
            });
            if (ok) setDone(true);
          }}
        >
          Submit review
        </Button>
      </div>
    </div>
  );
}

export function NotificationsScreen() {
  const { notifications, user, markAllRead, markRead, removeNotification } = useApp();
  const navigate = useNavigate();
  const mine = user ? notifications.filter((n) => n.userId === user.id) : [];
  const today = mine.filter((n) => Date.now() - new Date(n.createdAt).getTime() < 86400000);
  const earlier = mine.filter((n) => !today.includes(n));
  const group = (title: string, items: typeof mine) =>
    items.length > 0 && (
      <section className="mt-4">
        <p className="eyebrow">{title}</p>
        <ul>
          {items.map((n) => (
            <li key={n.id} className="flex items-start gap-2 border-b border-border py-3">
              <button
                className="flex-1 text-left"
                onClick={() => {
                  markRead(n.id);
                  if (!n.href) return;
                  const [, kind, id] = n.href.split("/");
                  if (kind === "inquiry" && id) navigate({ to: "/inquiry/$id", params: { id } });
                  else if (kind === "chat" && id) navigate({ to: "/chat/$id", params: { id } });
                  else if (kind === "tour" && id) navigate({ to: "/tour/$id", params: { id } });
                  else if (kind === "destination" && id) navigate({ to: "/destination/$id", params: { id } });
                  else if (kind === "operators" && id) navigate({ to: "/operators/$id", params: { id } });
                  else if (n.href === "/operator/inquiries") navigate({ to: "/operator/inquiries" });
                  else if (n.href === "/inquiries") navigate({ to: "/inquiries" });
                  else if (n.href === "/saved") navigate({ to: "/saved" });
                }}
              >
                <span className="flex items-center gap-2 font-semibold">
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-gold" />}
                  <span className="min-w-0 flex-1">{n.title}</span>
                  <span className="shrink-0 text-[12px] font-medium text-muted-foreground">{relTime(n.createdAt)}</span>
                </span>
                <span className="mt-1 block text-[13px] leading-5 text-muted-foreground">{n.body}</span>
              </button>
              <button aria-label="Delete notification" className="text-[12px] text-muted-foreground" onClick={() => removeNotification(n.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  return (
    <div className="min-h-dvh px-5 pt-safe pb-10">
      <div className="flex items-center gap-3">
        <BackButton fallback="/profile" />
        <h1 className="min-w-0 flex-1 font-display text-[28px] leading-8">Notifications</h1>
        <button className="shrink-0 text-[13px] font-semibold text-primary" onClick={markAllRead}>
          Mark all as read
        </button>
      </div>
      {!user && (
        <EmptyState
          title="Log in to see notifications"
          body="Quote updates and messages stay with your account."
          action="Log in"
          onAction={() => navigate({ to: "/login" })}
        />
      )}
      {user && mine.length === 0 && <EmptyState title="You are all caught up" body="Quotes, messages and trip updates will land here." />}
      {group("Today", today)}
      {group("Earlier", earlier)}
    </div>
  );
}
