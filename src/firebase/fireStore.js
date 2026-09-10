import { initializeApp } from "firebase/app";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { app, db, storage } from "./firebaseConfig";

export { app, db, storage, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp };

export function getFriendlyErrorMessage(error, fallbackMessage = "Something went wrong. Please try again.") {
  const message = error?.message || "";

  if (message.includes("permission-denied") || message.includes("PERMISSION_DENIED")) {
    return "You do not have permission to perform this action.";
  }

  if (message.includes("not-found") || message.includes("NOT_FOUND")) {
    return "The requested record was not found.";
  }

  if (message.includes("already-exists") || message.includes("ALREADY_EXISTS")) {
    return "This record already exists.";
  }

  return fallbackMessage;
}

export async function uploadDocument(userId, file) {
  if (!file) {
    throw new Error("No file was provided.");
  }

  const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
  const maxFileSize = 5 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only PDF, JPG, JPEG, and PNG documents are allowed.");
  }

  if (file.size > maxFileSize) {
    throw new Error("File size must be less than 5MB.");
  }

  const storageRef = ref(storage, `documents/${userId}/${Date.now()}_${file.name}`);
  const uploadedFile = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(uploadedFile.ref);

  return {
    name: file.name,
    type: file.type,
    size: file.size,
    url: downloadUrl,
    path: uploadedFile.ref.fullPath,
    uploadedAt: new Date().toISOString(),
  };
}
