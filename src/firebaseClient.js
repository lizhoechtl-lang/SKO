// npm install firebase
// (and you can remove @supabase/supabase-js + src/supabaseClient.js — no longer used)

import { initializeApp } from "firebase/app";
import {
  getAuth, sendSignInLinkToEmail, isSignInWithEmailLink,
  signInWithEmailLink, onAuthStateChanged, signOut as fbSignOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const EMAIL_KEY = "rib_summit_email_for_signin";

/* ---------------------------------------------------------------------- */
/*  AUTH — email link (Firebase's equivalent of a magic link)              */
/* ---------------------------------------------------------------------- */

// Sends the sign-in link. Firebase's email link requires the SAME device/
// browser to complete sign-in (it can't verify the email otherwise unless
// the person re-types it), so we stash the email locally to auto-complete
// when they click the link back on this device.
export async function sendMagicLink(email) {
  const actionCodeSettings = {
    url: window.location.href.split("?")[0],
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem(EMAIL_KEY, email);
}

// Completes sign-in if the current URL IS a Firebase sign-in link.
// Called automatically by getCurrentUser()/onAuthChange() — you don't
// need to call this yourself.
async function completeSignInIfNeeded() {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem(EMAIL_KEY);
    if (!email) {
      // Different browser/device than the one that requested the link —
      // ask them to confirm which email this is.
      email = window.prompt("Confirm your email to finish signing in:");
    }
    if (email) {
      await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem(EMAIL_KEY);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
}

export async function getCurrentUser() {
  await completeSignInIfNeeded();
  if (auth.currentUser) return { email: auth.currentUser.email };
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u ? { email: u.email } : null);
    });
  });
}

// Returns an unsubscribe FUNCTION directly (not an object with .unsubscribe()
// like the Supabase version — small difference to account for in App.jsx).
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (u) => callback(u ? { email: u.email } : null));
}

export async function signOut() {
  await fbSignOut(auth);
}
