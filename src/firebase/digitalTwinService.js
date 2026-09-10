import { collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { db, getFriendlyErrorMessage } from "./firestore";

const scenarios = (uid) => collection(db, "users", uid, "digitalTwins");

export async function getDigitalTwinScenarios(uid) {
  try {
    const snapshot = await getDocs(query(scenarios(uid), orderBy("updatedAt", "desc")));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to load saved scenarios."), { cause: error });
  }
}

export async function saveDigitalTwinScenario(uid, scenario) {
  try {
    const scenarioRef = doc(scenarios(uid));
    await setDoc(scenarioRef, { ...scenario, updatedAt: serverTimestamp(), createdAt: serverTimestamp() });
    return { id: scenarioRef.id, ...scenario };
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to save this scenario."), { cause: error });
  }
}

export async function deleteDigitalTwinScenario(uid, scenarioId) {
  try {
    await deleteDoc(doc(db, "users", uid, "digitalTwins", scenarioId));
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to delete this scenario."), { cause: error });
  }
}
