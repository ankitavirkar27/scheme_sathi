import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, getFriendlyErrorMessage } from "./firestore";

const partnerCollection = collection(db, "channelPartners");

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export async function getChannelPartners() {
  try {
    const snapshot = await getDocs(query(partnerCollection, where("active", "==", true)));
    return snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to load channel partners."));
  }
}

export async function getPartnersByLocation(state, district) {
  try {
    const partners = await getChannelPartners();
    return partners.filter((partner) => {
      const matchesState = !state || (partner.state || "").toLowerCase() === state.toLowerCase();
      const matchesDistrict = !district || (partner.district || "").toLowerCase() === district.toLowerCase();
      return matchesState && matchesDistrict;
    });
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to find partners near your location."));
  }
}

export async function getPartnersForScheme(schemeId) {
  try {
    const partners = await getChannelPartners();
    return partners.filter((partner) => {
      const supported = Array.isArray(partner.schemesSupported) ? partner.schemesSupported : [];
      return supported.includes(schemeId);
    });
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to find scheme partners."));
  }
}

export function sortPartnersByDistance(partners, userLatitude, userLongitude) {
  return [...partners]
    .filter((partner) => Number.isFinite(Number(partner.latitude)) && Number.isFinite(Number(partner.longitude)))
    .map((partner) => ({
      ...partner,
      distanceKm: calculateDistance(
        Number(userLatitude),
        Number(userLongitude),
        Number(partner.latitude),
        Number(partner.longitude),
      ),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
