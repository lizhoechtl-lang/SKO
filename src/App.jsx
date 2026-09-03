import { useState, useEffect, useCallback } from "react";
import {
  Home, CalendarDays, Users, Radio, MoreHorizontal, MapPin, Clock, Heart,
  ChevronRight, ChevronLeft, Search, Bell, LogOut, Send, ThumbsUp,
  BarChart3, Plus, Check, Mic2, Coffee, Ship, PartyPopper, Mail,
  ArrowRight, Sparkles, Building2, Star, Briefcase, Navigation, MailCheck, Shield
} from "lucide-react";
import { sendMagicLink, getCurrentUser, onAuthChange, signOut } from "./firebaseClient";
import * as api from "./api";

/* ---------------------------------------------------------------------- */
/*  BRAND TOKENS                                                          */
/* ---------------------------------------------------------------------- */
const C = {
  blue: "#0064B1", navy: "#0A1D37", slate: "#6B7280", cloud: "#E5E7EB",
  white: "#FFFFFF", bg: "#F6F7F9", green: "#0A8F5B", purple: "#7C3AED", amber: "#C2790C",
};

const TRACK_COLOR = {
  Keynote: C.navy, "Sales Excellence": C.blue, "Customer Success": C.green,
  "RevOps & Analytics": C.purple, Social: C.amber,
};

/* ---------------------------------------------------------------------- */
/*  STATIC CONTENT — regenerate this block from your spreadsheet          */
/* ---------------------------------------------------------------------- */
const SPEAKERS = [
  { id: "whitney", name: "Whitney Voss", title: "Chief Executive Officer", company: "RIB", initials: "WV", color: C.navy,
    bio: "Whitney has led RIB for six years, growing the company from a regional player into a global revenue platform used across 40 countries. She opens and closes every Global Revenue Summit with a state-of-the-union on where the industry is headed." },
  { id: "tomas", name: "Tomás Herrera", title: "Chief Revenue Officer", company: "RIB", initials: "TH", color: C.blue,
    bio: "Tomás owns global revenue strategy across sales, success, and partnerships. Before RIB he built and scaled revenue teams across three continents at two prior unicorns." },
  { id: "james", name: "James Okafor", title: "VP, Global Sales", company: "RIB", initials: "JO", color: C.blue,
    bio: "James runs RIB's global sales organization and is obsessed with pipeline discipline. He's spent the last year rebuilding the enablement program from the ground up." },
  { id: "priya", name: "Priya Nandan", title: "Head of Customer Success", company: "RIB", initials: "PN", color: C.green,
    bio: "Priya built RIB's global CS function from a single team into a 90-person org spanning four regions, with a renewal rate the board still asks her to explain." },
  { id: "marcus", name: "Marcus Feld", title: "Director of Revenue Operations", company: "RIB", initials: "MF", color: C.purple,
    bio: "Marcus keeps the revenue engine honest — forecasting, territory design, comp plans, and the data infrastructure underneath all of it." },
  { id: "sofia", name: "Sofia Aydın", title: "Regional VP Sales, EMEA", company: "RIB", initials: "SA", color: C.blue,
    bio: "Sofia leads RIB's fastest-growing region from Istanbul, and is this year's local host committee lead — ask her for restaurant recommendations." },
  { id: "daniel", name: "Daniel Cho", title: "VP Customer Success, APAC", company: "RIB", initials: "DC", color: C.green,
    bio: "Daniel built RIB's APAC success motion from scratch and has strong, well-documented opinions on health scoring." },
  { id: "aisha", name: "Aisha Bello", title: "VP Revenue", company: "Northstar Freight", initials: "AB", color: C.slate,
    bio: "Aisha leads revenue at Northstar Freight, a longtime RIB customer, and joins this year's summit as a guest panelist." },
  { id: "kenji", name: "Kenji Watanabe", title: "Head of Customer Success", company: "Aro Systems", initials: "KW", color: C.slate,
    bio: "Kenji leads customer success at Aro Systems and brings a customer's-eye view to what actually moves retention." },
];
const speaker = (id) => SPEAKERS.find((s) => s.id === id);

