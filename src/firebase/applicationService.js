import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, getFriendlyErrorMessage } from "./firestore";

const applicationCollection = collection(db, "applications");

export async function createApplication(userId, schemeId, data = {}) {
  try {
    const payload = {
      userId,
      schemeId,
      schemeName: data.schemeName || "",
      status: data.status || "DRAFT",
      applicationNumber: data.applicationNumber || "",
      submittedAt: data.submittedAt || null,
      updatedAt: serverTimestamp(),
      remarks: data.remarks || "",
      documents: Array.isArray(data.documents) ? data.documents : [],
    };

    const reference = await addDoc(applicationCollection, payload);
    return { id: reference.id, ...payload };
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to create your application."));
  }
}

export async function getUserApplications(userId) {
  try {
    const snapshot = await getDocs(query(applicationCollection, where("userId", "==", userId)));
    return snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to load your applications."));
  }
}

export async function getApplicationById(applicationId) {
  try {
    const snapshot = await getDoc(doc(db, "applications", applicationId));
    if (!snapshot.exists()) {
      return null;
    }
    return { id: snapshot.id, ...snapshot.data() };
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to load this application."));
  }
}

export async function updateApplicationStatus(applicationId, status) {
  try {
    if (!applicationId || !status) {
      throw new Error("Application ID and status are required.");
    }

    await updateDoc(doc(db, "applications", applicationId), {
      status,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to update application status."));
  }
}
