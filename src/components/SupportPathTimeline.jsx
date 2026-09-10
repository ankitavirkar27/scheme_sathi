function SupportPathTimeline({ currentSituation, goal, requiredSupport, steps }) {
  const safeSupport = Array.isArray(requiredSupport) ? requiredSupport : [];
  const safeSteps = Array.isArray(steps) ? steps : [];
  return <section className="support-path" aria-live="polite"><p className="eyebrow">YOUR PERSONAL SUPPORT PATH</p><h2>{currentSituation}</h2><p className="support-goal">Goal: {goal}</p><div className="support-tags">{safeSupport.map((item) => <span key={item}>{item}</span>)}</div><ol className="support-path-steps">{safeSteps.map((step, index) => <li key={`${index}-${step}`}><strong>Step {index + 1}</strong><span>{step}</span></li>)}</ol><p className="support-disclaimer">These are potentially suitable next steps based on the information available. Final eligibility should be verified with official scheme rules and authorised partners.</p></section>;
}

export default SupportPathTimeline;