const SESSIONS = [
  { id: "w1", day: 1, date: "2027-01-18", start: "18:00", end: "20:30", track: "Social", title: "Arrivals & Welcome Reception", room: "Bosphorus Terrace", speakers: [],
    desc: "Grab a drink, find your badge, and watch the sun go down over the Bosphorus before the summit kicks off." },
  { id: "s1", day: 2, date: "2027-01-19", start: "09:00", end: "10:00", track: "Keynote", title: "Building Better Together: The State of Global Revenue", room: "Grand Ballroom", speakers: ["whitney", "tomas"],
    desc: "Whitney and Tomás open the summit with where global revenue is heading in 2027, and what it means for every team in this room." },
  { id: "s2", day: 2, date: "2027-01-19", start: "10:30", end: "11:30", track: "Sales Excellence", title: "Scaling Enterprise Sales Motions Across Regions", room: "Bosphorus Hall", speakers: ["james", "sofia"],
    desc: "What breaks when a sales motion that works in one region gets rolled out to five, and how to design for that up front." },
  { id: "s3", day: 2, date: "2027-01-19", start: "10:30", end: "11:30", track: "Customer Success", title: "Designing Customer Success for Global Scale", room: "Marmara Room", speakers: ["priya", "daniel"],
    desc: "How RIB rebuilt its CS org structure to stay consistent across four regions without losing local judgment." },
  { id: "s4", day: 2, date: "2027-01-19", start: "10:30", end: "11:30", track: "RevOps & Analytics", title: "RevOps Foundations: Data You Can Trust", room: "Galata Room", speakers: ["marcus"],
    desc: "The unglamorous data hygiene work that makes every forecast, dashboard, and comp plan afterward actually trustworthy." },
  { id: "s5", day: 2, date: "2027-01-19", start: "14:00", end: "15:00", track: "Sales Excellence", title: "Negotiation Tactics for Complex, Multi-Region Deals", room: "Bosphorus Hall", speakers: ["james"],
    desc: "Real deal breakdowns from the past year, and what changed when procurement, legal, and three time zones all had a say." },
  { id: "s6", day: 3, date: "2027-01-20", start: "09:30", end: "10:30", track: "Sales Excellence", title: "Pipeline Discipline: Forecasting Without Guesswork", room: "Bosphorus Hall", speakers: ["sofia"],
    desc: "A practical framework for pipeline hygiene that holds up under board-level scrutiny." },
  { id: "s7", day: 3, date: "2027-01-20", start: "09:30", end: "10:30", track: "Customer Success", title: "From Renewal to Expansion: Building the Growth Motion", room: "Marmara Room", speakers: ["daniel"],
    desc: "Why expansion revenue needs its own playbook instead of being bolted onto the renewal conversation." },
  { id: "s8", day: 3, date: "2027-01-20", start: "09:30", end: "10:30", track: "RevOps & Analytics", title: "Territory & Comp Design for Global Teams", room: "Galata Room", speakers: ["marcus", "tomas"],
    desc: "Designing territory and compensation plans that feel fair across wildly different markets." },
  { id: "s9", day: 3, date: "2027-01-20", start: "11:00", end: "12:00", track: "Customer Success", title: "Voice of Customer: Turning Feedback into Roadmap", room: "Marmara Room", speakers: ["priya"],
    desc: "How customer feedback actually makes it into product decisions at RIB, with the routing that makes it work." },
  { id: "s10", day: 3, date: "2027-01-20", start: "14:30", end: "15:30", track: "Keynote", title: "Customer Voices: What Global Enterprises Actually Need", room: "Grand Ballroom", speakers: ["aisha", "kenji", "whitney"],
    desc: "An open panel with two RIB customers on what's working, what isn't, and what they wish vendors understood." },
  { id: "s11", day: 4, date: "2027-01-21", start: "09:30", end: "10:30", track: "Sales Excellence", title: "Enablement That Sticks: Coaching at Scale", room: "Bosphorus Hall", speakers: ["james"],
    desc: "Moving enablement from a one-time onboarding event to something reps actually use six months in." },
  { id: "s12", day: 4, date: "2027-01-21", start: "09:30", end: "10:30", track: "Customer Success", title: "Health Scores That Actually Predict Churn", room: "Marmara Room", speakers: ["daniel", "priya"],
    desc: "Rebuilding a health score from the ground up after the old one stopped predicting anything useful." },
  { id: "s13", day: 4, date: "2027-01-21", start: "09:30", end: "10:30", track: "RevOps & Analytics", title: "The RevOps Stack in 2027", room: "Galata Room", speakers: ["marcus"],
    desc: "A tour of what's actually earning its keep in the modern revenue stack, and what's due for retirement." },
  { id: "s14", day: 4, date: "2027-01-21", start: "11:00", end: "12:00", track: "RevOps & Analytics", title: "Attribution Across a Five-Continent Funnel", room: "Galata Room", speakers: ["marcus", "sofia"],
    desc: "Attribution gets harder with every region you add. Here's the model RIB landed on, and why." },
  { id: "s15", day: 4, date: "2027-01-21", start: "16:00", end: "17:00", track: "Keynote", title: "Building Better Together: Committing to 2028", room: "Grand Ballroom", speakers: ["whitney", "tomas"],
    desc: "The summit closes with what RIB is committing to next year, and how every team in the room fits into it." },
  { id: "g1", day: 4, date: "2027-01-21", start: "19:30", end: "22:30", track: "Social", title: "Gala Dinner Cruise", room: "Bosphorus Departure Pier", speakers: [],
    desc: "A private evening cruise up the Bosphorus with dinner, music, and views of the city lit up on both shores." },
  { id: "f1", day: 5, date: "2027-01-22", start: "09:00", end: "11:00", track: "Social", title: "Farewell Brunch & Departures", room: "Marmara Terrace", speakers: [],
    desc: "One last coffee together before airport transfers begin. Buses run continuously from 09:30." },
];

