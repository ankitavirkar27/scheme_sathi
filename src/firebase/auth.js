import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import { getFriendlyErrorMessage } from "./firestore";

// Cache key for quick auth check
const AUTH_CACHE_KEY = "scheme_sathi_auth_cache";

export async function initializeAuthPersistence() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.warn("Firebase persistence setup warning:", error);
  }
}

// Initialize persistence asynchronously (don't block app load)
if (typeof window !== 'undefined') {
  initializeAuthPersistence().catch(err => console.warn("Persistence init:", err));
}

async function ensureUserProfile(firebaseUser) {
  if (!firebaseUser?.uid) {
    return null;
  }

  const userRef = doc(db, "users", firebaseUser.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    return snapshot.data();
  }

  const userData = {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
    email: firebaseUser.email || "",
    photoURL: firebaseUser.photoURL || "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    category: "",
    annualIncome: 0,
    education: "",
    occupation: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, userData);
  return userData;
}

export async function registerUser({ name, email, password }) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const createdName = name?.trim() || email.split("@")[0];

    await updateProfile(userCredential.user, { displayName: createdName });
    await ensureUserProfile({ ...userCredential.user, displayName: createdName });

    return userCredential.user;
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to create your account."));
  }
}

export async function loginUser({ email, password }) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserProfile(userCredential.user);
    return userCredential.user;
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to sign you in."));
  }
}

export async function logoutUser() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to sign you out."));
  }
}

export function getCurrentUser() {
  return auth.currentUser;
}

export function onAuthStateChanged(callback) {
  return firebaseOnAuthStateChanged(auth, callback);
}

export async function sendResetLink(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to send password reset email."));
  }
}
