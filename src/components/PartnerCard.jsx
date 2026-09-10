import { Landmark, MapPin } from "lucide-react";

function PartnerCard({ name, type, location, distance, status }) {
  return <article className="partner-card"><div className="partner-icon"><Landmark size={22} /></div><div className="partner-info"><h3>{name}</h3><p>{type}</p><span><MapPin size={13} /> {location}</span></div><div className="partner-right"><strong>{distance}</strong><span className="partner-status">{status}</span><button>Get directions</button></div></article>;
}

export default PartnerCard;