const DAY_LABELS = {
  1: { label: "Day 1", date: "Mon, Jan 18", sub: "Arrivals" },
  2: { label: "Day 2", date: "Tue, Jan 19", sub: "Opening" },
  3: { label: "Day 3", date: "Wed, Jan 20", sub: "" },
  4: { label: "Day 4", date: "Thu, Jan 21", sub: "Closing & Gala" },
  5: { label: "Day 5", date: "Fri, Jan 22", sub: "Departures" },
};
const TRACKS = ["All", "Keynote", "Sales Excellence", "Customer Success", "RevOps & Analytics", "Social"];

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
/*  AUTH SCREENS — magic link + allowlist gate                            */
/* ---------------------------------------------------------------------- */
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email.trim() || !email.includes("@")) { setError("Enter a valid email to continue."); return; }
    setBusy(true); setError("");
    try {
      const clean = email.trim().toLowerCase();
      const allowed = await api.isEmailAllowed(clean);
      if (!allowed) {
        setError("This email isn't registered for the Summit. Contact the organizers if you think this is a mistake.");
        setBusy(false);
        return;
      }
      await sendMagicLink(clean);
      setSent(true);
    } catch (e) {
      setError("Couldn't send the link — try again in a moment.");
    }
    setBusy(false);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: C.navy }}>
      <div className="relative overflow-hidden px-7 pt-14 pb-10 flex-shrink-0">
        <WorldArcBg />
        <div className="relative">
          <div className="flex items-center gap-2 mb-8">
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: `conic-gradient(${C.blue}, #7EC1F5, ${C.blue})` }} />
            <span style={{ color: C.white, fontWeight: 800, fontSize: 20, letterSpacing: "0.02em" }}>RIB</span>
          </div>
          <h1 style={{ color: C.white, fontWeight: 800, fontSize: 28, lineHeight: 1.15 }}>Global Revenue<br />Summit <span style={{ color: "#7EC1F5" }}>2027</span></h1>
          <div className="mt-3"><Eyebrow color="#7EC1F5">Istanbul</Eyebrow></div>
          <p style={{ color: "#B9C4D6", fontSize: 12, letterSpacing: "0.08em" }} className="uppercase mt-4">Building Better Together</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-t-[28px] px-7 pt-8 pb-8 flex flex-col overflow-y-auto">
        {sent ? (
          <div className="pt-6 text-center">
            <div style={{ background: C.blue + "15" }} className="inline-flex rounded-full p-4 mb-4"><MailCheck size={24} color={C.blue} /></div>
            <p style={{ color: C.navy }} className="font-semibold text-[15px]">Check your inbox</p>
            <p style={{ color: C.slate }} className="text-[13px] mt-1.5">We sent a sign-in link to <span style={{ color: C.navy, fontWeight: 600 }}>{email}</span>. Tap it on this device to continue.</p>
            <button onClick={() => setSent(false)} style={{ color: C.blue }} className="text-[13px] font-semibold mt-5">Use a different email</button>
          </div>
        ) : (
          <>
            <p style={{ color: C.navy }} className="font-semibold text-[15px] mb-1">Welcome, delegate.</p>
            <p style={{ color: C.slate }} className="text-[13px] mb-6">Enter your registration email and we'll send you a one-tap sign-in link — no password needed.</p>
            <label style={{ color: C.slate }} className="text-[11px] font-semibold uppercase tracking-wide mb-1 block">Work email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@company.com" type="email"
              style={{ borderColor: C.cloud }} className="w-full border rounded-xl px-3.5 py-2.5 text-[14px] mb-2 outline-none" onKeyDown={(e) => e.key === "Enter" && submit()} />
            {error && <p style={{ color: "#C0342C" }} className="text-[12px] mt-1">{error}</p>}
            <button onClick={submit} disabled={busy} style={{ background: C.blue }} className="mt-6 w-full text-white rounded-xl py-3 font-semibold text-[14px] flex items-center justify-center gap-2 disabled:opacity-60">
              {busy ? "Sending…" : "Send sign-in link"} <ArrowRight size={16} />
            </button>
            <p style={{ color: C.slate }} className="text-[11px] text-center mt-4">Jan 18–22, 2027 · Istanbul Congress Center</p>
          </>
        )}
      </div>
    </div>
  );
}

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
    <div className="h-full flex flex-col" style={{ background: C.navy }}>
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
    <div style={{ borderColor: C.cloud }} className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0 bg-white">
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
    <div style={{ borderColor: C.cloud }} className="flex-shrink-0 border-t bg-white flex items-stretch">
      {items.map((it) => {
        const active = view === it.id || (it.id === "more" && ["speakers","network","venue","announcements","profile","allowlist","organizers"].includes(view));
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
  const d = daysUntil("2027-01-18");
  const nextSession = SESSIONS.filter((s) => s.track !== "Social").sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0];
  const latest = announcements[0];
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: C.bg }}>
      <div className="relative overflow-hidden px-6 pt-7 pb-8" style={{ background: C.navy }}>
        <WorldArcBg />
        <div className="relative">
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
              <span className="flex items-center gap-1"><Clock size={12} />{nextSession.start} · {DAY_LABELS[nextSession.day].date}</span>
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
          {s.speakers.length > 0 && <span className="truncate">{s.speakers.map((id) => speaker(id).name.split(" ")[0]).join(", ")}</span>}
        </div>
      </div>
    </button>
  );
}
function AgendaView({ itinerary, toggleSave, openSession }) {
  const [day, setDay] = useState(2);
  const [track, setTrack] = useState("All");
  const sessions = SESSIONS.filter((s) => s.day === day && (track === "All" || s.track === track)).sort((a, b) => a.start.localeCompare(b.start));
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AppBar title="Agenda" />
      <div style={{ borderColor: C.cloud }} className="flex gap-2 px-4 py-3 border-b overflow-x-auto flex-shrink-0">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setDay(n)} style={{ background: day === n ? C.blue : C.bg, color: day === n ? C.white : C.navy, borderColor: day===n?C.blue:C.cloud }} className="border rounded-xl px-3 py-2 flex-shrink-0 text-center min-w-[64px]">
            <p className="text-[10px] font-bold uppercase" style={{ opacity: 0.85 }}>{DAY_LABELS[n].label}</p>
            <p className="text-[11px] font-semibold">{DAY_LABELS[n].date.split(", ")[1]}</p>
          </button>
        ))}
      </div>
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto flex-shrink-0">
        {TRACKS.map((t) => <button key={t} onClick={() => setTrack(t)} style={{ background: track === t ? C.navy : C.white, color: track === t ? C.white : C.slate, borderColor: C.cloud }} className="border rounded-full px-3 py-1.5 text-[11.5px] font-semibold flex-shrink-0 whitespace-nowrap">{t}</button>)}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-1 space-y-2.5" style={{ background: C.bg }}>
        {DAY_LABELS[day].sub && <p style={{ color: C.slate }} className="text-[11px] font-semibold uppercase tracking-wide pt-2 pb-1">{DAY_LABELS[day].sub}</p>}
        {sessions.length === 0 && <p style={{ color: C.slate }} className="text-[13px] text-center pt-10">No sessions match this filter.</p>}
        {sessions.map((s) => <SessionCard key={s.id} s={s} saved={itinerary.includes(s.id)} onToggleSave={toggleSave} onOpen={openSession} />)}
      </div>
    </div>
  );
}
function SessionDetail({ session, itinerary, toggleSave, onClose, onOpenSpeaker, goLive }) {
  if (!session) return null;
  const saved = itinerary.includes(session.id);
  return (
    <div className="absolute inset-0 bg-white flex flex-col z-20">
      <AppBar title="Session" onBack={onClose} />
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <TrackTag track={session.track} size="md" />
        <h1 style={{ color: C.navy }} className="font-bold text-[20px] leading-snug mt-3">{session.title}</h1>
        <div style={{ color: C.slate }} className="flex flex-col gap-1.5 mt-3 text-[13px]">
          <span className="flex items-center gap-2"><Clock size={14} />{DAY_LABELS[session.day].date} · {session.start}–{session.end} (Istanbul time)</span>
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
                const sp = speaker(id);
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
  if (!sp) return null;
  const theirSessions = SESSIONS.filter((s) => s.speakers.includes(sp.id));
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
                <TrackTag track={s.track} /><p style={{ color: C.navy }} className="font-semibold text-[13.5px] mt-1.5">{s.title}</p><p style={{ color: C.slate }} className="text-[11.5px] mt-1">{DAY_LABELS[s.day].date} · {s.start}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function ItineraryView({ itinerary, toggleSave, openSession }) {
  const items = SESSIONS.filter((s) => itinerary.includes(s.id)).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
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
              <Eyebrow color={C.slate}>{DAY_LABELS[d].label} · {DAY_LABELS[d].date}</Eyebrow>
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
  const [sessionId, setSessionId] = useState("s1");
  const [poll, setPoll] = useState(null);
  const [qa, setQa] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const liveSessions = SESSIONS.filter((s) => s.track !== "Social");

  const load = useCallback(async () => {
    setLoading(true);
    const [p, q] = await Promise.all([api.getPoll(sessionId), api.getQuestions(sessionId)]);
    setPoll(p || { question: "Organizers haven't opened a poll for this session yet.", options: [], voters: [] });
    setQa(q);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const unsubVotes = api.subscribePollVotes(sessionId, load);
    const unsubQa = api.subscribeQuestions(sessionId, load);
    return () => { unsubVotes(); unsubQa(); };
  }, [sessionId, load]);

  const vote = async (optId) => {
    if (poll.voters.includes(user.email)) return;
    try { await api.castVote(sessionId, user.email, optId); await load(); } catch {}
  };
  const submitQuestion = async () => {
    if (!question.trim()) return;
    await api.postQuestion(sessionId, user.email, user.name, question.trim());
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
        <select value={sessionId} onChange={(e) => setSessionId(e.target.value)} style={{ borderColor: C.cloud, color: C.navy }} className="w-full border rounded-xl px-3 py-2.5 text-[13px] font-medium">
          {liveSessions.map((s) => <option key={s.id} value={s.id}>{DAY_LABELS[s.day].label} · {s.start} — {s.title}</option>)}
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
  const [q, setQ] = useState("");
  const list = SPEAKERS.filter((s) => (s.name + s.company + s.title).toLowerCase().includes(q.toLowerCase()));
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
  const spots = [
    { icon: Building2, title: "Istanbul Congress Center", sub: "Main venue · all keynotes & breakouts", detail: "Harbiye, Şişli — enter via the Darülbedayi Caddesi lobby. Badge pickup is at the ground floor desk from 07:30 daily." },
    { icon: Coffee, title: "Bosphorus Terrace", sub: "Welcome reception, Day 1", detail: "Rooftop terrace, ICC north wing. Casual dress, cocktails from 18:00." },
    { icon: Ship, title: "Bosphorus Departure Pier", sub: "Gala dinner cruise, Day 4", detail: "10-minute shuttle from ICC — buses run continuously from 19:00. Boarding closes at 19:45 sharp." },
    { icon: PartyPopper, title: "Marmara Terrace", sub: "Farewell brunch, Day 5", detail: "ICC south wing. Airport shuttles depart from the same terrace every 30 minutes from 09:30." },
  ];
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AppBar title="Venue & Map" />
      <div className="flex-1 overflow-y-auto" style={{ background: C.bg }}>
        <div className="relative overflow-hidden mx-4 mt-4 rounded-2xl" style={{ background: C.navy, height: 150 }}>
          <WorldArcBg />
          <div className="relative h-full flex flex-col justify-end p-4">
            <p style={{ color: C.white }} className="font-bold text-[15px]">Istanbul Congress Center</p>
            <p style={{ color: "#B9C4D6" }} className="text-[12px]">Darülbedayi Cd., Harbiye, Şişli, Istanbul</p>
            <a href="https://www.google.com/maps/search/?api=1&query=Istanbul+Congress+Center" target="_blank" rel="noopener noreferrer" style={{ background: C.blue }} className="mt-2.5 self-start text-white text-[11.5px] font-semibold rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <Navigation size={12} /> Open in Maps
            </a>
          </div>
        </div>
        <div className="px-4 py-5 space-y-3">
          {spots.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ borderColor: C.cloud }} className="bg-white border rounded-2xl p-4 flex gap-3">
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
function AnnouncementsView({ user, announcements, refresh }) {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [posting, setPosting] = useState(false);

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
          <div key={a.id} style={{ borderColor: C.cloud }} className="bg-white border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1.5"><div style={{ background: C.blue + "15" }} className="rounded-full p-1.5"><Bell size={12} color={C.blue} /></div><p style={{ color: C.slate }} className="text-[11px]">{a.author} · {timeAgo(a.timestamp)}</p></div>
            <p style={{ color: C.navy }} className="font-bold text-[14px]">{a.title}</p>
            <p style={{ color: C.slate }} className="text-[13px] mt-1 leading-relaxed">{a.body}</p>
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
    ...(user.isOrganizer ? [
      { id: "allowlist", label: "Manage Allowlist", icon: Shield },
      { id: "organizers", label: "Manage Organizers", icon: Star },
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
/*  ALLOWLIST ADMIN — who can request a sign-in link                      */
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
    setMsg(`Added ${list.length} email${list.length !== 1 ? "s" : ""}.`);
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
          <p style={{ color: C.slate }} className="text-[11.5px] mb-2">Paste one per line, or comma-separated. Only these emails can request a sign-in link.</p>
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
    return <div style={{ background: C.navy }} className="w-full h-full flex items-center justify-center"><p style={{ color: C.white }} className="text-[13px]">Loading…</p></div>;
  }

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: "#DDE1E7", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="relative w-full flex flex-col overflow-hidden" style={{ maxWidth: 420, height: "100%", maxHeight: 880, background: C.white, borderRadius: 28, boxShadow: "0 20px 60px rgba(10,29,55,0.25)" }}>
        {!authUser ? (
          <LoginScreen />
        ) : !user ? (
          <CompleteProfileScreen email={authUser.email} onDone={(profile) => setUser({ ...profile, isOrganizer: profile.is_organizer ?? profile.isOrganizer })} />
        ) : (
          <>
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
            <BottomNav view={view} setView={setView} />
            {selectedSession && <SessionDetail session={selectedSession} itinerary={itinerary} toggleSave={toggleSave} onClose={() => setSelectedSession(null)} onOpenSpeaker={openSpeaker} goLive={goLiveFor} />}
            {selectedSpeaker && <SpeakerDetail sp={selectedSpeaker} onClose={() => setSelectedSpeaker(null)} onOpenSession={(s) => { setSelectedSpeaker(null); setSelectedSession(s); }} />}
          </>
        )}
      </div>
    </div>
  );
}
