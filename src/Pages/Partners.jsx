import { useEffect, useMemo, useState } from "react";
import PartnerCard from "../Components/PartnerCard";
import demoPartners from "../data/partners";
import { getChannelPartners, sortPartnersByDistance } from "../firebase/partnerService";
import { getUserProfile } from "../firebase/userService";

function Partners({ user }) {
  const [partners, setPartners] = useState(demoPartners);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPartners = async () => {
      if (!user?.uid) return setLoading(false);
      try {
        const [userProfile, livePartners] = await Promise.all([getUserProfile(user.uid).catch(() => null), getChannelPartners().catch(() => [])]);
        setProfile(userProfile || {});
        // The static directory keeps the prototype usable before live partners are configured.
        setPartners(livePartners.length ? livePartners : demoPartners);
      } finally { setLoading(false); }
    };
    loadPartners();
  }, [user]);

  const displayedPartners = useMemo(() => {
    if (partners === demoPartners) return demoPartners;
    const sorted = sortPartnersByDistance(partners, Number(profile?.latitude || 28.6139), Number(profile?.longitude || 77.209));
    return sorted.length ? sorted : partners;
  }, [partners, profile]);

  if (loading) return <div className="empty-result"><h2>Loading partners...</h2></div>;

  return <div>
    <div className="page-heading"><p className="eyebrow">CHANNEL FINANCE NETWORK</p><h1>Find a Channel Partner</h1><p>Locate authorized agencies and financial institutions near you.</p></div>
    <div className="location-bar"><div>📍 <strong>{profile?.city || "New Delhi"}</strong><span> · Searching within 25 km</span></div><button>Change Location</button></div>
    <div className="partner-list">
      {displayedPartners.map((partner) => <PartnerCard key={partner.id} name={partner.name} type={partner.type} location={partner.location || `${partner.city || ""}, ${partner.state || ""}`} distance={partner.distance || `${Number(partner.distanceKm || 0).toFixed(1)} km`} status={partner.active ? "Eligible" : "Unavailable"} />)}
    </div>
  </div>;
}

export default Partners;
