import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import {
  Home, CalendarDays, Users, Radio, MoreHorizontal, MapPin, Clock, Heart,
  ChevronRight, ChevronLeft, Search, Bell, LogOut, Send, ThumbsUp,
  BarChart3, Plus, Check, Mic2, Coffee, Ship, PartyPopper, Mail,
  ArrowRight, Sparkles, Building2, Star, Briefcase, Navigation, Shield, Lock, Trash2, MessageCircle, X, Edit3
} from "lucide-react";
import { signInWithPassword, getCurrentUser, onAuthChange, signOut } from "./firebaseClient";
import * as api from "./api";

/* ---------------------------------------------------------------------- */
/*  BRAND TOKENS                                                          */
/* ---------------------------------------------------------------------- */
const C = {
  blue: "#0064B1", navy: "#0A1D37", slate: "#6B7280", cloud: "#E5E7EB",
  white: "#FFFFFF", bg: "#F6F7F9", green: "#0A8F5B", purple: "#7C3AED", amber: "#C2790C",
};

const TRACK_COLOR = {
  "Strategy & Leadership": C.navy,
  "Revenue Growth & Commercial Excellence": C.blue,
  "Products & Solutions": C.purple,
  "Tools, Process & Development": C.green,
  "Networking & Community": C.amber,
  Multiple: C.slate,
};

/* ---------------------------------------------------------------------- */
/*  STATIC CONTENT — regenerate this block from your spreadsheet          */
/* ---------------------------------------------------------------------- */
/* ---------------------------------------------------------------------- */
/*  CONTENT CONTEXT — sessions, speakers, days, venue spots and event      */
/*  config all live in Firestore now (editable via the Builder screens     */
/*  below) instead of being hardcoded here. Loaded once at the root App    */
/*  component and made available to every screen via context.             */
/* ---------------------------------------------------------------------- */
const ContentContext = createContext({
  sessions: [], speakers: [], days: [], venueSpots: [], eventConfig: {}, contentLoading: true,
});
function useContent() {
  return useContext(ContentContext);
}

function findSpeaker(speakers, id) {
  return speakers.find((s) => s.id === id) || { id, name: "Unknown speaker", title: "", company: "", initials: "?", color: C.slate, bio: "" };
}

function dayInfo(days, n) {
  return days.find((d) => d.day === n) || { day: n, label: `Day ${n}`, date: "", sub: "" };
}

// Icon options for venue spots — the builder form picks from these by key
// since Firestore can only store data, not React components.
const VENUE_ICONS = { building: Building2, coffee: Coffee, ship: Ship, party: PartyPopper, users: Users, map: MapPin };
const VENUE_ICON_KEYS = Object.keys(VENUE_ICONS);

const TRACKS = ["All", "Strategy & Leadership", "Revenue Growth & Commercial Excellence", "Products & Solutions", "Tools, Process & Development", "Networking & Community", "Multiple"];

/* ---------------------------------------------------------------------- */
/*  SMALL UI PRIMITIVES                                                    */
/* ---------------------------------------------------------------------- */
function Eyebrow({ children, color = C.slate, style }) {
  return (
    <div style={{ color, letterSpacing: "0.14em", fontSize: 11, fontWeight: 700, ...style }} className="uppercase flex items-center gap-2">
      <span style={{ width: 14, height: 1, background: color, opacity: 0.6 }} />{children}<span style={{ width: 14, height: 1, background: color, opacity: 0.6 }} />
    </div>
  );
}
function TrackTag({ track, size = "sm" }) {
  const color = TRACK_COLOR[track] || C.slate;
  const pad = size === "sm" ? "2px 8px" : "4px 10px";
  const fs = size === "sm" ? 10 : 11;
  return <span style={{ background: color + "1A", color, padding: pad, borderRadius: 6, fontSize: fs, fontWeight: 700, letterSpacing: "0.03em" }} className="uppercase whitespace-nowrap">{track}</span>;
}
function Avatar({ initials, color, size = 40 }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color, color: C.white, fontSize: size * 0.36, fontWeight: 700 }} className="flex items-center justify-center flex-shrink-0">{initials}</div>;
}
function WorldArcBg() {
  return (
    <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.35 }}>
      <path d="M20,150 Q200,20 380,110" stroke="#4A9FE0" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M40,180 Q220,60 360,50" stroke="#4A9FE0" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M0,90 Q180,150 400,40" stroke="#4A9FE0" strokeWidth="1" fill="none" opacity="0.5" />
      {[[20,150],[380,110],[40,180],[360,50],[0,90],[400,40],[200,20],[220,60]].map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2" fill="#7EC1F5" />)}
    </svg>
  );
}

/* ---------------------------------------------------------------------- */
/*  AUTH SCREEN — email + password (accounts are pre-created, not         */
/*  self-registered — see bulk_create_attendees.js)                       */
/* ---------------------------------------------------------------------- */
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email.trim() || !email.includes("@")) { setError("Enter a valid email to continue."); return; }
    if (!password) { setError("Enter your password to continue."); return; }
    setBusy(true); setError("");
    try {
      await signInWithPassword(email.trim().toLowerCase(), password);
    } catch (e) {
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        setError("Incorrect email or password.");
      } else if (e.code === "auth/user-not-found") {
        setError("This email isn't registered for the Summit. Contact the organizers if you think this is a mistake.");
      } else if (e.code === "auth/too-many-requests") {
        setError("Too many attempts — try again in a few minutes.");
      } else {
        setError("Couldn't sign in — try again in a moment.");
      }
    }
    setBusy(false);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: C.navy, paddingTop: "env(safe-area-inset-top)" }}>
      <div className="relative overflow-hidden px-7 pt-14 pb-10 flex-shrink-0">
        <WorldArcBg />
        <div className="relative">
          <div className="flex items-center gap-2 mb-8">
            <img src="/icons/logo-mark-white.png" alt="" style={{ width: 30, height: 30 }} />
            <span style={{ color: C.white, fontWeight: 800, fontSize: 20, letterSpacing: "0.02em" }}>RIB</span>
          </div>
          <h1 style={{ color: C.white, fontWeight: 800, fontSize: 28, lineHeight: 1.15 }}>Global Revenue<br />Summit <span style={{ color: "#7EC1F5" }}>2027</span></h1>
          <div className="mt-3"><Eyebrow color="#7EC1F5">Istanbul</Eyebrow></div>
          <p style={{ color: "#B9C4D6", fontSize: 12, letterSpacing: "0.08em" }} className="uppercase mt-4">Building Better Together</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-t-[28px] px-7 pt-8 pb-8 flex flex-col overflow-y-auto">
        <p style={{ color: C.navy }} className="font-semibold text-[15px] mb-1">Welcome, delegate.</p>
        <p style={{ color: C.slate }} className="text-[13px] mb-6">Sign in with your registration email and the Summit password from your confirmation.</p>

        <label style={{ color: C.slate }} className="text-[11px] font-semibold uppercase tracking-wide mb-1 block">Work email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@company.com" type="email"
          style={{ borderColor: C.cloud }} className="w-full border rounded-xl px-3.5 py-2.5 text-[14px] mb-4 outline-none" onKeyDown={(e) => e.key === "Enter" && submit()} />

        <label style={{ color: C.slate }} className="text-[11px] font-semibold uppercase tracking-wide mb-1 block">Password</label>
        <div className="relative mb-2">
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Summit password" type="password"
            style={{ borderColor: C.cloud }} className="w-full border rounded-xl pl-3.5 pr-9 py-2.5 text-[14px] outline-none" onKeyDown={(e) => e.key === "Enter" && submit()} />
          <Lock size={15} color={C.slate} className="absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        {error && <p style={{ color: "#C0342C" }} className="text-[12px] mt-1">{error}</p>}

        <button onClick={submit} disabled={busy} style={{ background: C.blue }} className="mt-6 w-full text-white rounded-xl py-3 font-semibold text-[14px] flex items-center justify-center gap-2 disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"} <ArrowRight size={16} />
        </button>
        <p style={{ color: C.slate }} className="text-[11px] text-center mt-4">Jan 25–29, 2027 · Istanbul</p>
        <p style={{ color: C.slate }} className="text-[11px] text-center mt-1">Forgot your password? Contact the organizers.</p>
      </div>
    </div>
  );
}

/* Fallback shown only if someone is signed in but no attendee profile
   exists yet in Firestore — shouldn't happen for accounts created by the
   bulk script, but kept as a safety net. */
