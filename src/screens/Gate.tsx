import { DestinationCard } from "@/components/cards";
import { BackButton, Button, Chip, Field, Logo, Photo, UserPhoto } from "@/components/chrome";
import { CATEGORIES, haptic, passwordStrong } from "@/lib/format";
import { photo } from "@/lib/photos";
import { hasSeenOnboarding, markOnboardingSeen } from "@/lib/storage";
import { useApp } from "@/lib/store";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { Check, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    image: photo.elephants,
    title: "Discover Africa's Finest Safaris",
    body: "Explore handpicked safari and tour experiences from trusted local operators across the continent.",
  },
  {
    image: photo.jeep,
    title: "Only Verified Operators",
    body: "Every operator on Explola is vetted for quality, safety and authenticity, so you can plan with peace of mind.",
  },
  {
    image: photo.lodge,
    title: "Real Reviews, Real Photos",
    body: "See honest feedback and genuine photos from travelers who have been there before you.",
  },
  {
    image: photo.sunset,
    title: "Get Your Personalized Quote",
    body: "Send one inquiry and receive tailored itineraries and transparent price ranges directly from operators.",
  },
];

export function SplashScreen() {
  const { hydrated, onboarded, user } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      const seen = onboarded || hasSeenOnboarding();
      if (user?.role === "operator") navigate({ to: "/operator" });
      else if (user || seen) navigate({ to: "/explore" });
      else navigate({ to: "/onboarding" });
    }, 2000);
    return () => clearTimeout(t);
  }, [hydrated, onboarded, user, navigate]);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#552026] to-[#3A1418] px-8 text-center">
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-25" aria-hidden>
        <g fill="none" stroke="#E3B36F" strokeWidth="1">
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse key={i} cx="50%" cy="62%" rx={80 + i * 46} ry={28 + i * 16} />
          ))}
        </g>
      </svg>
      <div className="relative animate-rise">
        <svg viewBox="0 0 64 64" className="mx-auto mb-6 h-12 w-12" aria-hidden>
          <circle cx="32" cy="32" r="14" fill="none" stroke="#E3B36F" strokeWidth="1.5" />
          <path d="M32 8v10M32 46v10M8 32h10M46 32h10M14 14l7 7M43 43l7 7M50 14l-7 7M21 43l-7 7" stroke="#E3B36F" strokeWidth="1.5" />
          <circle cx="32" cy="32" r="3" fill="#E3B36F" />
        </svg>
        <Logo variant="white" className="mx-auto h-16" />
        <p className="mt-6 text-[15px] text-[#E3B36F]">Explore with Confidence</p>
      </div>
      <div className="absolute right-10 bottom-10 left-10 h-1 overflow-hidden rounded-full bg-white/20">
        <div className="h-full w-1/3 rounded-full bg-[#E3B36F]" style={{ animation: "splash-bar 1.4s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

export function OnboardingScreen() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const { markOnboarded } = useApp();
  const slide = slides[i];
  const finish = (to: "/signup" | "/login" | "/explore") => {
    markOnboarded();
    navigate({ to });
  };

  useEffect(() => {
    markOnboardingSeen();
    markOnboarded();
    slides.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
    // Record the visit once. markOnboarded changes whenever app state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#1A0C0E]">
      <Photo key={slide.image} src={slide.image} alt="" eager className="absolute inset-0 h-full w-full" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(26,12,14,0.62) 0%, rgba(26,12,14,0.12) 24%, rgba(26,12,14,0.18) 46%, rgba(26,12,14,0.82) 70%, rgba(18,8,10,0.96) 100%)",
        }}
      />
      <div className="relative flex min-h-dvh flex-col">
        <div className="flex justify-end px-5 pt-safe">
          <button
            type="button"
            onClick={() => finish("/explore")}
            className="rounded-full bg-[#1A0C0E]/70 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_1px_10px_rgba(0,0,0,0.4)]"
          >
            Skip
          </button>
        </div>
        <div className="mt-auto px-5 pb-safe">
          <h1 className="font-display text-[34px] leading-[42px] text-white" style={{ textShadow: "0 2px 18px rgba(0,0,0,0.55)" }}>
            {slide.title}
          </h1>
          <p className="mt-3 max-w-[22rem] text-[16px] leading-6 text-[#F7EEE3]" style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}>
            {slide.body}
          </p>
          <div className="mt-5 flex items-center gap-2" aria-label={`Slide ${i + 1} of ${slides.length}`}>
            {slides.map((_, n) => (
              <span key={n} className={`h-2 rounded-full ${n === i ? "w-6 bg-[#E3B36F]" : "w-2 bg-white/50"}`} />
            ))}
          </div>
          <div className="mt-6 space-y-2 pb-6">
            {i < slides.length - 1 ? (
              <Button full onClick={() => setI(i + 1)}>
                Continue
              </Button>
            ) : (
              <>
                <Button full onClick={() => finish("/signup")}>
                  Get Started
                </Button>
                <Button variant="text" full className="text-white" onClick={() => finish("/login")}>
                  I already have an account
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginScreen() {
  const { login, accounts, authReturn, setAuthReturn } = useApp();
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const go = () => {
    const account = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    const ret = authReturn;
    setAuthReturn(null);
    if (account?.role === "operator") {
      navigate({ to: "/operator" });
      return;
    }
    if (ret) {
      const url = new URL(ret, window.location.origin);
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      let path = url.pathname;
      if (base && path.startsWith(base)) path = path.slice(base.length) || "/";
      const search = Object.fromEntries(url.searchParams.entries());
      if (path && path !== "/" && path !== "/login" && path !== "/signup" && path !== "/onboarding") {
        void router.navigate({ to: path, search } as never);
        return;
      }
    }
    navigate({ to: "/explore" });
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.reason);
      return;
    }
    haptic(16);
    go();
  };

  return (
    <form noValidate onSubmit={submit} className="min-h-dvh px-5 pt-safe pb-10">
      <BackButton fallback="/onboarding" className="mt-2" />
      <h1 className="mt-4 font-display text-[32px] leading-10">Welcome back</h1>
      <p className="mt-1 text-[15px] text-muted-foreground">Log in to continue your journey</p>
      {error && <p className="mt-4 rounded-[14px] bg-destructive/10 px-3 py-3 text-[13px] text-destructive">{error}</p>}
      <div className="mt-6 space-y-4">
        <Field label="Email" type="text" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        <Field
          label="Password"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          trailing={
            <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
      </div>
      <button type="button" onClick={() => navigate({ to: "/forgot" })} className="mt-3 text-[14px] font-semibold text-primary">
        Forgot password?
      </button>
      <Button full className="mt-6" type="submit" loading={loading} disabled={loading}>
        Log In
      </Button>
      <p className="mt-6 mb-8 text-center text-[14px]">
        New to Explola?{" "}
        <button type="button" className="font-semibold text-primary" onClick={() => navigate({ to: "/signup" })}>
          Create an account
        </button>
      </p>
    </form>
  );
}

export function SignupScreen() {
  const { register, user, destinations } = useApp();
  const navigate = useNavigate();
  const [first, setFirst] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "done">("form");

  const submit = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    const res = await register({
      firstName: first.trim(),
      lastName: "",
      email,
      password,
      phone: "",
      country: "",
      marketing: false,
      role: "traveler",
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.reason);
      return;
    }
    haptic(20);
    setStep("done");
  };

  if (step === "done") {
    const name = (user?.firstName || first).trim();
    const mail = (user?.email || email).trim();
    const next = [
      ["Shape the trip", "Tell us the places, pace, and budget that feel right."],
      ["Save a few safaris", "Keep the journeys you want to compare in one place."],
      ["Ask for a quote", "Verified operators reply with a private itinerary."],
    ];
    return (
      <div className="min-h-dvh bg-background pb-36">
        <div className="relative h-[300px]">
          <Photo src={photo.savanna} alt="" eager className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A0C0E] via-[#2B1416]/35 to-black/15" />
          <div className="absolute right-5 bottom-16 left-5 text-white">
            <p className="text-[12px] font-semibold tracking-[0.16em] text-[#E3B36F] uppercase">Welcome to Explola</p>
            <h1 className="mt-2 font-display text-[36px] leading-[42px] text-white" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.45)" }}>
              You are in{name ? `, ${name}` : ""}
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-[#F7EEE3]">Your account is ready. The next part is the trip itself.</p>
          </div>
        </div>

        <div className="relative z-10 -mt-10 space-y-3 px-5">
          <div className="flex items-center gap-3 rounded-[20px] bg-card p-4 shadow-warm">
            <UserPhoto src={user?.avatar} name={name || "Traveler"} className="h-14 w-14 shrink-0 ring-2 ring-gold" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-[18px]">Account ready</p>
              <p className="truncate text-[13px] text-muted-foreground">{mail || "You can start exploring right away"}</p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-[#2B1416] animate-pop">
              <Check size={18} strokeWidth={2.5} />
            </span>
          </div>

          <section className="rounded-[20px] bg-card p-4 shadow-warm">
            <p className="eyebrow">What to do first</p>
            <ol className="mt-3 space-y-3">
              {next.map(([title, body], i) => (
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

          <section className="rounded-[20px] bg-card py-4 shadow-warm">
            <div className="flex items-center justify-between px-4">
              <p className="eyebrow">Places travelers start</p>
              <button type="button" className="text-[13px] font-semibold text-primary" onClick={() => navigate({ to: "/search", search: { tab: "destinations" } })}>
                View all
              </button>
            </div>
            <div className="h-scroll mt-3 flex gap-3 px-4 pb-2">
              {destinations.map((d) => (
                <DestinationCard key={d.id} destination={d} />
              ))}
            </div>
          </section>
        </div>

        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 space-y-1 border-t border-border bg-card px-5 py-3 pb-safe">
          <Button full onClick={() => navigate({ to: "/explore" })}>
            Start exploring
          </Button>
          <Button variant="text" full onClick={() => navigate({ to: "/preferences" })}>
            Set trip preferences
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-5 pt-safe pb-10">
      <button type="button" aria-label="Go back" onClick={() => navigate({ to: "/onboarding" })} className="mt-2 flex h-11 w-11 items-center justify-center rounded-full border border-border">
        ←
      </button>
      <h1 className="mt-4 font-display text-[32px] leading-10">Create your account</h1>
      <p className="mt-1 text-[15px] text-muted-foreground">Start planning your African adventure</p>
      {error && <p className="mt-4 rounded-[14px] bg-destructive/10 px-3 py-3 text-[13px] text-destructive">{error}</p>}
      <div className="mt-5 space-y-4">
        <Field label="First name" autoComplete="given-name" value={first} onChange={(e) => setFirst(e.target.value)} />
        <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          label="Password"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          trailing={
            <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        <label className="flex items-start gap-3 text-[14px]">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 h-5 w-5 accent-[#552026]" />
          <span>
            I agree to the <button type="button" className="font-semibold underline" onClick={() => navigate({ to: "/help" })}>Terms of Service</button> and{" "}
            <button type="button" className="font-semibold underline" onClick={() => navigate({ to: "/help" })}>Privacy Policy</button>
          </span>
        </label>
      </div>
      <Button full className="mt-4" loading={loading} disabled={loading} onClick={submit}>
        Create Account
      </Button>
      <p className="mt-6 text-center text-[14px]">
        Already have an account?{" "}
        <button type="button" className="font-semibold text-primary" onClick={() => navigate({ to: "/login" })}>
          Log in
        </button>
      </p>
    </div>
  );
}

export function ForgotScreen() {
  const app = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const account = app.accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());

  return (
    <div className="min-h-dvh px-5 pt-safe pb-10">
      <button type="button" aria-label="Go back" onClick={() => (step === 0 ? navigate({ to: "/login" }) : setStep(step - 1))} className="mt-2 flex h-11 w-11 items-center justify-center rounded-full border border-border">
        ←
      </button>
      {step === 0 && (
        <>
          <h1 className="mt-4 font-display text-[32px]">Reset your password</h1>
          <p className="mt-2 text-[15px] leading-6 text-muted-foreground">Enter the email on your account. You can choose a new password on the next screen.</p>
          <div className="mt-6">
            <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <p className="mt-3 text-[13px] text-destructive">{error}</p>}
          <Button
            full
            className="mt-6"
            disabled={!email.includes("@")}
            onClick={() => {
              if (!account) return setError("We could not find an account with that email.");
              setError("");
              setStep(1);
            }}
          >
            Continue
          </Button>
        </>
      )}
      {step === 1 && (
        <>
          <h1 className="mt-4 font-display text-[32px]">Choose a new password</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">Use 8 or more characters, with a letter, a number, and a symbol.</p>
          <div className="mt-6 space-y-4">
            <Field label="New password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Field label="Confirm password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={confirm && confirm !== password ? "Passwords do not match" : ""} />
          </div>
          <Button
            full
            className="mt-6"
            disabled={!passwordStrong(password) || password !== confirm || !account}
            onClick={() => {
              const err = app.resetPassword(email, password);
              if (err) setError(err);
              else setStep(2);
            }}
          >
            Update password
          </Button>
          {error && <p className="mt-3 text-[13px] text-destructive">{error}</p>}
        </>
      )}
      {step === 2 && (
        <div className="mt-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success text-3xl text-white animate-pop">✓</div>
          <h1 className="mt-6 font-display text-[32px]">Password updated</h1>
          <p className="mt-2 text-muted-foreground">You can log in with your new password.</p>
          <Button full className="mt-8" onClick={() => navigate({ to: "/login" })}>
            Back to login
          </Button>
        </div>
      )}
    </div>
  );
}

export function PreferencesScreen() {
  const { setPrefs, pushToast, prefs, hydrated } = useApp();
  const navigate = useNavigate();
  const [interests, setInterests] = useState<string[]>(prefs?.interests ?? []);
  const [countries, setCountries] = useState<string[]>(prefs?.countries ?? []);
  const [budget, setBudget] = useState(prefs?.budget || "$3,000 – $6,000");
  const [timeframe, setTimeframe] = useState(prefs?.timeframe || "Next 12 months");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!hydrated || loaded) return;
    if (prefs) {
      setInterests(prefs.interests);
      setCountries(prefs.countries);
      setBudget(prefs.budget);
      setTimeframe(prefs.timeframe);
    }
    setLoaded(true);
  }, [hydrated, loaded, prefs]);
  const dests = ["Tanzania", "Kenya", "South Africa", "Botswana", "Namibia", "Uganda", "Rwanda", "Zambia", "Zanzibar"];
  const toggle = (list: string[], v: string, set: (n: string[]) => void) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  return (
    <div className="min-h-dvh px-5 pt-safe pb-10">
      <div className="flex items-center gap-3">
        <BackButton fallback="/profile" />
        <h1 className="min-w-0 flex-1 font-display text-[28px] leading-8">Trip preferences</h1>
        <button type="button" className="text-[14px] font-semibold text-primary" onClick={() => navigate({ to: "/explore" })}>
          Skip
        </button>
      </div>
      <p className="mt-2 text-[15px] text-muted-foreground">Optional. This helps Explola surface journeys that feel like yours.</p>
      <p className="eyebrow mt-6">Interests</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Chip key={c} selected={interests.includes(c)} onClick={() => toggle(interests, c, setInterests)}>
            {c}
          </Chip>
        ))}
      </div>
      <p className="eyebrow mt-6">Preferred countries</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {dests.map((c) => (
          <Chip key={c} selected={countries.includes(c)} onClick={() => toggle(countries, c, setCountries)}>
            {c}
          </Chip>
        ))}
      </div>
      <p className="eyebrow mt-6">Typical budget</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {["Under $2,000", "$3,000 – $6,000", "$6,000+"].map((b) => (
          <Chip key={b} selected={budget === b} onClick={() => setBudget(b)}>
            {b}
          </Chip>
        ))}
      </div>
      <p className="eyebrow mt-6">Travel timeframe</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {["Next 6 months", "Next 12 months", "Just dreaming"].map((b) => (
          <Chip key={b} selected={timeframe === b} onClick={() => setTimeframe(b)}>
            {b}
          </Chip>
        ))}
      </div>
      <Button
        full
        className="mt-8"
        onClick={() => {
          setPrefs({ interests, countries, budget, timeframe });
          pushToast("Preferences saved");
          navigate({ to: "/explore" });
        }}
      >
        Save and explore
      </Button>
    </div>
  );
}
