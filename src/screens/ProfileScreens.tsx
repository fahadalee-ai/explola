import { Button, Dialog, Header, TravelerTabs, UserPhoto } from "@/components/chrome";
import { COUNTRIES, passwordChecks } from "@/lib/format";
import { defaultProfilePhoto } from "@/lib/photos";
import { useApp } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Bookmark, ChevronRight, LifeBuoy, MapPin, MessageSquare, Settings, SlidersHorizontal, UserRound, type LucideIcon } from "lucide-react";
import { useState } from "react";

export function ProfileScreen() {
  const app = useApp();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const user = app.user;
  const savedCount = app.saved.filter((s) => s.userId === user?.id && s.kind === "tour").length;
  const inquiryCount = app.inquiries.filter((i) => i.userId === user?.id).length;
  const Row = ({ label, hint, to, icon: Icon }: { label: string; hint?: string; to: "/settings" | "/help" | "/saved" | "/inquiries" | "/edit-profile" | "/notifications" | "/preferences"; icon: LucideIcon }) => (
    <button onClick={() => navigate({ to })} className="flex min-h-[60px] w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-b-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand text-primary">
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold">{label}</span>
        {hint && <span className="block text-[12px] text-muted-foreground">{hint}</span>}
      </span>
      <ChevronRight size={16} className="text-muted-foreground" />
    </button>
  );
  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="h-28 bg-gradient-to-b from-[#552026] to-[#3A1418]" />
      <div className="-mt-12 px-5">
        {user ? (
          <div className="rounded-[24px] bg-card px-5 pt-0 pb-5 shadow-warm">
            <UserPhoto src={user.avatar} name={user.firstName} className="-mt-10 h-24 w-24 ring-4 ring-card" />
            <h1 className="mt-3 font-display text-[30px] leading-9">
              {user.firstName} {user.lastName}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-[13px] text-muted-foreground">
              <MapPin size={14} /> {user.country || "Add your country"}
            </p>
            {user.bio && <p className="mt-3 text-[15px] leading-6">{user.bio}</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => navigate({ to: "/saved" })} className="rounded-[16px] bg-sand px-3 py-3 text-left">
                <span className="block font-display text-[22px]">{savedCount}</span>
                <span className="text-[12px] text-muted-foreground">Saved safaris</span>
              </button>
              <button type="button" onClick={() => navigate({ to: "/inquiries" })} className="rounded-[16px] bg-sand px-3 py-3 text-left">
                <span className="block font-display text-[22px]">{inquiryCount}</span>
                <span className="text-[12px] text-muted-foreground">Inquiries</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] bg-card p-5 shadow-warm">
            <p className="font-display text-[28px] leading-9">Browse as a guest</p>
            <p className="mt-2 text-[15px] leading-6 text-muted-foreground">Log in to save trips, request quotes, and keep your plans in one place.</p>
            <Button className="mt-4" onClick={() => navigate({ to: "/login" })}>
              Log in
            </Button>
          </div>
        )}

        <div className="mt-4 overflow-hidden rounded-[20px] bg-card shadow-warm">
          {user && <Row icon={UserRound} label="Edit profile" hint={user.email} to="/edit-profile" />}
          {user && <Row icon={SlidersHorizontal} label="Trip preferences" hint="Interests, budget, and timing" to="/preferences" />}
          <Row icon={Bookmark} label="Saved" hint="Safaris you want to come back to" to="/saved" />
          <Row icon={MessageSquare} label="Inquiries" hint="Quotes and replies" to="/inquiries" />
          <Row icon={Bell} label="Notifications" to="/notifications" />
          <Row icon={Settings} label="Settings" to="/settings" />
          <Row icon={LifeBuoy} label="Help and support" to="/help" />
        </div>

        {user && (
          <Button variant="tertiary" full className="mt-4" onClick={() => setLogoutOpen(true)}>
            Log out
          </Button>
        )}
      </div>
      <Dialog
        open={logoutOpen}
        title="Log out?"
        body="You can keep browsing. Saved trips and inquiries stay on this device."
        confirm="Log out"
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          app.logout();
          setLogoutOpen(false);
          navigate({ to: "/explore" });
        }}
      />
      <TravelerTabs />
    </div>
  );
}

