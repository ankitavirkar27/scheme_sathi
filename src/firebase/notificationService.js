import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, getFriendlyErrorMessage } from "./firestore";

const notificationCollection = collection(db, "notifications");

export async function createNotification(userId, data = {}) {
  try {
    const payload = {
      userId,
      title: data.title || "Notification",
      message: data.message || "",
      type: data.type || "info",
      read: false,
      createdAt: serverTimestamp(),
    };

    const reference = await addDoc(notificationCollection, payload);
    return { id: reference.id, ...payload };
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to create notification."));
  }
}

export async function getUserNotifications(userId) {
  try {
    const snapshot = await getDocs(query(notificationCollection, where("userId", "==", userId)));
    return snapshot.docs
      .map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to load notifications."));
  }
}

export async function markNotificationAsRead(notificationId) {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true,
    });
    return true;
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to update notification."));
  }
}
