import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { passwordStrong, todayISO, uid } from "./format";
import {
  demoAccounts,
  demoPrefs,
  destinations as seedDestinations,
  faqs,
  operators as seedOperators,
  plans,
  reviews as seedReviews,
  seedConversation,
  seedInquiries,
  seedMessages,
  seedNotifications,
  seedQuotes,
  tours as seedTours,
} from "./seed";
import { defaultProfilePhoto } from "./photos";
import { hasSeenOnboarding, markOnboardingSeen, readStorage, writeStorage } from "./storage";
import { supabaseEnabled, supabaseSignIn, supabaseSignOut, supabaseSignUp } from "./supabase";
import type {
  Account,
  AppNotification,
  ChatMessage,
  Conversation,
  Currency,
  Inquiry,
  Invoice,
  Operator,
  Quote,
  Review,
  QuoteDraft,
  SavedItem,
  Subscription,
  ThemeMode,
  Ticket,
  Tour,
  TripPrefs,
} from "./types";

type Toast = { id: number; title: string; body?: string };

type Persisted = {
  onboarded: boolean;
  theme: ThemeMode;
  currency: Currency;
  userId: string | null;
  mode: "traveler" | "operator";
  accounts: Account[];
  saved: SavedItem[];
  inquiries: Inquiry[];
  quotes: Quote[];
  conversations: Conversation[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  extraReviews: Review[];
  tours: Tour[];
  operators: Operator[];
  collections: string[];
  subscription: Subscription | null;
  invoices: Invoice[];
  biometricUserId: string | null;
  notifPrefs: Record<string, boolean>;
  prefsByUser: Record<string, TripPrefs>;
  recentSearches: string[];
  tickets: Ticket[];
  helpful: Record<string, boolean>;
  reviewReplies: Record<string, string>;
  compareIds: string[];
  quoteDraft: QuoteDraft | null;
};

const defaultPrefs: Record<string, boolean> = {
  push: true,
  email: true,
  quotes: true,
  messages: true,
  status: true,
  saved: false,
  reviews: true,
  promotions: false,
};

function fresh(): Persisted {
  return {
    onboarded: false,
    theme: "light",
    currency: "USD",
    userId: null,
    mode: "traveler",
    accounts: demoAccounts,
    saved: [
      { id: "sv1", userId: "user-amara", kind: "tour", refId: "t-migration", collection: "Anniversary ideas" },
      { id: "sv2", userId: "user-amara", kind: "tour", refId: "t-combo", collection: "Anniversary ideas" },
      { id: "sv3", userId: "user-amara", kind: "operator", refId: "op-serengeti" },
    ],
    inquiries: seedInquiries,
    quotes: seedQuotes,
    conversations: [seedConversation],
    messages: seedMessages,
    notifications: seedNotifications,
    extraReviews: [],
    tours: seedTours,
    operators: seedOperators,
    collections: ["Anniversary ideas", "Family 2027"],
    subscription: {
      userId: "user-jonas",
      planId: "professional",
      interval: "year",
      status: "active",
      renewsAt: "2027-01-15",
      last4: "4242",
    },
    invoices: [
      { id: "inv1", userId: "user-jonas", date: "2026-01-15", label: "Professional · annual", amount: "$1,240" },
    ],
    biometricUserId: null,
    notifPrefs: defaultPrefs,
    prefsByUser: { "user-amara": demoPrefs },
    recentSearches: ["Serengeti", "Gorilla trekking", "Zanzibar"],
    tickets: [],
    helpful: {},
    reviewReplies: {},
    compareIds: [],
    quoteDraft: null,
  };
}

type Store = Persisted & {
  hydrated: boolean;
  user: Account | null;
  destinations: typeof seedDestinations;
  reviews: Review[];
  faqs: typeof faqs;
  plans: typeof plans;
  online: boolean;
  toasts: Toast[];
  authPrompt: string | null;
  authReturn: string | null;
  unreadCount: number;
  setTheme: (t: ThemeMode) => void;
  setCurrency: (c: Currency) => void;
  markOnboarded: () => void;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; reason: string }>;
  register: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    country: string;
    marketing: boolean;
    role: "traveler" | "operator";
  }) => Promise<{ ok: true } | { ok: false; reason: string }>;
  verifyEmail: () => void;
  logout: () => void;
  updateUser: (patch: Partial<Account>) => void;
  changePassword: (current: string, next: string) => string | null;
  resetPassword: (email: string, next: string) => string | null;
  deleteAccount: () => void;
  setMode: (m: "traveler" | "operator") => void;
  enableBiometric: (on: boolean) => void;
  biometricLogin: () => boolean;
  setPrefs: (p: TripPrefs) => void;
  prefs: TripPrefs | null;
  toggleNotif: (key: string) => void;
  requireAuth: (reason?: string) => boolean;
  closeAuthPrompt: () => void;
  setAuthReturn: (path: string | null) => void;
  pushToast: (title: string, body?: string) => void;
  isSaved: (kind: "tour" | "operator", id: string) => boolean;
  toggleSaved: (kind: "tour" | "operator", id: string) => void;
  isCompared: (id: string) => boolean;
  toggleCompare: (id: string) => void;
  saveQuoteDraft: (draft: QuoteDraft) => void;
  clearQuoteDraft: () => void;
  setSavedCollection: (id: string, collection: string) => void;
  addCollection: (name: string) => void;
  sendInquiry: (draft: Omit<Inquiry, "id" | "userId" | "createdAt" | "status" | "unread">) => string | null;
  closeInquiry: (id: string) => void;
  setInquiryStatus: (id: string, status: Inquiry["status"]) => void;
  acceptInquiry: (id: string) => void;
  markInquiryRead: (id: string) => void;
  sendQuote: (q: Omit<Quote, "id" | "createdAt">) => void;
  ensureConversation: (operatorId: string, inquiryId?: string) => string | null;
  sendMessage: (conversationId: string, text: string, image?: string) => void;
  archiveConversation: (id: string) => void;
  unarchiveConversation: (id: string) => void;
  markThreadRead: (conversationId: string) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  removeNotification: (id: string) => void;
  addReview: (input: Omit<Review, "id" | "helpful" | "verified" | "pending" | "userId" | "author" | "country">) => boolean;
  replyToReview: (id: string, reply: string) => void;
  markHelpful: (id: string) => void;
  upsertTour: (tour: Tour) => string | null;
  removeTour: (id: string) => void;
  registerOperator: (op: Operator) => void;
  updateOperator: (id: string, patch: Partial<Operator>) => void;
  setSubscription: (planId: Subscription["planId"], interval: Subscription["interval"], last4: string) => void;
  cancelSubscription: () => void;
  addRecentSearch: (q: string) => void;
  removeRecentSearch: (q: string) => void;
  addTicket: (topic: string, message: string) => void;
  listingLimit: number;
};