export function EditProfileScreen() {
  const { user, updateUser, pushToast } = useApp();
  const [form, setForm] = useState(() => ({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    country: user?.country || "",
    dob: user?.dob || "",
    bio: user?.bio || "",
    nationality: user?.nationality || "",
    avatar: user?.avatar || defaultProfilePhoto,
  }));
  if (!user) return <p className="px-5 pt-safe">Log in to edit your profile.</p>;
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="px-5 pt-safe pb-10">
      <Header title="Edit profile" />
      <label className="mt-2 flex flex-col items-center gap-2">
        <UserPhoto src={form.avatar} name={form.firstName} className="h-28 w-28" />
        <span className="text-[13px] font-semibold text-primary">Change photo</span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => set("avatar", String(reader.result));
            reader.readAsDataURL(file);
          }}
        />
      </label>
      <div className="mt-4 space-y-3">
        <label className="block text-[13px]">First name<input className="mt-1 h-12 w-full rounded-[14px] bg-sand px-3" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></label>
        <label className="block text-[13px]">Last name<input className="mt-1 h-12 w-full rounded-[14px] bg-sand px-3" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></label>
        <p className="text-[13px] text-muted-foreground">Email {user.email} {user.verifiedEmail && "· Verified"}</p>
        <label className="block text-[13px]">Phone<input className="mt-1 h-12 w-full rounded-[14px] bg-sand px-3" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></label>
        <label className="block text-[13px]">
          Country
          <select className="mt-1 h-12 w-full rounded-[14px] bg-sand px-3" value={form.country} onChange={(e) => set("country", e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block text-[13px]">Date of birth<input type="date" className="mt-1 h-12 w-full rounded-[14px] bg-sand px-3" value={form.dob} onChange={(e) => set("dob", e.target.value)} /></label>
        <label className="block text-[13px]">Passport nationality<input className="mt-1 h-12 w-full rounded-[14px] bg-sand px-3" value={form.nationality} onChange={(e) => set("nationality", e.target.value)} /></label>
        <label className="block text-[13px]">Bio<textarea className="mt-1 min-h-24 w-full rounded-[14px] bg-sand px-3 py-2" value={form.bio} onChange={(e) => set("bio", e.target.value)} /></label>
        <Button
          full
          onClick={() => {
            updateUser(form);
            pushToast("Profile saved");
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

export function SettingsScreen() {
  const app = useApp();
  const [pw, setPw] = useState({ current: "", next: "" });
  const [pwError, setPwError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="px-5 pt-safe pb-10">
      <Header title="Settings" />
      <h2 className="mt-2 font-display text-[20px]">Account</h2>
      <div className="mt-2 space-y-2">
        <input placeholder="Current password" type="password" className="h-12 w-full rounded-[14px] bg-sand px-3" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
        <input placeholder="New password" type="password" className="h-12 w-full rounded-[14px] bg-sand px-3" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
        <p className="text-[12px] text-muted-foreground">
          {passwordChecks(pw.next).length ? "Length ok. " : "Use 8+ characters, a letter, number and symbol."}
        </p>
        {pwError && <p className="text-[12px] text-destructive">{pwError}</p>}
        <Button
          variant="tertiary"
          onClick={() => {
            const err = app.changePassword(pw.current, pw.next);
            setPwError(err || "");
            if (!err) app.pushToast("Password updated");
          }}
        >
          Change password
        </Button>
      </div>
      <h2 className="mt-6 font-display text-[20px]">Privacy</h2>
      <p className="mt-2 text-[13px] leading-5 text-muted-foreground">Explola stores your trip notes on this device until a Supabase project is connected. We never sell traveler lists.</p>
      <h2 className="mt-6 font-display text-[20px]">About</h2>
      <p className="text-[14px]">Explola 1.0.0</p>
      <button className="mt-2 block text-[14px] font-semibold text-primary" onClick={() => navigate({ to: "/help" })}>
        Terms, privacy and licences
      </button>
      <Button variant="destructive" full className="mt-8" onClick={() => setDeleteOpen(true)}>
        Delete account
      </Button>
      <Dialog
        open={deleteOpen}
        danger
        title="Delete your account?"
        body="This removes your profile, saved trips and inquiries from this device. It cannot be undone."
        confirm="Delete account"
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          app.deleteAccount();
          navigate({ to: "/explore" });
        }}
      />
    </div>
  );
}

export function HelpScreen() {
  const { faqs, addTicket, pushToast } = useApp();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [topic, setTopic] = useState("Booking and inquiries");
  const [message, setMessage] = useState("");
  const [report, setReport] = useState("");
  const groups = [...new Set(faqs.map((f) => f.group))];
  const filtered = faqs.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="px-5 pt-safe pb-10">
      <Header title="Help and support" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search help" className="h-12 w-full rounded-[14px] bg-sand px-3 outline-none" aria-label="Search help" />
      {groups.map((g) => (
        <section key={g} className="mt-5">
          <h2 className="font-display text-[20px]">{g}</h2>
          {filtered
            .filter((f) => f.group === g)
            .map((f) => (
              <button key={f.id} className="mt-2 w-full rounded-[14px] bg-card p-3 text-left shadow-warm" onClick={() => setOpen(open === f.id ? null : f.id)}>
                <span className="font-medium">{f.q}</span>
                {open === f.id && <span className="mt-2 block text-[14px] leading-6 text-muted-foreground">{f.a}</span>}
              </button>
            ))}
        </section>
      ))}
      <section className="mt-6 rounded-[16px] bg-sand p-4">
        <h2 className="font-display text-[20px]">How Explola verifies operators</h2>
        <p className="mt-2 text-[14px] leading-6">We review a trade licence, sample itineraries and, where the country requires it, insurance. Verification is renewed yearly. A gold shield means that check is current. It is not a guarantee of a specific wildlife sighting.</p>
      </section>
      <h2 className="mt-6 font-display text-[20px]">Contact support</h2>
      <select className="mt-2 h-12 w-full rounded-[14px] bg-sand px-3" value={topic} onChange={(e) => setTopic(e.target.value)}>
        {["Booking and inquiries", "Verification", "Pricing", "Safety"].map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" className="mt-2 min-h-24 w-full rounded-[14px] bg-sand px-3 py-2" />
      <Button
        className="mt-2"
        disabled={message.length < 8}
        onClick={() => {
          addTicket(topic, message);
          setMessage("");
        }}
      >
        Send
      </Button>
      <p className="mt-2 text-[13px] text-muted-foreground">Or email hello@explola.com</p>
      <h2 className="mt-6 font-display text-[20px]">Report an operator</h2>
      <textarea value={report} onChange={(e) => setReport(e.target.value)} placeholder="What happened?" className="mt-2 min-h-24 w-full rounded-[14px] bg-sand px-3 py-2" />
      <Button
        variant="tertiary"
        className="mt-2"
        disabled={report.length < 8}
        onClick={() => {
          addTicket("Report", report);
          setReport("");
          pushToast("Report received");
        }}
      >
        Submit report
      </Button>
    </div>
  );
}
