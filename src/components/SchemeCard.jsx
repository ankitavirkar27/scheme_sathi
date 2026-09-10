import { ArrowRight, Landmark } from "lucide-react";

function SchemeCard({ title, description, loan, interest, tenure, recommended, onViewDetails, scheme }) {
  const schemeData = scheme || { title, description, loan, interest, tenure };
  return <article className="scheme-card">
    {recommended && <span className="recommended">Recommended for you</span>}
    <div className="scheme-header"><div className="scheme-icon"><Landmark size={21} /></div><div><h3>{schemeData.name || schemeData.title || title}</h3><p>{schemeData.description || description}</p></div></div>
    <div className="scheme-details"><div><span>Maximum loan</span><strong>{schemeData.loan || loan}</strong></div><div><span>Interest rate</span><strong>{schemeData.interest || interest}</strong></div><div><span>Tenure</span><strong>{schemeData.tenure || tenure}</strong></div></div>
    <button className="scheme-button" onClick={() => onViewDetails?.(schemeData)}>View scheme details <ArrowRight size={15} /></button>
  </article>;
}

export default SchemeCard;
