import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, getFriendlyErrorMessage } from "./firestore";
import { generateSchemeRecommendations } from "./recommendationService";

const schemeCollection = collection(db, "schemes");

export async function getAllSchemes() {
  try {
    const snapshot = await getDocs(query(schemeCollection, where("active", "==", true)));
    return snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
  } catch (error) {
    console.error("Error loading schemes:", error);
    // Return empty array instead of throwing to allow app to continue
    return [];
  }
}

export async function getSchemeById(schemeId) {
  try {
    const snapshot = await getDoc(doc(db, "schemes", schemeId));
    if (!snapshot.exists()) {
      return null;
    }
    return { id: snapshot.id, ...snapshot.data() };
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to load this scheme."));
  }
}

export async function searchSchemes(searchTerm) {
  try {
    const schemes = await getAllSchemes();
    const term = (searchTerm || "").toLowerCase().trim();

    if (!term) {
      return schemes;
    }

    return schemes.filter((scheme) => {
      const searchableText = [
        scheme.name,
        scheme.description,
        scheme.ministry,
        scheme.category,
        scheme.targetBeneficiaries,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(term);
    });
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to search schemes."));
  }
}

export async function getSchemesByCategory(category) {
  try {
    const schemes = await getAllSchemes();
    return schemes.filter((scheme) => (scheme.category || "").toLowerCase() === (category || "").toLowerCase());
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to filter schemes by category."));
  }
}

export async function getSchemesByState(state) {
  try {
    const schemes = await getAllSchemes();
    const targetState = (state || "").toLowerCase();

    return schemes.filter((scheme) => {
      const states = Array.isArray(scheme.eligibleStates) ? scheme.eligibleStates : [];
      return states.some((item) => (item || "").toLowerCase() === targetState);
    });
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to filter schemes by state."));
  }
}

export async function getEligibleSchemes(userProfile = {}, projectDetails = {}) {
  try {
    const schemes = await getAllSchemes();
    return generateSchemeRecommendations(userProfile, projectDetails, schemes);
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to calculate eligible schemes."));
  }
}
