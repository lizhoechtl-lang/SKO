import { useState, useEffect, useCallback } from "react";
import {
  Home, CalendarDays, Users, Radio, MoreHorizontal, MapPin, Clock, Heart,
  ChevronRight, ChevronLeft, Search, Bell, LogOut, Send, ThumbsUp,
  BarChart3, Plus, Check, Mic2, Coffee, Ship, PartyPopper, Mail,
  ArrowRight, Sparkles, Building2, Star, Briefcase, Navigation, Shield, Lock, Trash2
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
const SPEAKERS = [
  { id: "rene", name: "René Wolf", title: "Chief Executive Officer", company: "RIB", initials: "RW", color: "#0A1D37",
    bio: "" },
  { id: "tobias", name: "Tobias Hamacher", title: "Chief Financial Officer", company: "RIB", initials: "TH", color: "#0064B1",
    bio: "" },
  { id: "mads", name: "Mads Bording", title: "Chief Marketing / Strategy Officer", company: "RIB", initials: "MB", color: "#0064B1",
    bio: "" },
  { id: "liz", name: "Liz Hoechtl", title: "Chief of Staff / Global HRBP Commercial", company: "RIB", initials: "LH", color: "#0064B1",
    bio: "" },
  { id: "matt", name: "Matt Sandidge", title: "VP Sales Excellence & Operations", company: "RIB", initials: "MS", color: "#7C3AED",
    bio: "" },
  { id: "rolf", name: "Rolf Helmes", title: "Chief Product Officer", company: "RIB", initials: "RH", color: "#0064B1",
    bio: "" },
  { id: "kim", name: "Kim Immelman", title: "VP Global Marketing", company: "RIB", initials: "KI", color: "#7C3AED",
    bio: "" },
  { id: "jareb", name: "Jareb Courtney", title: "Chief Human Resource Officer", company: "RIB", initials: "JC", color: "#0064B1",
    bio: "" },
  { id: "evgeny", name: "Evgeny Fedotov", title: "Chief Commercial Officer", company: "RIB", initials: "EF", color: "#0064B1",
    bio: "" },
];
const speaker = (id) => SPEAKERS.find((s) => s.id === id);

const SESSIONS = [
  { id: "d1s01", day: 1, date: "2027-01-25", start: "10:00", end: "14:00", track: "Multiple", title: "RIB EXPO - Connect & Explore Experience", room: "Hotel Conference Area", speakers: [],
    desc: "Product Showcase Hall, OneCRM Support Hub, AI Discovery Hub, Executive Office Hours, Revenue Growth Exchange, Professional Headshot Studio, Community Hub and bookable meeting rooms." },
  { id: "d1s02", day: 1, date: "2027-01-25", start: "12:00", end: "14:00", track: "Multiple", title: "Registration & Hotel Check-In", room: "Hotel Lobby", speakers: [],
    desc: "" },
  { id: "d1s03", day: 1, date: "2027-01-25", start: "14:00", end: "15:00", track: "Networking & Community", title: "Refresh & Reconnect", room: "Individual Rooms", speakers: [],
    desc: "" },
  { id: "d1s04", day: 1, date: "2027-01-25", start: "15:00", end: "15:20", track: "Strategy & Leadership", title: "Welcome to Global Revenue Summit 2027", room: "Istanbul", speakers: ["liz", "matt"],
    desc: "" },
  { id: "d1s05", day: 1, date: "2027-01-25", start: "15:20", end: "15:50", track: "Strategy & Leadership", title: "CEO: 2026 Company Performance", room: "Istanbul", speakers: ["rene"],
    desc: "" },
  { id: "d1s06", day: 1, date: "2027-01-25", start: "15:50", end: "16:20", track: "Strategy & Leadership", title: "CFO: 2026 Business Performance", room: "Istanbul", speakers: ["tobias"],
    desc: "" },
  { id: "d1s07", day: 1, date: "2027-01-25", start: "16:20", end: "16:50", track: "Strategy & Leadership", title: "CCO: 2026 Commercial Performance", room: "Istanbul", speakers: ["evgeny"],
    desc: "" },
  { id: "d1s08", day: 1, date: "2027-01-25", start: "16:50", end: "17:00", track: "Strategy & Leadership", title: "Closing 2026", room: "Istanbul", speakers: ["liz", "matt"],
    desc: "" },
  { id: "d1s09", day: 1, date: "2027-01-25", start: "17:30", end: "", track: "Networking & Community", title: "Revenue Awards, Celebration & Happy Hour", room: "Bosphorus Terrace", speakers: ["liz", "matt"],
    desc: "" },
  { id: "d2s01", day: 2, date: "2027-01-26", start: "09:00", end: "09:15", track: "Strategy & Leadership", title: "Welcome to 2027", room: "Istanbul", speakers: ["liz", "matt"],
    desc: "" },
  { id: "d2s02", day: 2, date: "2027-01-26", start: "09:15", end: "09:45", track: "Strategy & Leadership", title: "CEO: Company Vision and 2027 Strategic Priorities", room: "Istanbul", speakers: ["rene"],
    desc: "" },
  { id: "d2s03", day: 2, date: "2027-01-26", start: "09:45", end: "10:15", track: "Strategy & Leadership", title: "CCO: Revenue Strategy and Growth Priorities", room: "Istanbul", speakers: ["evgeny"],
    desc: "" },
  { id: "d2s04", day: 2, date: "2027-01-26", start: "10:15", end: "10:45", track: "Products & Solutions", title: "CPO: Product Strategy and Portfolio Direction", room: "Istanbul", speakers: ["rolf"],
    desc: "" },
  { id: "d2s05", day: 2, date: "2027-01-26", start: "10:45", end: "11:05", track: "Multiple", title: "Break", room: "", speakers: [],
    desc: "" },
  { id: "d2s06", day: 2, date: "2027-01-26", start: "11:05", end: "12:00", track: "Strategy & Leadership", title: "Executive Leadership Panel and Audience Q&A", room: "Istanbul", speakers: [],
    desc: "Panel on cross-functional changes required to deliver the strategy." },
  { id: "d2s07", day: 2, date: "2027-01-26", start: "12:00", end: "13:00", track: "Networking & Community", title: "Lunch", room: "", speakers: [],
    desc: "" },
  { id: "d2s08", day: 2, date: "2027-01-26", start: "13:00", end: "14:00", track: "Revenue Growth & Commercial Excellence", title: "Stage 7 Foundations, Part 1", room: "Pera", speakers: [],
    desc: "Common commercial language, customer buying journey, Stage 7 and qualification foundations, and seller expectations." },
  { id: "d2s09", day: 2, date: "2027-01-26", start: "13:00", end: "14:00", track: "Products & Solutions", title: "Product Track A", room: "Asmalımescit", speakers: [],
    desc: "" },
  { id: "d2s10", day: 2, date: "2027-01-26", start: "13:00", end: "14:00", track: "Tools, Process & Development", title: "OneCRM Fundamentals", room: "Tophane", speakers: [],
    desc: "Navigation, core workflows, account/contact/opportunity records, opportunity creation, required fields and information sources." },
  { id: "d2s11", day: 2, date: "2027-01-26", start: "14:15", end: "15:15", track: "Revenue Growth & Commercial Excellence", title: "Stage 7 Foundations, Part 2", room: "Pera", speakers: [],
    desc: "Stage progression, discovery and qualification, stakeholder understanding, meaningful next steps and opportunity momentum. Participants selecting Stage 7 should attend Parts 1 and 2." },
  { id: "d2s12", day: 2, date: "2027-01-26", start: "14:15", end: "15:15", track: "Products & Solutions", title: "Product Track B", room: "Asmalımescit", speakers: [],
    desc: "" },
  { id: "d2s13", day: 2, date: "2027-01-26", start: "14:15", end: "15:15", track: "Tools, Process & Development", title: "CRM Data Quality and Pipeline Expectations", room: "Tophane", speakers: [],
    desc: "Opportunity data quality, stage and close-date accuracy, required data, aging, pipeline hygiene and common corrections." },
  { id: "d2s14", day: 2, date: "2027-01-26", start: "15:45", end: "16:45", track: "Revenue Growth & Commercial Excellence", title: "Stage 7: Opportunity Strategy and Deal Qualification Clinic", room: "Pera", speakers: [],
    desc: "Practical application through opportunity assessment, qualification strength, stakeholder and competitive considerations, coaching and next actions." },
  { id: "d2s15", day: 2, date: "2027-01-26", start: "15:45", end: "16:45", track: "Products & Solutions", title: "Product Track C", room: "Asmalımescit", speakers: [],
    desc: "" },
  { id: "d2s16", day: 2, date: "2027-01-26", start: "15:45", end: "16:45", track: "Tools, Process & Development", title: "Forecasting Excellence", room: "Tophane", speakers: [],
    desc: "Forecast categories, commit versus upside, ownership, close-date confidence, risk, common mistakes and expectations for sellers and managers." },
  { id: "d2s17", day: 2, date: "2027-01-26", start: "17:00", end: "17:30", track: "Strategy & Leadership", title: "Tuesday Takeaways and Close", room: "Istanbul", speakers: [],
    desc: "" },
  { id: "d3s01", day: 3, date: "2027-01-27", start: "09:00", end: "09:15", track: "Strategy & Leadership", title: "Morning Welcome and Tuesday Recap", room: "Istanbul", speakers: [],
    desc: "" },
  { id: "d3s02", day: 3, date: "2027-01-27", start: "09:15", end: "10:00", track: "Strategy & Leadership", title: "Playing to Win in 2027", room: "Istanbul", speakers: ["mads"],
    desc: "" },
  { id: "d3s03", day: 3, date: "2027-01-27", start: "10:00", end: "10:50", track: "Strategy & Leadership", title: "Go-to-Market Strategy & Market Activation", room: "Istanbul", speakers: ["kim"],
    desc: "" },
  { id: "d3s04", day: 3, date: "2027-01-27", start: "10:50", end: "11:10", track: "Multiple", title: "Break", room: "", speakers: [],
    desc: "" },
  { id: "d3s05", day: 3, date: "2027-01-27", start: "11:10", end: "11:20", track: "Strategy & Leadership", title: "Building the Team That Wins 2027", room: "Istanbul", speakers: ["jareb"],
    desc: "High-performance capability, leadership behaviors, talent growth, career ownership and Q&A." },
  { id: "d3s06", day: 3, date: "2027-01-27", start: "12:00", end: "12:45", track: "Strategy & Leadership", title: "External High-Performance Keynote", room: "Istanbul", speakers: [],
    desc: "Inspirational session connecting winning teams, accountability, resilience, high-performance behaviors and action." },
  { id: "d3s07", day: 3, date: "2027-01-27", start: "12:45", end: "13:45", track: "Networking & Community", title: "Lunch", room: "", speakers: [],
    desc: "" },
  { id: "d3s08", day: 3, date: "2027-01-27", start: "14:00", end: "15:00", track: "Revenue Growth & Commercial Excellence", title: "Stage 7 for Sales Directors, Part 1", room: "Tophane", speakers: [],
    desc: "Coaching the Stage 7 methodology, identifying weak opportunities, improving deal quality, coaching cadence and adoption." },
  { id: "d3s09", day: 3, date: "2027-01-27", start: "14:00", end: "15:00", track: "Products & Solutions", title: "Product Track D", room: "Pera", speakers: [],
    desc: "" },
  { id: "d3s10", day: 3, date: "2027-01-27", start: "14:00", end: "15:00", track: "Tools, Process & Development", title: "OneCRM Fundamentals, Repeat", room: "Asmalımescit", speakers: [],
    desc: "Second opportunity for attendees who selected Stage 7 or Product on Tuesday." },
  { id: "d3s11", day: 3, date: "2027-01-27", start: "15:15", end: "16:15", track: "Revenue Growth & Commercial Excellence", title: "Stage 7 for Sales Directors, Part 2", room: "Tophane", speakers: [],
    desc: "Inspection, accountability, pipeline quality, deal-risk identification, forecast confidence and manager routines. Sales Directors should attend Parts 1 and 2." },
  { id: "d3s12", day: 3, date: "2027-01-27", start: "15:15", end: "16:15", track: "Products & Solutions", title: "Advanced Product Deep Dive", room: "Pera", speakers: [],
    desc: "" },
  { id: "d3s13", day: 3, date: "2027-01-27", start: "15:15", end: "16:15", track: "Tools, Process & Development", title: "Incentive Plan Fundamentals", room: "Asmalımescit", speakers: [],
    desc: "2027 plan structure, measures, mechanics, recognition, practical examples, common questions and authoritative guidance." },
  { id: "d3s14", day: 3, date: "2027-01-27", start: "16:45", end: "17:45", track: "Revenue Growth & Commercial Excellence", title: "Stage 7 in OneCRM: Live Opportunity Coaching", room: "Tophane", speakers: [],
    desc: "Joint Stage 7 and OneCRM session showing qualification, CRM capture, visible risk, manager inspection and coaching actions using a representative opportunity." },
  { id: "d3s15", day: 3, date: "2027-01-27", start: "16:45", end: "17:45", track: "Products & Solutions", title: "Product Owner Q&A Rooms", room: "Pera", speakers: [],
    desc: "" },
  { id: "d3s16", day: 3, date: "2027-01-27", start: "16:45", end: "17:45", track: "Tools, Process & Development", title: "Dashboards, Reporting and Business Reviews", room: "Asmalımescit", speakers: [],
    desc: "Dashboard selection, pipeline and forecast interpretation, business-review information, inspection preparation and decision-making." },
  { id: "d3s17", day: 3, date: "2027-01-27", start: "18:00", end: "18:15", track: "Strategy & Leadership", title: "Wednesday Takeaways and Reflection", room: "Istanbul", speakers: [],
    desc: "" },
  { id: "d4s01", day: 4, date: "2027-01-28", start: "09:00", end: "09:00", track: "Strategy & Leadership", title: "Welcome to Execution Day", room: "Istanbul", speakers: [],
    desc: "" },
  { id: "d4s02", day: 4, date: "2027-01-28", start: "09:00", end: "10:20", track: "Revenue Growth & Commercial Excellence", title: "Stage 7: Winning Opportunities & Advancing Deals", room: "Pera", speakers: [],
    desc: "Opportunity strategy, multi-threading, competitive situations, executive conversations, next-step planning, advancing stalled deals and coaching exercises." },
  { id: "d4s03", day: 4, date: "2027-01-28", start: "09:00", end: "10:20", track: "Products & Solutions", title: "Product Strategy and Roadmap Office Hours", room: "Asmalımescit", speakers: [],
    desc: "Regional questions, product-market priorities, roadmap clarification, planning assumptions, dependencies and asks." },
  { id: "d4s04", day: 4, date: "2027-01-28", start: "09:00", end: "10:20", track: "Tools, Process & Development", title: "OneCRM for Sales Director", room: "Tophane", speakers: [],
    desc: "Pipeline and opportunity inspection, forecast preparation, dashboards, data quality, coaching and standard team routines." },
  { id: "d4s05", day: 4, date: "2027-01-28", start: "10:20", end: "10:40", track: "Multiple", title: "Break", room: "", speakers: [],
    desc: "" },
  { id: "d4s06", day: 4, date: "2027-01-28", start: "10:40", end: "12:00", track: "Strategy & Leadership", title: "Regional Planning: Growth Priorities and Opportunities", room: "Pera", speakers: [],
    desc: "Regional workshops on revenue ambition, markets, growth opportunities, product priorities, pipeline needs, contributions, risks and dependencies." },
  { id: "d4s07", day: 4, date: "2027-01-28", start: "12:00", end: "13:00", track: "Networking & Community", title: "Lunch", room: "Asmalımescit", speakers: [],
    desc: "" },
  { id: "d4s08", day: 4, date: "2027-01-28", start: "13:00", end: "14:30", track: "Strategy & Leadership", title: "Regional Planning: Risks, Asks and Commitments", room: "Tophane", speakers: [],
    desc: "Regional workshops on actions, ownership, leadership routines, support, dependencies, risks and commitments." },
  { id: "d4s09", day: 4, date: "2027-01-28", start: "14:30", end: "15:00", track: "Multiple", title: "Break", room: "", speakers: [],
    desc: "" },
  { id: "d4s10", day: 4, date: "2027-01-28", start: "15:00", end: "17:00", track: "Strategy & Leadership", title: "Regional Planning: Finalize Priorities and Execution Plan", room: "", speakers: [],
    desc: "Finalize growth plays, revenue and pipeline requirements, product and market focus, actions, owners, risks, support, routines and 2027 commitments." },
  { id: "d5s01", day: 5, date: "2027-01-29", start: "09:00", end: "09:10", track: "Strategy & Leadership", title: "Final Day Opening", room: "Istanbul", speakers: ["liz", "matt"],
    desc: "" },
  { id: "d5s02", day: 5, date: "2027-01-29", start: "09:10", end: "10:10", track: "Strategy & Leadership", title: "Regional Leaders Panel: How We Win in 2027", room: "Istanbul", speakers: [],
    desc: "" },
  { id: "d5s03", day: 5, date: "2027-01-29", start: "10:10", end: "10:30", track: "Multiple", title: "Break", room: "", speakers: [],
    desc: "" },
  { id: "d5s04", day: 5, date: "2027-01-29", start: "10:30", end: "11:15", track: "Strategy & Leadership", title: "CEO & CCO: Alignment, Priorities and Expectations", room: "Istanbul", speakers: ["rene", "evgeny"],
    desc: "Fireside discussion." },
  { id: "d5s05", day: 5, date: "2027-01-29", start: "11:15", end: "11:45", track: "Strategy & Leadership", title: "Final Call to Action", room: "Istanbul", speakers: [],
    desc: "" },
  { id: "d5s06", day: 5, date: "2027-01-29", start: "11:45", end: "12:00", track: "Strategy & Leadership", title: "Event Close", room: "Istanbul", speakers: [],
    desc: "" },
  { id: "d5s07", day: 5, date: "2027-01-29", start: "12:00", end: "", track: "Networking & Community", title: "Lunch and Departures", room: "", speakers: [],
    desc: "" },
];

const DAY_LABELS = {
  1: { label: "Day 1", date: "Mon, Jan 25", sub: "Arrivals" },
  2: { label: "Day 2", date: "Tue, Jan 26", sub: "" },
  3: { label: "Day 3", date: "Wed, Jan 27", sub: "" },
  4: { label: "Day 4", date: "Thu, Jan 28", sub: "Regional Planning" },
  5: { label: "Day 5", date: "Fri, Jan 29", sub: "Departures" },
};
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
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: `conic-gradient(${C.blue}, #7EC1F5, ${C.blue})` }} />
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
  const d = daysUntil("2027-01-25");
  const nextSession = SESSIONS.filter((s) => s.track !== "Social").sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0];
  const latest = announcements[0];
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: C.bg }}>
      <div className="relative overflow-hidden px-6 pb-8" style={{ background: C.navy, paddingTop: "calc(env(safe-area-inset-top) + 28px)" }}>
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
          {s.speakers.length > 0 && <span className="truncate">{s.speakers.map((id) => speaker(id).name).join(", ")}</span>}
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
    { icon: Building2, title: "Istanbul Ballroom", sub: "Main plenary · keynotes, panels & general sessions", detail: "The hotel's main ballroom, used for every Strategy & Leadership session across all five days — including the opening and closing keynotes, the Executive Leadership Panel, and Regional Leaders Panel." },
    { icon: Users, title: "Pera", sub: "Breakout room · Stage 7 & Product tracks", detail: "One of three parallel breakout rooms, hosting the Stage 7 Foundations and Sales Director sessions, and rotating Product Track sessions." },
    { icon: Users, title: "Asmalımescit", sub: "Breakout room · Product & Tools tracks", detail: "One of three parallel breakout rooms, hosting Product Track sessions and Tools, Process & Development sessions including OneCRM Fundamentals." },
    { icon: Users, title: "Tophane", sub: "Breakout room · Tools & Stage 7 for Directors", detail: "One of three parallel breakout rooms, hosting OneCRM and forecasting sessions, plus the Stage 7 for Sales Directors track." },
    { icon: Coffee, title: "Hotel Conference Area", sub: "RIB EXPO, Day 1", detail: "Home to the RIB EXPO Connect & Explore Experience — Product Showcase Hall, OneCRM Support Hub, AI Discovery Hub, Executive Office Hours, Revenue Growth Exchange, Professional Headshot Studio, and Community Hub." },
    { icon: Ship, title: "Bosphorus Terrace", sub: "Revenue Awards, Celebration & Happy Hour, Day 1", detail: "Rooftop terrace with Bosphorus views — the setting for Day 1's evening celebration after the opening sessions close." },
    { icon: PartyPopper, title: "Hotel Lobby", sub: "Registration & check-in, Day 1", detail: "Registration and hotel check-in for arriving delegates." },
  ];
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AppBar title="Venue & Map" />
      <div className="flex-1 overflow-y-auto" style={{ background: C.bg }}>
        <div className="relative overflow-hidden mx-4 mt-4 rounded-2xl" style={{ background: C.navy, height: 150 }}>
          <WorldArcBg />
          <div className="relative h-full flex flex-col justify-end p-4">
            <p style={{ color: C.white }} className="font-bold text-[15px]">CVK Park Bosphorus Hotel Istanbul</p>
            <p style={{ color: "#B9C4D6" }} className="text-[12px]">Gümüşsuyu Mah. İnönü Cad. No:8, 34437 Istanbul, Türkiye</p>
            <a href="https://www.google.com/maps/search/?api=1&query=CVK+Park+Bosphorus+Hotel+Istanbul" target="_blank" rel="noopener noreferrer" style={{ background: C.blue }} className="mt-2.5 self-start text-white text-[11.5px] font-semibold rounded-lg px-3 py-1.5 flex items-center gap-1.5">
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
    return <div style={{ background: C.navy, paddingTop: "env(safe-area-inset-top)" }} className="w-full h-dvh flex items-center justify-center"><p style={{ color: C.white }} className="text-[13px]">Loading…</p></div>;
  }

  return (
    <div className="w-full min-h-dvh flex items-center justify-center bg-white sm:bg-[#DDE1E7]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="relative w-full h-dvh sm:h-[90vh] sm:max-w-[420px] sm:max-h-[880px] flex flex-col overflow-hidden bg-white sm:rounded-[28px] sm:shadow-2xl">
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