function CompleteProfileScreen({ email, onDone }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!name.trim()) { setError("Enter your name to continue."); return; }
    setBusy(true);
    try {
      const profile = await api.upsertAttendeeProfile({ email, name: name.trim(), company: company.trim() });
      onDone(profile);
    } catch {
      setError("Something went wrong — try again.");
    }
    setBusy(false);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: C.navy, paddingTop: "env(safe-area-inset-top)" }}>
      <div className="relative overflow-hidden px-7 pt-14 pb-10 flex-shrink-0">
        <WorldArcBg />
        <div className="relative">
          <h1 style={{ color: C.white, fontWeight: 800, fontSize: 24 }}>You're signed in.<br />One more step.</h1>
          <p style={{ color: "#B9C4D6" }} className="text-[13px] mt-2">{email}</p>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-t-[28px] px-7 pt-8 pb-8 flex flex-col overflow-y-auto">
        <label style={{ color: C.slate }} className="text-[11px] font-semibold uppercase tracking-wide mb-1 block">Full name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Vale" style={{ borderColor: C.cloud }} className="w-full border rounded-xl px-3.5 py-2.5 text-[14px] mb-4 outline-none" />
        <label style={{ color: C.slate }} className="text-[11px] font-semibold uppercase tracking-wide mb-1 block">Company (optional)</label>
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="RIB — EMEA" style={{ borderColor: C.cloud }} className="w-full border rounded-xl px-3.5 py-2.5 text-[14px] mb-2 outline-none" />
        {error && <p style={{ color: "#C0342C" }} className="text-[12px] mt-2">{error}</p>}
        <button onClick={submit} disabled={busy} style={{ background: C.blue }} className="mt-6 w-full text-white rounded-xl py-3 font-semibold text-[14px] disabled:opacity-60">
          {busy ? "Saving…" : "Enter the Summit"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  APP BAR + NAV                                                          */
/* ---------------------------------------------------------------------- */
function AppBar({ title, onBack, right }) {
  return (
    <div style={{ borderColor: C.cloud, paddingTop: "calc(env(safe-area-inset-top) + 16px)" }} className="flex items-center justify-between px-5 pb-4 border-b flex-shrink-0 bg-white">
      <div className="flex items-center gap-2 min-w-0">
        {onBack && <button onClick={onBack} className="mr-1 flex-shrink-0"><ChevronLeft size={20} color={C.navy} /></button>}
        <h2 style={{ color: C.navy }} className="font-bold text-[17px] truncate">{title}</h2>
      </div>
      {right}
    </div>
  );
}
function BottomNav({ view, setView }) {
  const items = [
    { id: "home", icon: Home, label: "Home" }, { id: "agenda", icon: CalendarDays, label: "Agenda" },
    { id: "itinerary", icon: Heart, label: "My Agenda" }, { id: "live", icon: Radio, label: "Live" },
    { id: "more", icon: MoreHorizontal, label: "More" },
  ];
  return (
    <div style={{ borderColor: C.cloud, paddingBottom: "env(safe-area-inset-bottom)" }} className="flex-shrink-0 border-t bg-white flex items-stretch">
      {items.map((it) => {
        const active = view === it.id || (it.id === "more" && ["speakers","network","venue","announcements","profile","allowlist","organizers","messages","inbox","agendaBuilder","speakerBuilder","venueBuilder"].includes(view));
        const Icon = it.icon;
        return (
          <button key={it.id} onClick={() => setView(it.id)} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5">
            <Icon size={20} color={active ? C.blue : C.slate} strokeWidth={active ? 2.4 : 2} />
            <span style={{ color: active ? C.blue : C.slate, fontWeight: active ? 700 : 500 }} className="text-[10px]">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  HOME                                                                    */
/* ---------------------------------------------------------------------- */
function daysUntil(dateStr) {
  const now = new Date();
  const target = new Date(dateStr + "T00:00:00");
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}
function HomeView({ user, announcements, setView, openSession, itinerary }) {
  const { sessions, days } = useContent();
  const d = daysUntil(days[0]?.date || "2027-01-25");
  const nextSession = sessions.filter((s) => s.track !== "Social").sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0];
  const latest = announcements[0];
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: C.bg }}>
      <div className="relative overflow-hidden px-6 pb-8" style={{ background: C.navy, paddingTop: "calc(env(safe-area-inset-top) + 28px)" }}>
        <WorldArcBg />
        <div className="relative">
          <div className="flex items-center gap-2 mb-5">
            <img src="/icons/logo-mark-white.png" alt="" style={{ width: 20, height: 20 }} />
            <span style={{ color: C.white, fontWeight: 700, fontSize: 22, letterSpacing: "0.01em" }}>RIB Global Revenue Summit 2027</span>
          </div>
          <p style={{ color: "#B9C4D6" }} className="text-[12px]">Welcome back,</p>
          <h1 style={{ color: C.white }} className="text-[22px] font-bold mb-4">{user.name.split(" ")[0]}</h1>
          {d > 0 ? (
            <div style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }} className="border rounded-2xl px-4 py-3.5">
              <p style={{ color: "#7EC1F5" }} className="text-[28px] font-extrabold leading-none">{d}</p>
              <p style={{ color: "#B9C4D6" }} className="text-[12px] mt-1">days until the Summit opens in Istanbul</p>
            </div>
          ) : (
            <div style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }} className="border rounded-2xl px-4 py-3.5">
              <p style={{ color: "#7EC1F5" }} className="text-[14px] font-bold">The Summit is underway</p>
              <p style={{ color: "#B9C4D6" }} className="text-[12px] mt-1">Check today's agenda for what's next.</p>
            </div>
          )}
        </div>
      </div>
      <div className="px-5 -mt-4 relative">
        {latest && (
          <button onClick={() => setView("announcements")} style={{ borderColor: C.cloud }} className="w-full bg-white border rounded-2xl px-4 py-3.5 text-left flex items-start gap-3 shadow-sm">
            <div style={{ background: C.blue + "15" }} className="rounded-full p-2 flex-shrink-0"><Bell size={15} color={C.blue} /></div>
            <div className="min-w-0"><p style={{ color: C.slate }} className="text-[10px] font-bold uppercase tracking-wide">Latest announcement</p><p style={{ color: C.navy }} className="text-[13px] font-semibold truncate">{latest.title}</p></div>
            <ChevronRight size={16} color={C.slate} className="ml-auto flex-shrink-0 mt-1" />
          </button>
        )}
      </div>
      {nextSession && (
        <div className="px-5 mt-5">
          <Eyebrow color={C.slate}>Up Next</Eyebrow>
          <button onClick={() => openSession(nextSession)} style={{ borderColor: C.cloud }} className="mt-2 w-full bg-white border rounded-2xl p-4 text-left">
            <div className="flex items-center gap-2 mb-2"><TrackTag track={nextSession.track} />{itinerary.includes(nextSession.id) && <Heart size={13} color={C.blue} fill={C.blue} />}</div>
            <p style={{ color: C.navy }} className="font-bold text-[14px] leading-snug">{nextSession.title}</p>
            <div style={{ color: C.slate }} className="flex items-center gap-3 text-[12px] mt-2">
              <span className="flex items-center gap-1"><Clock size={12} />{nextSession.start} · {dayInfo(days, nextSession.day).date}</span>
              <span className="flex items-center gap-1"><MapPin size={12} />{nextSession.room}</span>
            </div>
          </button>
        </div>
      )}
      <div className="px-5 mt-6 pb-8">
        <Eyebrow color={C.slate}>Explore</Eyebrow>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[{ id: "speakers", label: "Speakers", icon: Mic2 }, { id: "network", label: "Network", icon: Users }, { id: "venue", label: "Venue & Map", icon: MapPin }, { id: "agenda", label: "Full Agenda", icon: CalendarDays }].map((c) => {
            const Icon = c.icon;
            return <button key={c.id} onClick={() => setView(c.id)} style={{ borderColor: C.cloud }} className="bg-white border rounded-2xl p-4 text-left"><Icon size={18} color={C.blue} /><p style={{ color: C.navy }} className="font-semibold text-[13px] mt-2.5">{c.label}</p></button>;
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  AGENDA + SESSION/SPEAKER DETAIL + ITINERARY                            */
/* ---------------------------------------------------------------------- */
function SessionCard({ s, saved, onToggleSave, onOpen }) {
  const { speakers } = useContent();
  return (
    <button onClick={() => onOpen(s)} style={{ borderColor: C.cloud }} className="w-full bg-white border rounded-2xl p-4 text-left flex gap-3">
      <div className="flex-shrink-0 w-14 text-right pt-0.5"><p style={{ color: C.navy }} className="font-bold text-[13px]">{s.start}</p><p style={{ color: C.slate }} className="text-[10px]">{s.end}</p></div>
      <div style={{ background: C.cloud, width: 1 }} className="flex-shrink-0 self-stretch" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <TrackTag track={s.track} />
          <button onClick={(e) => { e.stopPropagation(); onToggleSave(s.id); }} className="flex-shrink-0"><Heart size={16} color={C.blue} fill={saved ? C.blue : "none"} /></button>
        </div>
        <p style={{ color: C.navy }} className="font-bold text-[14px] leading-snug">{s.title}</p>
        <div style={{ color: C.slate }} className="flex items-center gap-3 text-[11.5px] mt-1.5 flex-wrap">
          <span className="flex items-center gap-1"><MapPin size={11} />{s.room}</span>
          {s.speakers.length > 0 && <span className="truncate">{s.speakers.map((id) => findSpeaker(speakers, id).name).join(", ")}</span>}
        </div>
      </div>
    </button>
  );
}
function AgendaView({ itinerary, toggleSave, openSession }) {
  const { sessions: allSessions, days } = useContent();
  const [day, setDay] = useState(null);
  const [track, setTrack] = useState("All");
  const activeDay = day ?? days[0]?.day ?? 1;
  const sessions = allSessions.filter((s) => s.day === activeDay && (track === "All" || s.track === track)).sort((a, b) => a.start.localeCompare(b.start));
  const activeDayInfo = dayInfo(days, activeDay);
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AppBar title="Agenda" />
      <div style={{ borderColor: C.cloud }} className="flex gap-2 px-4 py-3 border-b overflow-x-auto flex-shrink-0">
        {days.map((d) => (
          <button key={d.day} onClick={() => setDay(d.day)} style={{ background: activeDay === d.day ? C.blue : C.bg, color: activeDay === d.day ? C.white : C.navy, borderColor: activeDay===d.day?C.blue:C.cloud }} className="border rounded-xl px-3 py-2 flex-shrink-0 text-center min-w-[64px]">
            <p className="text-[10px] font-bold uppercase" style={{ opacity: 0.85 }}>{d.label}</p>
            <p className="text-[11px] font-semibold">{(d.date || "").split(", ")[1] || d.date}</p>
          </button>
        ))}
      </div>
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto flex-shrink-0">
        {TRACKS.map((t) => <button key={t} onClick={() => setTrack(t)} style={{ background: track === t ? C.navy : C.white, color: track === t ? C.white : C.slate, borderColor: C.cloud }} className="border rounded-full px-3 py-1.5 text-[11.5px] font-semibold flex-shrink-0 whitespace-nowrap">{t}</button>)}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-1 space-y-2.5" style={{ background: C.bg }}>
        {activeDayInfo.sub && <p style={{ color: C.slate }} className="text-[11px] font-semibold uppercase tracking-wide pt-2 pb-1">{activeDayInfo.sub}</p>}
        {sessions.length === 0 && <p style={{ color: C.slate }} className="text-[13px] text-center pt-10">No sessions match this filter.</p>}
        {sessions.map((s) => <SessionCard key={s.id} s={s} saved={itinerary.includes(s.id)} onToggleSave={toggleSave} onOpen={openSession} />)}
      </div>
    </div>
  );
}
function SessionDetail({ session, itinerary, toggleSave, onClose, onOpenSpeaker, goLive }) {
  const { speakers, days } = useContent();
  if (!session) return null;
  const saved = itinerary.includes(session.id);
  return (
    <div className="absolute inset-0 bg-white flex flex-col z-20">
      <AppBar title="Session" onBack={onClose} />
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <TrackTag track={session.track} size="md" />
        <h1 style={{ color: C.navy }} className="font-bold text-[20px] leading-snug mt-3">{session.title}</h1>
        <div style={{ color: C.slate }} className="flex flex-col gap-1.5 mt-3 text-[13px]">
          <span className="flex items-center gap-2"><Clock size={14} />{dayInfo(days, session.day).date} · {session.start}–{session.end} (Istanbul time)</span>
          <span className="flex items-center gap-2"><MapPin size={14} />{session.room}, Istanbul Congress Center</span>
        </div>
        <button onClick={() => toggleSave(session.id)} style={{ background: saved ? C.blue : C.white, borderColor: C.blue, color: saved ? C.white : C.blue }} className="mt-4 border rounded-xl py-2.5 px-4 font-semibold text-[13px] flex items-center gap-2">
          <Heart size={15} fill={saved ? C.white : "none"} /> {saved ? "Saved to My Agenda" : "Add to My Agenda"}
        </button>
        <p style={{ color: C.navy }} className="text-[14px] leading-relaxed mt-5">{session.desc}</p>
        {session.speakers.length > 0 && (
          <div className="mt-6">
            <Eyebrow color={C.slate}>Speakers</Eyebrow>
            <div className="mt-3 space-y-2.5">
              {session.speakers.map((id) => {
                const sp = findSpeaker(speakers, id);
                return (
                  <button key={id} onClick={() => onOpenSpeaker(sp)} style={{ borderColor: C.cloud }} className="w-full border rounded-xl p-3 flex items-center gap-3 text-left">
                    <Avatar initials={sp.initials} color={sp.color} />
                    <div className="min-w-0"><p style={{ color: C.navy }} className="font-semibold text-[13.5px]">{sp.name}</p><p style={{ color: C.slate }} className="text-[12px] truncate">{sp.title}, {sp.company}</p></div>
                    <ChevronRight size={15} color={C.slate} className="ml-auto flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {session.track !== "Social" && (
          <button onClick={() => goLive(session)} style={{ borderColor: C.cloud }} className="mt-6 w-full border rounded-xl p-3.5 flex items-center gap-3 text-left">
            <div style={{ background: "#C0342C15" }} className="rounded-full p-2"><Radio size={15} color="#C0342C" /></div>
            <div><p style={{ color: C.navy }} className="font-semibold text-[13px]">Open Live Polls & Q&A</p><p style={{ color: C.slate }} className="text-[11.5px]">Vote and ask questions for this session</p></div>
            <ChevronRight size={15} color={C.slate} className="ml-auto flex-shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}
function SpeakerDetail({ sp, onClose, onOpenSession }) {
  const { sessions, days } = useContent();
  if (!sp) return null;
  const theirSessions = sessions.filter((s) => s.speakers.includes(sp.id));
  return (
    <div className="absolute inset-0 bg-white flex flex-col z-30">
      <AppBar title="Speaker" onBack={onClose} />
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="flex items-center gap-4">
          <Avatar initials={sp.initials} color={sp.color} size={58} />
          <div><p style={{ color: C.navy }} className="font-bold text-[17px] leading-tight">{sp.name}</p><p style={{ color: C.slate }} className="text-[13px] mt-0.5">{sp.title}</p><p style={{ color: C.slate }} className="text-[13px] flex items-center gap-1"><Building2 size={12} />{sp.company}</p></div>
        </div>
        <p style={{ color: C.navy }} className="text-[14px] leading-relaxed mt-5">{sp.bio}</p>
        <div className="mt-6">
          <Eyebrow color={C.slate}>Sessions</Eyebrow>
          <div className="mt-3 space-y-2.5">
            {theirSessions.map((s) => (
              <button key={s.id} onClick={() => onOpenSession(s)} style={{ borderColor: C.cloud }} className="w-full border rounded-xl p-3 text-left">
                <TrackTag track={s.track} /><p style={{ color: C.navy }} className="font-semibold text-[13.5px] mt-1.5">{s.title}</p><p style={{ color: C.slate }} className="text-[11.5px] mt-1">{dayInfo(days, s.day).date} · {s.start}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function ItineraryView({ itinerary, toggleSave, openSession }) {
  const { sessions, days } = useContent();
  const items = sessions.filter((s) => itinerary.includes(s.id)).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const byDay = {};
  items.forEach((s) => { (byDay[s.day] = byDay[s.day] || []).push(s); });
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AppBar title="My Agenda" />
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ background: C.bg }}>
        {items.length === 0 ? (
          <div className="text-center pt-16 px-6">
            <div style={{ background: C.blue + "15" }} className="inline-flex rounded-full p-4 mb-3"><Heart size={22} color={C.blue} /></div>
            <p style={{ color: C.navy }} className="font-semibold text-[14px]">Nothing saved yet</p>
            <p style={{ color: C.slate }} className="text-[13px] mt-1">Browse the agenda and tap the heart on any session to build your personal schedule.</p>
          </div>
        ) : (
          Object.keys(byDay).sort().map((d) => (
            <div key={d} className="mb-5">
              <Eyebrow color={C.slate}>{dayInfo(days, Number(d)).label} · {dayInfo(days, Number(d)).date}</Eyebrow>
              <div className="mt-2 space-y-2.5">{byDay[d].map((s) => <SessionCard key={s.id} s={s} saved={true} onToggleSave={toggleSave} onOpen={openSession} />)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  LIVE: POLLS & Q&A                                                       */
/* ---------------------------------------------------------------------- */
function LiveView({ user }) {
  const { sessions, days } = useContent();
  const liveSessions = sessions.filter((s) => s.track !== "Social");
  const [sessionId, setSessionId] = useState(null);
  const [poll, setPoll] = useState(null);
  const [qa, setQa] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const activeSessionId = sessionId ?? liveSessions[0]?.id ?? "";

  const load = useCallback(async () => {
    if (!activeSessionId) { setLoading(false); return; }
    setLoading(true);
    const [p, q] = await Promise.all([api.getPoll(activeSessionId), api.getQuestions(activeSessionId)]);
    setPoll(p || { question: "Organizers haven't opened a poll for this session yet.", options: [], voters: [] });
    setQa(q);
    setLoading(false);
  }, [activeSessionId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!activeSessionId) return;
    const unsubVotes = api.subscribePollVotes(activeSessionId, load);
    const unsubQa = api.subscribeQuestions(activeSessionId, load);
    return () => { unsubVotes(); unsubQa(); };
  }, [activeSessionId, load]);

  const vote = async (optId) => {
    if (poll.voters.includes(user.email)) return;
    try { await api.castVote(activeSessionId, user.email, optId); await load(); } catch {}
  };
  const submitQuestion = async () => {
    if (!question.trim()) return;
    await api.postQuestion(activeSessionId, user.email, user.name, question.trim());
    setQuestion("");
    await load();
  };
  const upvote = async (id) => { await api.upvoteQuestion(id, user.email); await load(); };

  const totalVotes = poll ? poll.options.reduce((a, o) => a + o.votes, 0) : 0;
  const hasVoted = poll && poll.voters.includes(user.email);
  const sortedQa = [...qa].sort((a, b) => b.upvotes.length - a.upvotes.length);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AppBar title="Live: Polls & Q&A" />
      <div style={{ borderColor: C.cloud }} className="px-4 py-3 border-b flex-shrink-0">
        <select value={activeSessionId} onChange={(e) => setSessionId(e.target.value)} style={{ borderColor: C.cloud, color: C.navy }} className="w-full border rounded-xl px-3 py-2.5 text-[13px] font-medium">
          {liveSessions.map((s) => <option key={s.id} value={s.id}>{dayInfo(days, s.day).label} · {s.start} — {s.title}</option>)}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5" style={{ background: C.bg }}>
        {loading ? <p style={{ color: C.slate }} className="text-[13px] text-center pt-8">Loading…</p> : (
          <>
            <div style={{ borderColor: C.cloud }} className="bg-white border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2.5"><BarChart3 size={15} color={C.blue} /><p style={{ color: C.slate }} className="text-[10.5px] font-bold uppercase tracking-wide">Live poll</p></div>
              <p style={{ color: C.navy }} className="font-semibold text-[14px] mb-3">{poll.question}</p>
              <div className="space-y-2">
                {poll.options.map((o) => {
                  const pct = totalVotes > 0 ? Math.round((o.votes / totalVotes) * 100) : 0;
                  return (
                    <button key={o.id} disabled={hasVoted} onClick={() => vote(o.id)} style={{ borderColor: C.cloud }} className="w-full border rounded-xl p-2.5 relative overflow-hidden text-left">
                      {hasVoted && <div style={{ background: C.blue + "18", width: `${pct}%` }} className="absolute inset-y-0 left-0 transition-all" />}
                      <div className="relative flex items-center justify-between gap-2">
                        <span style={{ color: C.navy }} className="text-[13px] font-medium">{o.label}</span>
                        {hasVoted && <span style={{ color: C.blue }} className="text-[12px] font-bold flex-shrink-0">{pct}%</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              {hasVoted && <p style={{ color: C.slate }} className="text-[11px] mt-2.5">{totalVotes} vote{totalVotes !== 1 ? "s" : ""} so far</p>}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2.5 px-1"><Sparkles size={15} color={C.blue} /><p style={{ color: C.slate }} className="text-[10.5px] font-bold uppercase tracking-wide">Ask the speakers</p></div>
              <div className="flex gap-2 mb-3">
                <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your question…" style={{ borderColor: C.cloud }} className="flex-1 border rounded-xl px-3.5 py-2.5 text-[13px] outline-none bg-white" onKeyDown={(e) => e.key === "Enter" && submitQuestion()} />
                <button onClick={submitQuestion} style={{ background: C.blue }} className="rounded-xl px-3.5 flex items-center justify-center flex-shrink-0"><Send size={16} color={C.white} /></button>
              </div>
              <div className="space-y-2">
                {sortedQa.length === 0 && <p style={{ color: C.slate }} className="text-[12.5px] text-center py-6">No questions yet — be the first to ask.</p>}
                {sortedQa.map((q) => (
                  <div key={q.id} style={{ borderColor: C.cloud }} className="bg-white border rounded-xl p-3 flex items-start gap-3">
                    <div className="min-w-0 flex-1"><p style={{ color: C.navy }} className="text-[13px] leading-snug">{q.question}</p><p style={{ color: C.slate }} className="text-[11px] mt-1">{q.attendee_name}</p></div>
                    <button onClick={() => upvote(q.id)} className="flex flex-col items-center flex-shrink-0 gap-0.5">
                      <ThumbsUp size={14} color={q.upvotes.includes(user.email) ? C.blue : C.slate} fill={q.upvotes.includes(user.email) ? C.blue : "none"} />
                      <span style={{ color: C.slate }} className="text-[10.5px] font-semibold">{q.upvotes.length}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  SPEAKERS DIRECTORY                                                      */
/* ---------------------------------------------------------------------- */
function SpeakersView({ onOpenSpeaker }) {
  const { speakers } = useContent();
  const [q, setQ] = useState("");
  const list = speakers.filter((s) => (s.name + s.company + s.title).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AppBar title="Speakers" />
      <div style={{ borderColor: C.cloud }} className="px-4 py-3 border-b flex-shrink-0 flex items-center gap-2">
        <Search size={15} color={C.slate} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search speakers…" className="flex-1 text-[13px] outline-none" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5" style={{ background: C.bg }}>
        {list.map((sp) => (
          <button key={sp.id} onClick={() => onOpenSpeaker(sp)} style={{ borderColor: C.cloud }} className="w-full bg-white border rounded-2xl p-3.5 flex items-center gap-3 text-left">
            <Avatar initials={sp.initials} color={sp.color} size={46} />
            <div className="min-w-0"><p style={{ color: C.navy }} className="font-semibold text-[14px]">{sp.name}</p><p style={{ color: C.slate }} className="text-[12px] truncate">{sp.title}, {sp.company}</p></div>
            <ChevronRight size={16} color={C.slate} className="ml-auto flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  NETWORK                                                                 */
/* ---------------------------------------------------------------------- */
function NetworkView({ user }) {
  const [attendees, setAttendees] = useState([]);
  const [connections, setConnections] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [people, conns] = await Promise.all([api.getAllAttendees(), api.getConnections(user.email)]);
      setAttendees(people);
      setConnections(conns);
      setLoading(false);
    })();
  }, [user.email]);

  const toggleConnect = async (email) => {
    const isConnected = connections.includes(email);
    setConnections(isConnected ? connections.filter((e) => e !== email) : [...connections, email]);
    await api.toggleConnection(user.email, email, isConnected);
  };

  const list = attendees.filter((a) => a.email !== user.email && (a.name + (a.company||"") + (a.title||"")).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AppBar title="Network" />
      <div style={{ borderColor: C.cloud }} className="px-4 py-3 border-b flex-shrink-0 flex items-center gap-2">
        <Search size={15} color={C.slate} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search delegates or companies…" className="flex-1 text-[13px] outline-none" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5" style={{ background: C.bg }}>
        {loading && <p style={{ color: C.slate }} className="text-[13px] text-center pt-8">Loading directory…</p>}
        {!loading && list.length === 0 && <p style={{ color: C.slate }} className="text-[13px] text-center pt-8">No delegates match your search.</p>}
        {list.map((a) => {
          const connected = connections.includes(a.email);
          const initials = a.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
          return (
            <div key={a.email} style={{ borderColor: C.cloud }} className="bg-white border rounded-2xl p-3.5 flex items-center gap-3">
              <Avatar initials={initials} color={C.slate} size={44} />
              <div className="min-w-0 flex-1"><p style={{ color: C.navy }} className="font-semibold text-[13.5px]">{a.name}</p><p style={{ color: C.slate }} className="text-[11.5px] truncate flex items-center gap-1"><Briefcase size={10} />{a.title || "Delegate"} · {a.company || "—"}</p></div>
              <button onClick={() => toggleConnect(a.email)} style={{ background: connected ? C.bg : C.blue, color: connected ? C.blue : C.white, borderColor: C.blue }} className="border rounded-lg px-3 py-1.5 text-[11.5px] font-semibold flex-shrink-0 flex items-center gap-1">
                {connected ? <><Check size={12} /> Connected</> : <><Plus size={12} /> Connect</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  VENUE & MAP                                                             */
/* ---------------------------------------------------------------------- */
function VenueView() {
  const { venueSpots, eventConfig } = useContent();
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AppBar title="Venue & Map" />
      <div className="flex-1 overflow-y-auto" style={{ background: C.bg }}>
        <div className="relative overflow-hidden mx-4 mt-4 rounded-2xl" style={{ background: C.navy, height: 150 }}>
          <WorldArcBg />
          <div className="relative h-full flex flex-col justify-end p-4">
            <p style={{ color: C.white }} className="font-bold text-[15px]">{eventConfig.hotelName || ""}</p>
            <p style={{ color: "#B9C4D6" }} className="text-[12px]">{eventConfig.hotelAddress || ""}</p>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventConfig.mapQuery || eventConfig.hotelName || "")}`} target="_blank" rel="noopener noreferrer" style={{ background: C.blue }} className="mt-2.5 self-start text-white text-[11.5px] font-semibold rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <Navigation size={12} /> Open in Maps
            </a>
          </div>
        </div>
        <div className="px-4 py-5 space-y-3">
          {venueSpots.map((s) => {
            const Icon = VENUE_ICONS[s.iconKey] || MapPin;
            return (
              <div key={s.id} style={{ borderColor: C.cloud }} className="bg-white border rounded-2xl p-4 flex gap-3">
                <div style={{ background: C.blue + "15" }} className="rounded-full p-2.5 flex-shrink-0 h-fit"><Icon size={16} color={C.blue} /></div>
                <div className="min-w-0"><p style={{ color: C.navy }} className="font-semibold text-[13.5px]">{s.title}</p><p style={{ color: C.blue }} className="text-[11px] font-semibold mt-0.5">{s.sub}</p><p style={{ color: C.slate }} className="text-[12.5px] mt-1.5 leading-relaxed">{s.detail}</p></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  ANNOUNCEMENTS                                                           */
/* ---------------------------------------------------------------------- */
/* ---------------------------------------------------------------------- */
/*  BUILDER SHARED PIECES — a slide-up form sheet, used by all 3 builders */
/* ---------------------------------------------------------------------- */
function BuilderSheet({ title, onClose, onDelete, deleteLabel, children }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-[24px] flex flex-col overflow-hidden" style={{ maxHeight: "92%" }}>
        <div style={{ borderColor: C.cloud }} className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <h2 style={{ color: C.navy }} className="font-bold text-[16px]">{title}</h2>
          <button onClick={onClose}><X size={20} color={C.slate} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {onDelete && (
          <div style={{ borderColor: C.cloud }} className="border-t px-5 py-3 flex-shrink-0">
            <button onClick={onDelete} className="w-full text-center py-2 text-[13px] font-semibold" style={{ color: "#C0342C" }}>
              {deleteLabel || "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div className="mb-3.5">
      <label style={{ color: C.slate }} className="text-[11px] font-semibold uppercase tracking-wide mb-1 block">{label}</label>
      {children}
    </div>
  );
}
const inputCls = "w-full border rounded-xl px-3.5 py-2.5 text-[14px] outline-none";
const inputStyle = { borderColor: C.cloud };

/* ---------------------------------------------------------------------- */
/*  AGENDA BUILDER                                                          */
/* ---------------------------------------------------------------------- */
function SessionForm({ session, days, speakers, onClose, onSaved }) {
  const isNew = !session;
  const [form, setForm] = useState(() => session ? {
    id: session.id, day: session.day, date: session.date, start: session.start, end: session.end,
    track: session.track, title: session.title, room: session.room,
    speaker1: session.speakers[0] || "", speaker2: session.speakers[1] || "", speaker3: session.speakers[2] || "",
    desc: session.desc,
  } : {
    id: "", day: days[0]?.day || 1, date: days[0]?.date || "", start: "", end: "",
    track: TRACKS[1], title: "", room: "", speaker1: "", speaker2: "", speaker3: "", desc: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.id.trim() || !form.title.trim()) { setError("Session ID and title are required."); return; }
    setSaving(true);
    try {
      const speakerIds = [form.speaker1, form.speaker2, form.speaker3].filter(Boolean);
      await api.upsertSession(form.id.trim(), {
        day: Number(form.day), date: form.date, start: form.start, end: form.end,
        track: form.track, title: form.title.trim(), room: form.room.trim(),
        speakers: speakerIds, desc: form.desc.trim(),
      });
      onSaved();
    } catch (e) {
      setError("Couldn't save — try again.");
    }
    setSaving(false);
  };

  const remove = async () => {
    setSaving(true);
    try { await api.deleteSession(session.id); onSaved(); } catch { setError("Couldn't delete — try again."); setSaving(false); }
  };

  return (
    <BuilderSheet title={isNew ? "Add Session" : "Edit Session"} onClose={onClose} onDelete={isNew ? null : remove} deleteLabel="Delete session">
      <Field label="Session ID (unique, e.g. d2s06)">
        <input value={form.id} onChange={(e) => set("id", e.target.value)} disabled={!isNew} style={inputStyle} className={inputCls + (!isNew ? " opacity-60" : "")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Day">
          <select value={form.day} onChange={(e) => set("day", e.target.value)} style={inputStyle} className={inputCls}>
            {days.map((d) => <option key={d.day} value={d.day}>{d.label}</option>)}
          </select>
        </Field>
        <Field label="Date (YYYY-MM-DD)">
          <input value={form.date} onChange={(e) => set("date", e.target.value)} placeholder="2027-01-25" style={inputStyle} className={inputCls} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start (HH:MM)">
          <input value={form.start} onChange={(e) => set("start", e.target.value)} placeholder="09:00" style={inputStyle} className={inputCls} />
        </Field>
        <Field label="End (HH:MM)">
          <input value={form.end} onChange={(e) => set("end", e.target.value)} placeholder="10:00" style={inputStyle} className={inputCls} />
        </Field>
      </div>
      <Field label="Track">
        <select value={form.track} onChange={(e) => set("track", e.target.value)} style={inputStyle} className={inputCls}>
          {TRACKS.filter((t) => t !== "All").map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Title">
        <input value={form.title} onChange={(e) => set("title", e.target.value)} style={inputStyle} className={inputCls} />
      </Field>
      <Field label="Room">
        <input value={form.room} onChange={(e) => set("room", e.target.value)} style={inputStyle} className={inputCls} />
      </Field>
      <Field label="Speaker 1">
        <select value={form.speaker1} onChange={(e) => set("speaker1", e.target.value)} style={inputStyle} className={inputCls}>
          <option value="">—</option>
          {speakers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>
      <Field label="Speaker 2">
        <select value={form.speaker2} onChange={(e) => set("speaker2", e.target.value)} style={inputStyle} className={inputCls}>
          <option value="">—</option>
          {speakers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>
      <Field label="Speaker 3">
        <select value={form.speaker3} onChange={(e) => set("speaker3", e.target.value)} style={inputStyle} className={inputCls}>
          <option value="">—</option>
          {speakers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>
      <Field label="Description">
        <textarea value={form.desc} onChange={(e) => set("desc", e.target.value)} rows={3} style={inputStyle} className={inputCls + " resize-none"} />
      </Field>
      {error && <p style={{ color: "#C0342C" }} className="text-[12px] mb-2">{error}</p>}
      <button onClick={save} disabled={saving} style={{ background: C.blue }} className="w-full text-white rounded-xl py-3 font-semibold text-[14px] disabled:opacity-60 mt-1">
        {saving ? "Saving…" : "Save session"}
      </button>
    </BuilderSheet>
  );
}

function DayForm({ day, onClose, onSaved }) {
  const isNew = !day;
  const [form, setForm] = useState(day ? { day: day.day, date: day.date, label: day.label, sub: day.sub || "" } : { day: "", date: "", label: "", sub: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.day || !form.label.trim()) { setError("Day number and label are required."); return; }
    setSaving(true);
    try {
      await api.upsertDay(Number(form.day), { date: form.date, label: form.label.trim(), sub: form.sub.trim() });
      onSaved();
    } catch { setError("Couldn't save — try again."); }
    setSaving(false);
  };
  const remove = async () => {
    setSaving(true);
    try { await api.deleteDay(day.day); onSaved(); } catch { setError("Couldn't delete — try again."); setSaving(false); }
  };

  return (
    <BuilderSheet title={isNew ? "Add Day" : "Edit Day"} onClose={onClose} onDelete={isNew ? null : remove} deleteLabel="Delete day">
      <Field label="Day number">
        <input type="number" value={form.day} onChange={(e) => set("day", e.target.value)} disabled={!isNew} style={inputStyle} className={inputCls + (!isNew ? " opacity-60" : "")} />
      </Field>
      <Field label="Date (YYYY-MM-DD)">
        <input value={form.date} onChange={(e) => set("date", e.target.value)} placeholder="2027-01-25" style={inputStyle} className={inputCls} />
      </Field>
      <Field label="Label (shown on the day tab)">
        <input value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="Mon, Jan 25" style={inputStyle} className={inputCls} />
      </Field>
      <Field label="Sub-label (optional, e.g. Arrivals)">
        <input value={form.sub} onChange={(e) => set("sub", e.target.value)} style={inputStyle} className={inputCls} />
      </Field>
      {error && <p style={{ color: "#C0342C" }} className="text-[12px] mb-2">{error}</p>}
      <button onClick={save} disabled={saving} style={{ background: C.blue }} className="w-full text-white rounded-xl py-3 font-semibold text-[14px] disabled:opacity-60 mt-1">
        {saving ? "Saving…" : "Save day"}
      </button>
    </BuilderSheet>
  );
}

function AgendaBuilderView({ user }) {
  const { sessions, speakers, days } = useContent();
  const [editingSession, setEditingSession] = useState(undefined); // undefined = closed, null = new, object = edit
  const [editingDay, setEditingDay] = useState(undefined);

  if (!user.isOrganizer) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <AppBar title="Agenda Builder" />
        <div className="flex-1 flex items-center justify-center px-6"><p style={{ color: C.slate }} className="text-[13px] text-center">Organizer access only.</p></div>
      </div>
    );
  }

  const sorted = [...sessions].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <AppBar title="Agenda Builder" />
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ background: C.bg }}>
        <div className="flex items-center justify-between mb-2 px-1">
          <Eyebrow color={C.slate}>Days</Eyebrow>
          <button onClick={() => setEditingDay(null)} style={{ color: C.blue }} className="text-[12px] font-semibold flex items-center gap-1"><Plus size={13} /> Add day</button>
        </div>
        <div className="space-y-2 mb-5">
          {days.map((d) => (
            <button key={d.day} onClick={() => setEditingDay(d)} style={{ borderColor: C.cloud }} className="w-full bg-white border rounded-xl px-3.5 py-2.5 flex items-center justify-between text-left">
              <div className="min-w-0"><p style={{ color: C.navy }} className="text-[13px] font-semibold">{d.label} — {d.date}</p>{d.sub && <p style={{ color: C.slate }} className="text-[11.5px]">{d.sub}</p>}</div>
              <Edit3 size={14} color={C.slate} className="flex-shrink-0" />
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-2 px-1">
          <Eyebrow color={C.slate}>Sessions ({sorted.length})</Eyebrow>
          <button onClick={() => setEditingSession(null)} style={{ color: C.blue }} className="text-[12px] font-semibold flex items-center gap-1"><Plus size={13} /> Add session</button>
        </div>
        <div className="space-y-2">
          {sorted.map((s) => (
            <button key={s.id} onClick={() => setEditingSession(s)} style={{ borderColor: C.cloud }} className="w-full bg-white border rounded-xl p-3.5 text-left">
              <div className="flex items-center gap-2 mb-1"><TrackTag track={s.track} /><span style={{ color: C.slate }} className="text-[11px]">{dayInfo(days, s.day).label} · {s.start}</span></div>
              <p style={{ color: C.navy }} className="text-[13px] font-semibold truncate">{s.title}</p>
            </button>
          ))}
        </div>
      </div>
      {editingSession !== undefined && (
        <SessionForm session={editingSession} days={days} speakers={speakers} onClose={() => setEditingSession(undefined)} onSaved={() => setEditingSession(undefined)} />
      )}
      {editingDay !== undefined && (
        <DayForm day={editingDay} onClose={() => setEditingDay(undefined)} onSaved={() => setEditingDay(undefined)} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  SPEAKER BUILDER                                                         */
/* ---------------------------------------------------------------------- */
function SpeakerForm({ speaker, onClose, onSaved }) {
  const isNew = !speaker;
  const [form, setForm] = useState(speaker ? {
    id: speaker.id, name: speaker.name, title: speaker.title, company: speaker.company, color: speaker.color, bio: speaker.bio,
  } : { id: "", name: "", title: "", company: "RIB", color: "#0064B1", bio: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.id.trim() || !form.name.trim()) { setError("Speaker ID and name are required."); return; }
    setSaving(true);
    try {
      const initials = form.name.trim().split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
      await api.upsertSpeaker(form.id.trim(), {
        name: form.name.trim(), title: form.title.trim(), company: form.company.trim(), color: form.color, initials, bio: form.bio.trim(),
      });
      onSaved();
    } catch { setError("Couldn't save — try again."); }
    setSaving(false);
  };
  const remove = async () => {
    setSaving(true);
    try { await api.deleteSpeaker(speaker.id); onSaved(); } catch { setError("Couldn't delete — try again."); setSaving(false); }
  };

  return (
    <BuilderSheet title={isNew ? "Add Speaker" : "Edit Speaker"} onClose={onClose} onDelete={isNew ? null : remove} deleteLabel="Delete speaker">
      <Field label="Speaker ID (unique, e.g. jsmith)">
        <input value={form.id} onChange={(e) => set("id", e.target.value)} disabled={!isNew} style={inputStyle} className={inputCls + (!isNew ? " opacity-60" : "")} />
      </Field>
      <Field label="Full name"><input value={form.name} onChange={(e) => set("name", e.target.value)} style={inputStyle} className={inputCls} /></Field>
      <Field label="Title"><input value={form.title} onChange={(e) => set("title", e.target.value)} style={inputStyle} className={inputCls} /></Field>
      <Field label="Company"><input value={form.company} onChange={(e) => set("company", e.target.value)} style={inputStyle} className={inputCls} /></Field>
      <Field label="Avatar color">
        <div className="flex items-center gap-2">
          <input type="color" value={form.color} onChange={(e) => set("color", e.target.value)} style={{ width: 44, height: 40, borderColor: C.cloud }} className="border rounded-lg" />
          <input value={form.color} onChange={(e) => set("color", e.target.value)} style={inputStyle} className={inputCls} />
        </div>
      </Field>
      <Field label="Bio"><textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={4} style={inputStyle} className={inputCls + " resize-none"} /></Field>
      {error && <p style={{ color: "#C0342C" }} className="text-[12px] mb-2">{error}</p>}
      <button onClick={save} disabled={saving} style={{ background: C.blue }} className="w-full text-white rounded-xl py-3 font-semibold text-[14px] disabled:opacity-60 mt-1">
        {saving ? "Saving…" : "Save speaker"}
      </button>
    </BuilderSheet>
  );
}

function SpeakerBuilderView({ user }) {
  const { speakers } = useContent();
  const [editing, setEditing] = useState(undefined);

  if (!user.isOrganizer) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <AppBar title="Speaker Builder" />
        <div className="flex-1 flex items-center justify-center px-6"><p style={{ color: C.slate }} className="text-[13px] text-center">Organizer access only.</p></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <AppBar title="Speaker Builder" right={<button onClick={() => setEditing(null)} style={{ color: C.blue }} className="text-[12px] font-semibold flex items-center gap-1"><Plus size={13} /> Add</button>} />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5" style={{ background: C.bg }}>
        {speakers.map((sp) => (
          <button key={sp.id} onClick={() => setEditing(sp)} style={{ borderColor: C.cloud }} className="w-full bg-white border rounded-2xl p-3.5 flex items-center gap-3 text-left">
            <Avatar initials={sp.initials} color={sp.color} size={44} />
            <div className="min-w-0 flex-1"><p style={{ color: C.navy }} className="font-semibold text-[14px]">{sp.name}</p><p style={{ color: C.slate }} className="text-[12px] truncate">{sp.title}{sp.title && sp.company ? ", " : ""}{sp.company}</p></div>
            <Edit3 size={14} color={C.slate} className="flex-shrink-0" />
          </button>
        ))}
      </div>
      {editing !== undefined && <SpeakerForm speaker={editing} onClose={() => setEditing(undefined)} onSaved={() => setEditing(undefined)} />}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  VENUE BUILDER                                                           */
/* ---------------------------------------------------------------------- */
function VenueSpotForm({ spot, onClose, onSaved }) {
  const isNew = !spot;
  const [form, setForm] = useState(spot ? { id: spot.id, iconKey: spot.iconKey, title: spot.title, sub: spot.sub, detail: spot.detail } : { id: "", iconKey: "map", title: "", sub: "", detail: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    try {
      await api.upsertVenueSpot(form.id || null, { iconKey: form.iconKey, title: form.title.trim(), sub: form.sub.trim(), detail: form.detail.trim() });
      onSaved();
    } catch { setError("Couldn't save — try again."); }
    setSaving(false);
  };
  const remove = async () => {
    setSaving(true);
    try { await api.deleteVenueSpot(spot.id); onSaved(); } catch { setError("Couldn't delete — try again."); setSaving(false); }
  };

  return (
    <BuilderSheet title={isNew ? "Add Location" : "Edit Location"} onClose={onClose} onDelete={isNew ? null : remove} deleteLabel="Delete location">
      <Field label="Icon">
        <select value={form.iconKey} onChange={(e) => set("iconKey", e.target.value)} style={inputStyle} className={inputCls}>
          {VENUE_ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </Field>
      <Field label="Title"><input value={form.title} onChange={(e) => set("title", e.target.value)} style={inputStyle} className={inputCls} /></Field>
      <Field label="Subtitle (shown in blue)"><input value={form.sub} onChange={(e) => set("sub", e.target.value)} style={inputStyle} className={inputCls} /></Field>
      <Field label="Detail"><textarea value={form.detail} onChange={(e) => set("detail", e.target.value)} rows={3} style={inputStyle} className={inputCls + " resize-none"} /></Field>
      {error && <p style={{ color: "#C0342C" }} className="text-[12px] mb-2">{error}</p>}
      <button onClick={save} disabled={saving} style={{ background: C.blue }} className="w-full text-white rounded-xl py-3 font-semibold text-[14px] disabled:opacity-60 mt-1">
        {saving ? "Saving…" : "Save location"}
      </button>
    </BuilderSheet>
  );
}

function VenueBuilderView({ user }) {
  const { venueSpots, eventConfig } = useContent();
  const [editing, setEditing] = useState(undefined);
  const [hotel, setHotel] = useState({ hotelName: eventConfig.hotelName || "", hotelAddress: eventConfig.hotelAddress || "", mapQuery: eventConfig.mapQuery || "" });
  const [savingHotel, setSavingHotel] = useState(false);

  useEffect(() => {
    setHotel({ hotelName: eventConfig.hotelName || "", hotelAddress: eventConfig.hotelAddress || "", mapQuery: eventConfig.mapQuery || "" });
  }, [eventConfig.hotelName, eventConfig.hotelAddress, eventConfig.mapQuery]);

  if (!user.isOrganizer) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <AppBar title="Venue Builder" />
        <div className="flex-1 flex items-center justify-center px-6"><p style={{ color: C.slate }} className="text-[13px] text-center">Organizer access only.</p></div>
      </div>
    );
  }

  const saveHotel = async () => {
    setSavingHotel(true);
    try { await api.updateEventConfig(hotel); } catch {}
    setSavingHotel(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <AppBar title="Venue Builder" />
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ background: C.bg }}>
        <div style={{ borderColor: C.blue }} className="bg-white border-2 rounded-2xl p-3.5 mb-5">
          <p style={{ color: C.blue }} className="text-[10.5px] font-bold uppercase tracking-wide mb-2">Main venue</p>
          <Field label="Hotel name"><input value={hotel.hotelName} onChange={(e) => setHotel({ ...hotel, hotelName: e.target.value })} style={inputStyle} className={inputCls} /></Field>
          <Field label="Address"><input value={hotel.hotelAddress} onChange={(e) => setHotel({ ...hotel, hotelAddress: e.target.value })} style={inputStyle} className={inputCls} /></Field>
          <Field label="Map search query"><input value={hotel.mapQuery} onChange={(e) => setHotel({ ...hotel, mapQuery: e.target.value })} style={inputStyle} className={inputCls} /></Field>
          <button onClick={saveHotel} disabled={savingHotel} style={{ background: C.blue }} className="text-white text-[12.5px] font-semibold rounded-lg px-3.5 py-2">{savingHotel ? "Saving…" : "Save venue info"}</button>
        </div>

        <div className="flex items-center justify-between mb-2 px-1">
          <Eyebrow color={C.slate}>Location cards</Eyebrow>
          <button onClick={() => setEditing(null)} style={{ color: C.blue }} className="text-[12px] font-semibold flex items-center gap-1"><Plus size={13} /> Add</button>
        </div>
        <div className="space-y-2">
          {venueSpots.map((s) => {
            const Icon = VENUE_ICONS[s.iconKey] || MapPin;
            return (
              <button key={s.id} onClick={() => setEditing(s)} style={{ borderColor: C.cloud }} className="w-full bg-white border rounded-xl p-3.5 flex items-center gap-3 text-left">
                <div style={{ background: C.blue + "15" }} className="rounded-full p-2 flex-shrink-0"><Icon size={15} color={C.blue} /></div>
                <div className="min-w-0 flex-1"><p style={{ color: C.navy }} className="text-[13px] font-semibold truncate">{s.title}</p><p style={{ color: C.slate }} className="text-[11.5px] truncate">{s.sub}</p></div>
                <Edit3 size={14} color={C.slate} className="flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
      {editing !== undefined && <VenueSpotForm spot={editing} onClose={() => setEditing(undefined)} onSaved={() => setEditing(undefined)} />}
    </div>
  );
}


function AnnouncementsView({ user, announcements, refresh }) {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [posting, setPosting] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const post = async () => {
    if (!title.trim() || !text.trim()) return;
    setPosting(true);
    try {
      await api.postAnnouncement({ title: title.trim(), body: text.trim(), author: user.name });
      setTitle(""); setText("");
      await refresh();
    } catch {}
    setPosting(false);
  };

  const remove = async (id) => {
    setDeletingId(id);
    try {
      await api.deleteAnnouncement(id);
      await refresh();
    } catch {}
    setDeletingId(null);
    setConfirmId(null);
  };

  const timeAgo = (ts) => {
    const mins = Math.round((Date.now() - ts) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.round(hrs / 24)}d ago`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AppBar title="Announcements" />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: C.bg }}>
        {user.isOrganizer && (
          <div style={{ borderColor: C.blue }} className="bg-white border-2 rounded-2xl p-3.5 mb-1">
            <p style={{ color: C.blue }} className="text-[10.5px] font-bold uppercase tracking-wide mb-2">Post as organizer</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={{ borderColor: C.cloud }} className="w-full border rounded-lg px-3 py-2 text-[13px] mb-2 outline-none" />
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Message" rows={2} style={{ borderColor: C.cloud }} className="w-full border rounded-lg px-3 py-2 text-[13px] mb-2 outline-none resize-none" />
            <button onClick={post} disabled={posting} style={{ background: C.blue }} className="text-white text-[12.5px] font-semibold rounded-lg px-3.5 py-2">{posting ? "Posting…" : "Post announcement"}</button>
          </div>
        )}
        {announcements.length === 0 && <p style={{ color: C.slate }} className="text-[13px] text-center pt-8">No announcements yet.</p>}
        {announcements.map((a) => (
          <div key={a.id} style={{ borderColor: confirmId === a.id ? "#C0342C" : C.cloud }} className="bg-white border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div style={{ background: C.blue + "15" }} className="rounded-full p-1.5"><Bell size={12} color={C.blue} /></div>
              <p style={{ color: C.slate }} className="text-[11px]">{a.author} · {timeAgo(a.timestamp)}</p>
              {user.isOrganizer && confirmId !== a.id && (
                <button onClick={() => setConfirmId(a.id)} className="ml-auto flex-shrink-0">
                  <Trash2 size={14} color="#C0342C" />
                </button>
              )}
            </div>
            <p style={{ color: C.navy }} className="font-bold text-[14px]">{a.title}</p>
            <p style={{ color: C.slate }} className="text-[13px] mt-1 leading-relaxed">{a.body}</p>
            {confirmId === a.id && (
              <div style={{ borderColor: C.cloud }} className="mt-3 pt-3 border-t flex items-center justify-between">
                <span style={{ color: "#C0342C" }} className="text-[12px] font-medium">Delete this announcement?</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setConfirmId(null)} style={{ color: C.slate }} className="text-[12px] font-semibold px-2 py-1">Cancel</button>
                  <button onClick={() => remove(a.id)} disabled={deletingId === a.id} style={{ background: "#C0342C" }} className="text-white text-[12px] font-semibold rounded-lg px-3 py-1.5 disabled:opacity-60">
                    {deletingId === a.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  MORE / PROFILE                                                          */
/* ---------------------------------------------------------------------- */
function MoreView({ setView, user, onLogout }) {
  const items = [
    { id: "speakers", label: "Speakers", icon: Mic2 }, { id: "network", label: "Network", icon: Users },
    { id: "venue", label: "Venue & Map", icon: MapPin }, { id: "announcements", label: "Announcements", icon: Bell },
    { id: "messages", label: "Message Organizers", icon: MessageCircle },
    ...(user.isOrganizer ? [
      { id: "agendaBuilder", label: "Agenda Builder", icon: Edit3 },
      { id: "speakerBuilder", label: "Speaker Builder", icon: Edit3 },
      { id: "venueBuilder", label: "Venue Builder", icon: Edit3 },
      { id: "allowlist", label: "Manage Allowlist", icon: Shield },
      { id: "organizers", label: "Manage Organizers", icon: Star },
      { id: "inbox", label: "Messages Inbox", icon: MessageCircle },
    ] : []),
  ];
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AppBar title="More" />
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ background: C.bg }}>
        <div style={{ borderColor: C.cloud }} className="bg-white border rounded-2xl p-4 flex items-center gap-3 mb-4">
          <Avatar initials={user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()} color={C.blue} size={46} />
          <div className="min-w-0"><p style={{ color: C.navy }} className="font-semibold text-[14px]">{user.name}</p><p style={{ color: C.slate }} className="text-[12px] truncate flex items-center gap-1"><Mail size={10} />{user.email}</p></div>
        </div>
        <div className="space-y-2">
          {items.map((it) => {
            const Icon = it.icon;
            return <button key={it.id} onClick={() => setView(it.id)} style={{ borderColor: C.cloud }} className="w-full bg-white border rounded-2xl p-3.5 flex items-center gap-3 text-left"><Icon size={17} color={C.blue} /><span style={{ color: C.navy }} className="font-semibold text-[13.5px]">{it.label}</span><ChevronRight size={16} color={C.slate} className="ml-auto" /></button>;
          })}
        </div>

        {user.isOrganizer && (
          <div style={{ borderColor: C.cloud }} className="w-full bg-white border rounded-2xl p-3.5 flex items-center gap-3 mt-4">
            <Star size={17} color={C.amber} fill={C.amber} />
            <span style={{ color: C.navy }} className="font-semibold text-[13.5px]">Organizer</span>
          </div>
        )}

        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3.5 mt-6"><LogOut size={15} color="#C0342C" /><span style={{ color: "#C0342C" }} className="font-semibold text-[13.5px]">Sign out</span></button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  DIRECT MESSAGES — attendee <-> organizers                             */
/* ---------------------------------------------------------------------- */
function MessageThread({ user, threadEmail, threadTitle, onBack, overlay }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const unsub = api.subscribeMessages(threadEmail, (msgs) => { setMessages(msgs); setLoading(false); });
    return unsub;
  }, [threadEmail]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.sendMessage(threadEmail, { senderEmail: user.email, senderName: user.name, text: text.trim() });
      setText("");
    } catch {}
    setSending(false);
  };

  return (
    <div className={overlay ? "absolute inset-0 bg-white flex flex-col z-40" : "flex-1 flex flex-col min-h-0"}>
      <AppBar title={threadTitle} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5" style={{ background: C.bg }}>
        {loading && <p style={{ color: C.slate }} className="text-[13px] text-center pt-8">Loading…</p>}
        {!loading && messages.length === 0 && (
          <p style={{ color: C.slate }} className="text-[13px] text-center pt-8">No messages yet — say hello.</p>
        )}
        {messages.map((m) => {
          const mine = m.senderEmail === user.email;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div style={{ background: mine ? C.blue : C.white, borderColor: C.cloud }} className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${mine ? "" : "border"}`}>
                {!mine && <p style={{ color: C.blue }} className="text-[10.5px] font-bold mb-0.5">{m.senderName}</p>}
                <p style={{ color: mine ? C.white : C.navy }} className="text-[13px] leading-relaxed">{m.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div style={{ borderColor: C.cloud }} className="border-t px-4 py-3 flex gap-2 flex-shrink-0 bg-white">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…"
          style={{ borderColor: C.cloud }} className="flex-1 border rounded-xl px-3.5 py-2.5 text-[13px] outline-none" onKeyDown={(e) => e.key === "Enter" && send()} />
        <button onClick={send} disabled={sending} style={{ background: C.blue }} className="rounded-xl px-3.5 flex items-center justify-center flex-shrink-0 disabled:opacity-60">
          <Send size={16} color={C.white} />
        </button>
      </div>
    </div>
  );
}

function OrganizerInboxView({ user, onOpenThread }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = api.subscribeConversations((convos) => { setConversations(convos); setLoading(false); });
    return unsub;
  }, []);

  const timeAgo = (ts) => {
    if (!ts) return "";
    const mins = Math.round((Date.now() - ts) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.round(hrs / 24)}d ago`;
  };

  if (!user.isOrganizer) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <AppBar title="Messages Inbox" />
        <div className="flex-1 flex items-center justify-center px-6">
          <p style={{ color: C.slate }} className="text-[13px] text-center">Organizer access only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AppBar title="Messages Inbox" />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" style={{ background: C.bg }}>
        {loading && <p style={{ color: C.slate }} className="text-[13px] text-center pt-8">Loading…</p>}
        {!loading && conversations.length === 0 && <p style={{ color: C.slate }} className="text-[13px] text-center pt-8">No messages yet.</p>}
        {conversations.map((c) => {
          const label = c.attendeeName || c.attendeeEmail || c.id;
          const initials = label.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
          return (
            <button key={c.id} onClick={() => onOpenThread(c.id, label)} style={{ borderColor: C.cloud }} className="w-full bg-white border rounded-2xl p-3.5 flex items-center gap-3 text-left">
              <Avatar initials={initials} color={C.slate} size={40} />
              <div className="min-w-0 flex-1">
                <p style={{ color: C.navy }} className="font-semibold text-[13.5px] truncate">{label}</p>
                <p style={{ color: C.slate }} className="text-[12px] truncate">{c.lastMessage}</p>
              </div>
              <p style={{ color: C.slate }} className="text-[10.5px] flex-shrink-0">{timeAgo(c.lastMessageAt)}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  ALLOWLIST ADMIN — who is a valid registered attendee                  */
/* ---------------------------------------------------------------------- */
function AllowlistView({ user }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setEmails(await api.getAllowedEmails());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const addEmails = async () => {
    const list = input.split(/[\n,]+/).map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@"));
    if (list.length === 0) return;
    setAdding(true);
    await api.addAllowedEmails(list);
    setInput("");
    setMsg(`Added ${list.length} email${list.length !== 1 ? "s" : ""}. Note: this doesn't create their sign-in account — run bulk_create_attendees.js for that.`);
    await load();
    setAdding(false);
  };

  const remove = async (email) => {
    await api.removeAllowedEmail(email);
    setEmails(emails.filter((e) => e !== email));
  };

  if (!user.isOrganizer) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <AppBar title="Manage Allowlist" />
        <div className="flex-1 flex items-center justify-center px-6">
          <p style={{ color: C.slate }} className="text-[13px] text-center">Organizer access only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AppBar title="Manage Allowlist" />
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ background: C.bg }}>
        <div style={{ borderColor: C.blue }} className="bg-white border-2 rounded-2xl p-3.5 mb-4">
          <p style={{ color: C.blue }} className="text-[10.5px] font-bold uppercase tracking-wide mb-2">Add approved emails</p>
          <p style={{ color: C.slate }} className="text-[11.5px] mb-2">This list is a record of who's registered. To actually create someone's sign-in account and password, use bulk_create_attendees.js — this panel alone won't let them sign in.</p>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4}
            placeholder={"jordan@company.com\npriya@company.com"}
            style={{ borderColor: C.cloud }} className="w-full border rounded-lg px-3 py-2 text-[13px] mb-2 outline-none resize-none" />
          <button onClick={addEmails} disabled={adding} style={{ background: C.blue }} className="text-white text-[12.5px] font-semibold rounded-lg px-3.5 py-2">
            {adding ? "Adding…" : "Add to allowlist"}
          </button>
          {msg && <p style={{ color: C.green }} className="text-[11.5px] mt-2">{msg}</p>}
        </div>

        <p style={{ color: C.slate }} className="text-[11px] font-semibold uppercase tracking-wide mb-2 px-1">
          {loading ? "Loading…" : `${emails.length} approved email${emails.length !== 1 ? "s" : ""}`}
        </p>
        <div className="space-y-1.5">
          {emails.map((e) => (
            <div key={e} style={{ borderColor: C.cloud }} className="bg-white border rounded-xl px-3.5 py-2.5 flex items-center justify-between">
              <span style={{ color: C.navy }} className="text-[12.5px]">{e}</span>
              <button onClick={() => remove(e)} style={{ color: "#C0342C" }} className="text-[11px] font-semibold">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  ORGANIZER ADMIN — who can act as an organizer                         */
/* ---------------------------------------------------------------------- */
function ManageOrganizersView({ user, onSelfChange }) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    setAttendees(await api.getAllAttendees());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (email, current) => {
    await api.setOrganizer(email, !current);
    if (email === user.email) onSelfChange(!current);
    await load();
  };

  if (!user.isOrganizer) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <AppBar title="Manage Organizers" />
        <div className="flex-1 flex items-center justify-center px-6">
          <p style={{ color: C.slate }} className="text-[13px] text-center">Organizer access only.</p>
        </div>
      </div>
    );
  }

  const list = attendees.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()) || a.email.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AppBar title="Manage Organizers" />
      <div style={{ borderColor: C.cloud }} className="px-4 py-3 border-b flex-shrink-0 flex items-center gap-2">
        <Search size={15} color={C.slate} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search delegates…" className="flex-1 text-[13px] outline-none" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" style={{ background: C.bg }}>
        {loading && <p style={{ color: C.slate }} className="text-[13px] text-center pt-8">Loading…</p>}
        {!loading && list.map((a) => (
          <div key={a.email} style={{ borderColor: C.cloud }} className="bg-white border rounded-xl px-3.5 py-2.5 flex items-center justify-between">
            <div className="min-w-0">
              <p style={{ color: C.navy }} className="text-[13px] font-medium truncate">{a.name}</p>
              <p style={{ color: C.slate }} className="text-[11px] truncate">{a.email}</p>
            </div>
            <button onClick={() => toggle(a.email, a.isOrganizer)}
              style={{ background: a.isOrganizer ? C.amber : C.bg, color: a.isOrganizer ? C.white : C.slate, borderColor: a.isOrganizer ? C.amber : C.cloud }}
              className="border rounded-lg px-3 py-1.5 text-[11.5px] font-semibold flex-shrink-0">
              {a.isOrganizer ? "Organizer" : "Make organizer"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  ROOT APP                                                                */
/* ---------------------------------------------------------------------- */
export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [view, setView] = useState("home");
  const [itinerary, setItinerary] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);

  // Content — sessions, speakers, days, venue spots, and event config all
  // live in Firestore and update in real time, so Builder edits show up
  // immediately for everyone with the app open.
  const [sessions, setSessions] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [days, setDays] = useState([]);
  const [venueSpots, setVenueSpots] = useState([]);
  const [eventConfig, setEventConfig] = useState({});
  const [contentLoading, setContentLoading] = useState(true);

  const loadProfile = useCallback(async (email) => {
    const profile = await api.getAttendee(email);
    setUser(profile ? { ...profile, isOrganizer: profile.is_organizer ?? profile.isOrganizer } : null);
  }, []);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setAuthUser(u);
      if (u?.email) await loadProfile(u.email);
      setChecking(false);
    })();
    const sub = onAuthChange(async (u) => {
      setAuthUser(u);
      if (u?.email) await loadProfile(u.email); else setUser(null);
    });
    return () => sub();
  }, [loadProfile]);

  const loadItinerary = useCallback(async (email) => setItinerary(await api.getItinerary(email)), []);
  const loadAnnouncements = useCallback(async () => {
    const rows = await api.getAnnouncements();
    setAnnouncements(rows.map((r) => ({ ...r, timestamp: new Date(r.created_at).getTime() })));
  }, []);

  useEffect(() => {
    if (!user) return;
    loadItinerary(user.email);
    loadAnnouncements();
    const unsub = api.subscribeAnnouncements(loadAnnouncements);
    return unsub;
  }, [user, loadItinerary, loadAnnouncements]);

  useEffect(() => {
    if (!user) return;
    let loaded = { sessions: false, speakers: false, days: false, venueSpots: false, eventConfig: false };
    const checkDone = (key) => { loaded[key] = true; if (Object.values(loaded).every(Boolean)) setContentLoading(false); };

    const unsubSessions = api.subscribeSessions((rows) => { setSessions(rows); checkDone("sessions"); });
    const unsubSpeakers = api.subscribeSpeakers((rows) => { setSpeakers(rows); checkDone("speakers"); });
    const unsubDays = api.subscribeDays((rows) => { setDays(rows); checkDone("days"); });
    const unsubVenueSpots = api.subscribeVenueSpots((rows) => { setVenueSpots(rows); checkDone("venueSpots"); });
    const unsubEventConfig = api.subscribeEventConfig((cfg) => { setEventConfig(cfg || {}); checkDone("eventConfig"); });

    return () => { unsubSessions(); unsubSpeakers(); unsubDays(); unsubVenueSpots(); unsubEventConfig(); };
  }, [user]);

  const handleLogout = async () => { await signOut(); setUser(null); setAuthUser(null); setView("home"); };

  const toggleSave = async (sessionId) => {
    const isSaved = itinerary.includes(sessionId);
    setItinerary(isSaved ? itinerary.filter((id) => id !== sessionId) : [...itinerary, sessionId]);
    await api.toggleItinerary(user.email, sessionId, isSaved);
  };

  const openSession = (s) => setSelectedSession(s);
  const openSpeaker = (sp) => setSelectedSpeaker(sp);
  const goLiveFor = () => { setSelectedSession(null); setView("live"); };

  if (checking) {
    return <div style={{ background: C.navy, paddingTop: "env(safe-area-inset-top)" }} className="w-full h-dvh flex items-center justify-center"><p style={{ color: C.white }} className="text-[13px]">Loading…</p></div>;
  }

  return (
    <div className="w-full min-h-dvh flex items-center justify-center bg-white sm:bg-[#DDE1E7]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="relative w-full h-dvh sm:h-[90vh] sm:max-w-[420px] sm:max-h-[880px] flex flex-col overflow-hidden bg-white sm:rounded-[28px] sm:shadow-2xl">
        {!authUser ? (
          <LoginScreen />
        ) : !user ? (
          <CompleteProfileScreen email={authUser.email} onDone={(profile) => setUser({ ...profile, isOrganizer: profile.is_organizer ?? profile.isOrganizer })} />
        ) : contentLoading ? (
          <div className="flex-1 flex items-center justify-center"><p style={{ color: C.slate }} className="text-[13px]">Loading…</p></div>
        ) : (
          <ContentContext.Provider value={{ sessions, speakers, days, venueSpots, eventConfig, contentLoading }}>
            {view === "home" && <HomeView user={user} announcements={announcements} setView={setView} openSession={openSession} itinerary={itinerary} />}
            {view === "agenda" && <AgendaView itinerary={itinerary} toggleSave={toggleSave} openSession={openSession} />}
            {view === "itinerary" && <ItineraryView itinerary={itinerary} toggleSave={toggleSave} openSession={openSession} />}
            {view === "live" && <LiveView user={user} />}
            {view === "more" && <MoreView setView={setView} user={user} onLogout={handleLogout} />}
            {view === "speakers" && <SpeakersView onOpenSpeaker={openSpeaker} />}
            {view === "network" && <NetworkView user={user} />}
            {view === "venue" && <VenueView />}
            {view === "announcements" && <AnnouncementsView user={user} announcements={announcements} refresh={loadAnnouncements} />}
            {view === "allowlist" && <AllowlistView user={user} />}
            {view === "organizers" && <ManageOrganizersView user={user} onSelfChange={(v) => setUser({ ...user, isOrganizer: v })} />}
            {view === "messages" && <MessageThread user={user} threadEmail={user.email} threadTitle="Message Organizers" />}
            {view === "inbox" && <OrganizerInboxView user={user} onOpenThread={(email, name) => setSelectedThread({ email, name })} />}
            {view === "agendaBuilder" && <AgendaBuilderView user={user} />}
            {view === "speakerBuilder" && <SpeakerBuilderView user={user} />}
            {view === "venueBuilder" && <VenueBuilderView user={user} />}
            <BottomNav view={view} setView={setView} />
            {selectedSession && <SessionDetail session={selectedSession} itinerary={itinerary} toggleSave={toggleSave} onClose={() => setSelectedSession(null)} onOpenSpeaker={openSpeaker} goLive={goLiveFor} />}
            {selectedSpeaker && <SpeakerDetail sp={selectedSpeaker} onClose={() => setSelectedSpeaker(null)} onOpenSession={(s) => { setSelectedSpeaker(null); setSelectedSession(s); }} />}
            {selectedThread && <MessageThread user={user} threadEmail={selectedThread.email} threadTitle={selectedThread.name} onBack={() => setSelectedThread(null)} overlay />}
          </ContentContext.Provider>
        )}
      </div>
    </div>
  );
}