function notificationsFor(list: AppNotification[], userId: string | null) {
  if (!userId) return [];
  return list.filter((item) => item.userId === userId);
}

const Ctx = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Persisted>(fresh);
  const [hydrated, setHydrated] = useState(false);
  const [online, setOnline] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [authPrompt, setAuthPrompt] = useState<string | null>(null);
  const [authReturn, setAuthReturnState] = useState<string | null>(null);

  useEffect(() => {
    const saved = readStorage<Persisted>();
    if (saved?.accounts?.length) {
      const seeded = fresh();
      setData({
        ...seeded,
        ...saved,
        accounts: saved.accounts.map((account) => {
          const demo = seeded.accounts.find((a) => a.id === account.id);
          return { ...account, avatar: account.avatar || demo?.avatar || defaultProfilePhoto };
        }),
        reviewReplies: saved.reviewReplies ?? {},
        helpful: saved.helpful ?? {},
        tours: (saved.tours?.length ? saved.tours : seedTours).map((tour) => {
          const seededTour = seedTours.find((item) => item.id === tour.id);
          return seededTour ? { ...tour, image: seededTour.image, images: seededTour.images } : tour;
        }),
        operators: saved.operators?.length ? saved.operators : seedOperators,
        notifications: [
          ...seedNotifications.filter((item) => !(saved.notifications ?? []).some((savedItem) => savedItem.id === item.id)),
          ...(saved.notifications ?? []),
        ],
        compareIds: saved.compareIds ?? [],
        quoteDraft: saved.quoteDraft ?? null,
        theme: "light",
        onboarded: Boolean(saved.onboarded) || hasSeenOnboarding(),
      });
    } else if (hasSeenOnboarding()) {
      setData((current) => ({ ...current, onboarded: true }));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(data);
  }, [data, hydrated]);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#FBF6EE");
  }, []);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const user = data.accounts.find((a) => a.id === data.userId) ?? null;

  const api = useMemo<Store>(() => {
    const patch = (fn: (d: Persisted) => Persisted) => setData((d) => fn(d));
    const pushToast = (title: string, body?: string) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t.slice(-2), { id, title, body }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
    };
    const notify = (userId: string, n: Omit<AppNotification, "id" | "userId" | "createdAt" | "read">) => {
      patch((d) => ({
        ...d,
        notifications: [
          { ...n, id: uid("nt"), userId, createdAt: todayISO(), read: false },
          ...d.notifications,
        ],
      }));
    };

    return {
      ...data,
      hydrated,
      user,
      destinations: seedDestinations,
      reviews: [...seedReviews, ...data.extraReviews].map((r) => ({
        ...r,
        reply: data.reviewReplies[r.id] ?? r.reply,
      })),
      faqs,
      plans,
      online,
      toasts,
      authPrompt,
      authReturn,
      unreadCount: notificationsFor(data.notifications, data.userId).filter((n) => !n.read).length,
      prefs: data.userId ? (data.prefsByUser[data.userId] ?? null) : null,
      listingLimit:
        data.subscription?.userId === data.userId && data.subscription.status === "active"
          ? (plans.find((p) => p.id === data.subscription?.planId)?.listings ?? 3)
          : 3,
      setTheme: (theme) => patch((d) => ({ ...d, theme })),
      setCurrency: (currency) => patch((d) => ({ ...d, currency })),
      markOnboarded: () => {
        markOnboardingSeen();
        patch((d) => ({ ...d, onboarded: true }));
      },
      login: async (email, password) => {
        const typed = email.trim();
        if (supabaseEnabled && typed && password) {
          await supabaseSignIn(typed, password);
        }
        let account = data.accounts.find((a) => a.email.toLowerCase() === typed.toLowerCase());
        if (!account) {
          account = {
            id: uid("user"),
            role: "traveler",
            firstName: typed.split("@")[0] || "Traveler",
            lastName: "",
            email: typed || "guest@explola.app",
            password,
            phone: "",
            country: "",
            bio: "",
            dob: "",
            nationality: "",
            avatar: defaultProfilePhoto,
            marketing: false,
            verifiedEmail: true,
          };
          patch((d) => ({
            ...d,
            accounts: [...d.accounts, account!],
            userId: account!.id,
            mode: "traveler",
            onboarded: true,
          }));
          markOnboardingSeen();
          return { ok: true };
        }
        patch((d) => ({
          ...d,
          userId: account.id,
          mode: account.role === "operator" ? "operator" : "traveler",
          onboarded: true,
        }));
        markOnboardingSeen();
        return { ok: true };
      },
      register: async (input) => {
        const email = input.email.trim();
        if (supabaseEnabled && email && input.password) {
          await supabaseSignUp(email, input.password, {
            first_name: input.firstName,
            last_name: input.lastName,
            role: input.role,
          });
        }
        const account: Account = {
          id: uid("user"),
          role: input.role,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email,
          password: input.password,
          phone: input.phone,
          country: input.country,
          bio: "",
          dob: "",
          nationality: "",
          avatar: defaultProfilePhoto,
          marketing: input.marketing,
          verifiedEmail: true,
          verificationStatus: input.role === "operator" ? "none" : "none",
        };
        markOnboardingSeen();
        patch((d) => ({ ...d, accounts: [...d.accounts, account], userId: account.id, mode: "traveler", onboarded: true }));
        return { ok: true };
      },
      verifyEmail: () => {
        if (!data.userId) return;
        patch((d) => ({
          ...d,
          accounts: d.accounts.map((a) => (a.id === d.userId ? { ...a, verifiedEmail: true } : a)),
        }));
      },
      logout: () => {
        if (supabaseEnabled) void supabaseSignOut();
        patch((d) => ({ ...d, userId: null, mode: "traveler" }));
      },
      updateUser: (p) =>
        patch((d) => ({
          ...d,
          accounts: d.accounts.map((a) => (a.id === d.userId ? { ...a, ...p } : a)),
        })),
      changePassword: (current, next) => {
        if (!user) return "Log in first.";
        if (user.password !== current) return "Current password is incorrect.";
        if (!passwordStrong(next)) return "New password does not meet the rules.";
        patch((d) => ({
          ...d,
          accounts: d.accounts.map((a) => (a.id === user.id ? { ...a, password: next } : a)),
        }));
        return null;
      },
      resetPassword: (email, next) => {
        if (!passwordStrong(next)) return "New password does not meet the rules.";
        let found = false;
        patch((d) => ({
          ...d,
          accounts: d.accounts.map((a) => {
            if (a.email.toLowerCase() !== email.trim().toLowerCase()) return a;
            found = true;
            return { ...a, password: next, verifiedEmail: true };
          }),
        }));
        return found ? null : "Account not found.";
      },
      deleteAccount: () => {
        if (!user) return;
        const id = user.id;
        patch((d) => ({
          ...d,
          accounts: d.accounts.filter((a) => a.id !== id),
          userId: null,
          mode: "traveler",
          saved: d.saved.filter((s) => s.userId !== id),
          inquiries: d.inquiries.filter((i) => i.userId !== id),
          quotes: d.quotes.filter((q) => d.inquiries.find((i) => i.id === q.inquiryId)?.userId !== id),
          conversations: d.conversations.filter((c) => c.userId !== id),
          messages: d.messages.filter((m) => d.conversations.find((c) => c.id === m.conversationId)?.userId !== id),
          notifications: d.notifications.filter((n) => n.userId !== id),
          prefsByUser: Object.fromEntries(Object.entries(d.prefsByUser).filter(([key]) => key !== id)),
          compareIds: [],
          quoteDraft: null,
          biometricUserId: d.biometricUserId === id ? null : d.biometricUserId,
        }));
      },
      setMode: (mode) => patch((d) => ({ ...d, mode })),
      enableBiometric: (on) => patch((d) => ({ ...d, biometricUserId: on ? d.userId : null })),
      biometricLogin: () => {
        if (!data.biometricUserId) return false;
        const account = data.accounts.find((a) => a.id === data.biometricUserId);
        if (!account) return false;
        patch((d) => ({ ...d, userId: account.id, mode: account.role === "operator" ? d.mode : "traveler" }));
        return true;
      },
      setPrefs: (p) => {
        if (!data.userId) return;
        patch((d) => ({ ...d, prefsByUser: { ...d.prefsByUser, [d.userId as string]: p } }));
      },
      toggleNotif: (key) => patch((d) => ({ ...d, notifPrefs: { ...d.notifPrefs, [key]: !d.notifPrefs[key] } })),
      requireAuth: (reason = "Log in to continue") => {
        if (data.userId) return true;
        if (typeof window !== "undefined") setAuthReturnState(window.location.pathname + window.location.search);
        setAuthPrompt(reason);
        return false;
      },
      closeAuthPrompt: () => setAuthPrompt(null),
      setAuthReturn: (path) => setAuthReturnState(path),
      pushToast,
      isSaved: (kind, id) => data.saved.some((s) => s.userId === data.userId && s.kind === kind && s.refId === id),
      toggleSaved: (kind, refId) => {
        if (!online) {
          pushToast("You are offline", "Reconnect to save or remove a trip.");
          return;
        }
        if (!data.userId) {
          if (typeof window !== "undefined") setAuthReturnState(window.location.pathname + window.location.search);
          setAuthPrompt("Log in to save trips and operators");
          return;
        }
        const exists = data.saved.find((s) => s.userId === data.userId && s.kind === kind && s.refId === refId);
        patch((d) => ({
          ...d,
          saved: exists
            ? d.saved.filter((s) => s.id !== exists.id)
            : [...d.saved, { id: uid("sv"), userId: d.userId as string, kind, refId }],
        }));
        pushToast(exists ? "Removed from saved" : "Saved");
      },
      setSavedCollection: (id, collection) =>
        patch((d) => ({ ...d, saved: d.saved.map((s) => (s.id === id ? { ...s, collection } : s)) })),
      addCollection: (name) =>
        patch((d) => ({ ...d, collections: d.collections.includes(name) ? d.collections : [...d.collections, name] })),
      isCompared: (id) => data.compareIds.includes(id),
      toggleCompare: (id) => {
        if (!online) {
          pushToast("You are offline", "Reconnect to update your comparison.");
          return;
        }
        if (!data.userId) {
          if (typeof window !== "undefined") setAuthReturnState(window.location.pathname + window.location.search);
          setAuthPrompt("Log in to compare safaris");
          return;
        }
        const has = data.compareIds.includes(id);
        if (!has && data.compareIds.length >= 3) {
          pushToast("You can compare up to 3 safaris", "Remove one to add another.");
          return;
        }
        patch((d) => ({ ...d, compareIds: has ? d.compareIds.filter((x) => x !== id) : [...d.compareIds, id] }));
        pushToast(has ? "Removed from compare" : "Added to compare");
      },
      saveQuoteDraft: (draft) => patch((d) => ({ ...d, quoteDraft: draft })),
      clearQuoteDraft: () => patch((d) => ({ ...d, quoteDraft: null })),
      sendInquiry: (draft) => {
        if (!online) {
          pushToast("You are offline", "Reconnect to send this quote request.");
          return null;
        }
        if (!data.userId) {
          if (typeof window !== "undefined") setAuthReturnState(window.location.pathname + window.location.search);
          setAuthPrompt("Log in to request a quote");
          return null;
        }
        const id = uid("inq");
        const inquiry: Inquiry = {
          ...draft,
          id,
          userId: data.userId,
          status: "sent",
          unread: false,
          createdAt: todayISO(),
        };
        patch((d) => ({ ...d, inquiries: [inquiry, ...d.inquiries], quoteDraft: null }));
        draft.operatorIds.forEach((opId) => {
          const owner = data.operators.find((o) => o.id === opId)?.ownerId;
          if (owner) {
            notify(owner, {
              type: "inquiry",
              title: "New inquiry",
              body: `${user?.firstName ?? "A traveler"} requested a quote.`,
              href: `/operator/inquiry/${id}`,
            });
          }
        });
        return id;
      },
      closeInquiry: (id) =>
        patch((d) => ({
          ...d,
          inquiries: d.inquiries.map((i) => (i.id === id ? { ...i, status: "closed" } : i)),
        })),
      setInquiryStatus: (id, status) =>
        patch((d) => ({
          ...d,
          inquiries: d.inquiries.map((i) => (i.id === id ? { ...i, status } : i)),
        })),
      acceptInquiry: (id) => {
        const inquiry = data.inquiries.find((i) => i.id === id);
        if (!inquiry) return;
        patch((d) => ({
          ...d,
          inquiries: d.inquiries.map((i) => (i.id === id ? { ...i, accepted: true } : i)),
        }));
        inquiry.operatorIds.forEach((opId) => {
          const owner = data.operators.find((o) => o.id === opId)?.ownerId;
          if (owner) {
            notify(owner, {
              type: "inquiry",
              title: "Traveler is ready to talk",
              body: `${user?.firstName ?? "A traveler"} wants to go through the quoted price.`,
              href: `/operator/inquiry/${id}`,
            });
          }
        });
      },
      markInquiryRead: (id) =>
        patch((d) => ({
          ...d,
          inquiries: d.inquiries.map((i) => (i.id === id ? { ...i, unread: false, status: i.status === "sent" ? "viewed" : i.status } : i)),
        })),
      sendQuote: (q) => {
        const id = uid("qt");
        const quote: Quote = { ...q, id, createdAt: todayISO() };
        const inquiry = data.inquiries.find((i) => i.id === q.inquiryId);
        patch((d) => ({
          ...d,
          quotes: [quote, ...d.quotes],
          inquiries: d.inquiries.map((i) => (i.id === q.inquiryId ? { ...i, status: "quoted", unread: true } : i)),
        }));
        if (inquiry) {
          notify(inquiry.userId, {
            type: "quote",
            title: "Quote received",
            body: "An operator sent a personalized quote.",
            href: `/inquiry/${inquiry.id}`,
          });
        }
        pushToast("Quote sent");
      },
      ensureConversation: (operatorId, inquiryId) => {
        const inquiry = inquiryId ? data.inquiries.find((i) => i.id === inquiryId) : undefined;
        const travelerId = inquiry?.userId ?? data.userId;
        if (!travelerId) {
          setAuthPrompt("Log in to message an operator");
          return null;
        }
        const existing = data.conversations.find((c) => c.userId === travelerId && c.operatorId === operatorId && !c.archived);
        if (existing) return existing.id;
        const id = uid("conv");
        patch((d) => ({
          ...d,
          conversations: [...d.conversations, { id, userId: travelerId, operatorId, inquiryId }],
        }));
        return id;
      },
      sendMessage: (conversationId, text, image) => {
        const conv = data.conversations.find((c) => c.id === conversationId);
        if (!conv || !user) return;
        const from = user.role === "operator" && user.operatorId === conv.operatorId ? "operator" : "traveler";
        const msg: ChatMessage = {
          id: uid("msg"),
          conversationId,
          from,
          text,
          image,
          createdAt: todayISO(),
          read: false,
        };
        patch((d) => ({ ...d, messages: [...d.messages, msg] }));
        if (from === "traveler") {
          const owner = data.operators.find((o) => o.id === conv.operatorId)?.ownerId;
          if (owner) notify(owner, { type: "message", title: "New message", body: text, href: `/operator/inquiry/${conv.inquiryId ?? ""}` });
        } else {
          notify(conv.userId, { type: "message", title: "New message", body: text, href: `/chat/${conv.id}` });
        }
      },
      archiveConversation: (id) =>
        patch((d) => ({ ...d, conversations: d.conversations.map((c) => (c.id === id ? { ...c, archived: true } : c)) })),
      unarchiveConversation: (id) =>
        patch((d) => ({ ...d, conversations: d.conversations.map((c) => (c.id === id ? { ...c, archived: false } : c)) })),
      markThreadRead: (conversationId) =>
        patch((d) => ({
          ...d,
          messages: d.messages.map((m) => (m.conversationId === conversationId ? { ...m, read: true } : m)),
        })),
      markAllRead: () =>
        patch((d) => {
          const target = notificationsFor(d.notifications, d.userId)[0]?.userId;
          return {
            ...d,
            notifications: d.notifications.map((n) => (n.userId === target ? { ...n, read: true } : n)),
          };
        }),
      markRead: (id) => patch((d) => ({ ...d, notifications: d.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      removeNotification: (id) => patch((d) => ({ ...d, notifications: d.notifications.filter((n) => n.id !== id) })),
      addReview: (input) => {
        if (!user) {
          setAuthPrompt("Log in to write a review");
          return false;
        }
        const allowed = data.inquiries.some(
          (i) =>
            i.userId === user.id &&
            i.operatorIds.includes(input.operatorId) &&
            (i.status === "quoted" || i.status === "closed"),
        );
        if (!allowed) return false;
        const review: Review = {
          ...input,
          id: uid("rv"),
          userId: user.id,
          author: `${user.firstName} ${user.lastName}`,
          country: user.country,
          helpful: 0,
          verified: true,
          pending: true,
        };
        patch((d) => ({ ...d, extraReviews: [review, ...d.extraReviews] }));
        pushToast("Review submitted", "It will appear after a short moderation check.");
        return true;
      },
      replyToReview: (id, reply) => patch((d) => ({ ...d, reviewReplies: { ...d.reviewReplies, [id]: reply } })),
      markHelpful: (id) => {
        if (data.helpful[id]) return;
        patch((d) => ({ ...d, helpful: { ...d.helpful, [id]: true } }));
        pushToast("Marked as helpful");
      },
      upsertTour: (tour) => {
        if (!user?.operatorId) return "Operator profile required.";
        const mine = data.tours.filter((t) => t.operatorId === user.operatorId && t.status === "published" && t.id !== tour.id);
        const sub = data.subscription?.userId === user.id && data.subscription.status === "active" ? data.subscription : null;
        const limit = plans.find((p) => p.id === (sub?.planId ?? "starter"))?.listings ?? 3;
        if (tour.status === "published" && mine.length >= limit) return `Your plan allows ${limit} published listings. Upgrade to add more.`;
        patch((d) => ({
          ...d,
          tours: d.tours.some((t) => t.id === tour.id) ? d.tours.map((t) => (t.id === tour.id ? tour : t)) : [tour, ...d.tours],
        }));
        pushToast(tour.status === "published" ? "Listing published" : "Draft saved");
        return null;
      },
      removeTour: (id) => patch((d) => ({ ...d, tours: d.tours.filter((t) => t.id !== id) })),
      registerOperator: (op) => {
        patch((d) => ({
          ...d,
          operators: [...d.operators, op],
          accounts: d.accounts.map((a) =>
            a.id === d.userId ? { ...a, role: "operator", operatorId: op.id, verificationStatus: "pending" } : a,
          ),
          mode: "operator",
        }));
      },
      updateOperator: (id, p) => patch((d) => ({ ...d, operators: d.operators.map((o) => (o.id === id ? { ...o, ...p } : o)) })),
      setSubscription: (planId, interval, last4) => {
        if (!user) return;
        const plan = plans.find((p) => p.id === planId);
        const amount = interval === "year" ? plan?.yearly : plan?.monthly;
        const sub: Subscription = {
          userId: user.id,
          planId,
          interval,
          status: "active",
          renewsAt: new Date(Date.now() + (interval === "year" ? 365 : 30) * 86400000).toISOString().slice(0, 10),
          last4,
        };
        patch((d) => ({
          ...d,
          subscription: sub,
          invoices: [
            { id: uid("inv"), userId: user.id, date: new Date().toISOString().slice(0, 10), label: `${plan?.name} · ${interval}`, amount: `$${amount}` },
            ...d.invoices,
          ],
        }));
        pushToast("Subscription active", `${plan?.name} is ready to use.`);
      },
      cancelSubscription: () =>
        patch((d) => ({
          ...d,
          subscription: d.subscription ? { ...d.subscription, status: "canceled" } : null,
        })),
      addRecentSearch: (q) => {
        const query = q.trim();
        if (!query) return;
        patch((d) => ({ ...d, recentSearches: [query, ...d.recentSearches.filter((r) => r.toLowerCase() !== query.toLowerCase())].slice(0, 8) }));
      },
      removeRecentSearch: (q) => patch((d) => ({ ...d, recentSearches: d.recentSearches.filter((r) => r !== q) })),
      addTicket: (topic, message) => {
        patch((d) => ({
          ...d,
          tickets: [...d.tickets, { id: uid("tk"), userId: d.userId ?? "guest", topic, message, createdAt: todayISO() }],
        }));
        pushToast("Message sent", "Our trust team replies within one working day.");
      },
    };
  }, [data, hydrated, online, toasts, authPrompt, authReturn, user]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
