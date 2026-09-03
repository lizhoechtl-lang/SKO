// npm install firebase

import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut as fbSignOut,
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

/* ---------------------------------------------------------------------- */
/*  AUTH — email + password. Accounts are pre-created for attendees via   */
/*  the bulk_create_attendees.js script; nobody self-registers here.      */
/* ---------------------------------------------------------------------- */

export async function signInWithPassword(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function getCurrentUser() {
  if (auth.currentUser) return { email: auth.currentUser.email };
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u ? { email: u.email } : null);
    });
  });
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (u) => callback(u ? { email: u.email } : null));
}

export async function signOut() {
  await fbSignOut(auth);
}
