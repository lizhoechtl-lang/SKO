// Firestore version of the data layer — replaces the Supabase api.js.
// Same exported function names/signatures as before, so App.jsx barely changes.

import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, addDoc, getDocs,
  query, where, orderBy, onSnapshot, arrayUnion, arrayRemove, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseClient";

/* ---------------- Attendee profile ---------------- */

export async function upsertAttendeeProfile({ email, name, company }) {
  const ref = doc(db, "attendees", email);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, { name, company: company || "" });
    return { ...existing.data(), name, company: company || "" };
  }
  const data = { email, name, company: company || "", title: "Delegate", isOrganizer: false, createdAt: serverTimestamp() };
  await setDoc(ref, data);
  return data;
}

export async function getAttendee(email) {
  const snap = await getDoc(doc(db, "attendees", email));
  return snap.exists() ? snap.data() : null;
}

export async function getAllAttendees() {
  const snap = await getDocs(collection(db, "attendees"));
  return snap.docs.map((d) => d.data()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function setOrganizer(email, isOrganizer) {
  await updateDoc(doc(db, "attendees", email), { isOrganizer });
}

/* ---------------- Itinerary ("My Agenda") ---------------- */

export async function getItinerary(email) {
  const snap = await getDoc(doc(db, "itineraries", email));
  return snap.exists() ? snap.data().sessionIds || [] : [];
}

export async function toggleItinerary(email, sessionId, isSaved) {
  const ref = doc(db, "itineraries", email);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { sessionIds: isSaved ? [] : [sessionId] });
    return;
  }
  await updateDoc(ref, { sessionIds: isSaved ? arrayRemove(sessionId) : arrayUnion(sessionId) });
}

/* ---------------- Connections ---------------- */

export async function getConnections(email) {
  const snap = await getDoc(doc(db, "connections", email));
  return snap.exists() ? snap.data().connectedEmails || [] : [];
}

export async function toggleConnection(email, targetEmail, isConnected) {
  const ref = doc(db, "connections", email);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { connectedEmails: isConnected ? [] : [targetEmail] });
    return;
  }
  await updateDoc(ref, { connectedEmails: isConnected ? arrayRemove(targetEmail) : arrayUnion(targetEmail) });
}

/* ---------------- Announcements ---------------- */

export async function getAnnouncements() {
  const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    };
  });
}

export async function postAnnouncement({ title, body, author }) {
  await addDoc(collection(db, "announcements"), { title, body, author, createdAt: serverTimestamp() });
}

export function subscribeAnnouncements(onChange) {
  const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
  return onSnapshot(q, () => onChange());
}

/* ---------------- Live polls ---------------- */

export async function getPoll(sessionId) {
  const pollSnap = await getDoc(doc(db, "polls", sessionId));
  if (!pollSnap.exists()) return null;
  const poll = pollSnap.data();
  const votesSnap = await getDocs(collection(db, "polls", sessionId, "votes"));
  const counts = {};
  const voters = [];
  votesSnap.forEach((v) => {
    const { optionId, email } = v.data();
    counts[optionId] = (counts[optionId] || 0) + 1;
    voters.push(email);
  });
  return {
    question: poll.question,
    options: poll.options.map((o) => ({ ...o, votes: counts[o.id] || 0 })),
    voters,
  };
}

export async function castVote(sessionId, email, optionId) {
  // Doc ID = the attendee's email, so a second vote just overwrites — combined
  // with the UI's own "already voted" check, this keeps one vote per person.
  const ref = doc(db, "polls", sessionId, "votes", email);
  const existing = await getDoc(ref);
  if (existing.exists()) return;
  await setDoc(ref, { email, optionId, createdAt: serverTimestamp() });
}

export function subscribePollVotes(sessionId, onChange) {
  return onSnapshot(collection(db, "polls", sessionId, "votes"), () => onChange());
}

/* ---------------- Live Q&A ---------------- */

export async function getQuestions(sessionId) {
  const q = query(collection(db, "qaQuestions"), where("sessionId", "==", sessionId));
  const snap = await getDocs(q);
  const questions = [];
  for (const d of snap.docs) {
    const upvotesSnap = await getDocs(collection(db, "qaQuestions", d.id, "upvotes"));
    questions.push({
      id: d.id,
      ...d.data(),
      attendee_name: d.data().name,
      upvotes: upvotesSnap.docs.map((u) => u.id),
    });
  }
  return questions.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function postQuestion(sessionId, email, name, questionText) {
  await addDoc(collection(db, "qaQuestions"), { sessionId, email, name, question: questionText, createdAt: serverTimestamp() });
}

export async function upvoteQuestion(questionId, email) {
  await setDoc(doc(db, "qaQuestions", questionId, "upvotes", email), { email });
}

export function subscribeQuestions(sessionId, onChange) {
  const q = query(collection(db, "qaQuestions"), where("sessionId", "==", sessionId));
  return onSnapshot(q, () => onChange());
}

/* ---------------- Allowlist (who can request a sign-in link) ---------------- */
 
export async function isEmailAllowed(email) {
  const snap = await getDoc(doc(db, "allowedAttendees", email));
  return snap.exists();
}
 
export async function getAllowedEmails() {
  const snap = await getDocs(collection(db, "allowedAttendees"));
  return snap.docs.map((d) => d.id).sort();
}
 
export async function addAllowedEmails(emails) {
  for (const email of emails) {
    await setDoc(doc(db, "allowedAttendees", email), { email, addedAt: serverTimestamp() });
  }
}
 
export async function removeAllowedEmail(email) {
  await deleteDoc(doc(db, "allowedAttendees", email));
}
 
