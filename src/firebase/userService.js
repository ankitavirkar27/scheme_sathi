import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, getFriendlyErrorMessage, uploadDocument } from "./firestore";

function normalizeUserData(data = {}) {
  return {
    uid: data.uid || "",
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    dateOfBirth: data.dateOfBirth || "",
    gender: data.gender || "",
    category: data.category || "",
    annualIncome: Number(data.annualIncome || 0),
    education: data.education || "",
    occupation: data.occupation || "",
    state: data.state || "",
    district: data.district || "",
    city: data.city || "",
    pincode: data.pincode || "",
    createdAt: data.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export async function createUserProfile(uid, data) {
  try {
    const payload = normalizeUserData({ uid, ...data });
    await setDoc(doc(db, "users", uid), payload, { merge: true });
    return payload;
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to create your profile."));
  }
}

export async function getUserProfile(uid) {
  try {
    if (!uid) {
      return null;
    }
    const snapshot = await getDoc(doc(db, "users", uid));
    if (!snapshot.exists()) {
      // Return default profile if doesn't exist yet
      console.warn("User profile not found, returning default");
      return null;
    }
    return { id: snapshot.id, ...snapshot.data() };
  } catch (error) {
    console.error("Error loading profile:", error);
    // Return null instead of throwing to allow app to continue with defaults
    return null;
  }
}

export async function updateUserProfile(uid, data) {
  try {
    const payload = normalizeUserData({ uid, ...data });
    delete payload.createdAt;
    await updateDoc(doc(db, "users", uid), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
    return { uid, ...payload, updatedAt: new Date().toISOString() };
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to update your profile."));
  }
}

export { uploadDocument };
