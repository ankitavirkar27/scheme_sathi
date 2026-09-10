import { useEffect, useState } from "react";
import { ScanSearch } from "lucide-react";
import LifeEventSelector from "../Components/LifeEventSelector";
import SchemeAIChatbot from "../Components/SchemeAIChatbot";
import SupportPathTimeline from "../Components/SupportPathTimeline";
import { getLifeEventJourney } from "../data/lifeEvents";
import demoSchemes from "../data/schemes";
import { generateSchemeRecommendations } from "../firebase/recommendationService";
import { getAllSchemes } from "../firebase/schemeService";
import { getUserProfile } from "../firebase/userService";

function getAge(dateOfBirth) {
  const date = dateOfBirth?.toDate ? dateOfBirth.toDate() : new Date(dateOfBirth);
  if (!dateOfBirth || Number.isNaN(date.getTime())) return 30;
  const today = new Date();
  return today.getFullYear() - date.getFullYear() - (today < new Date(today.getFullYear(), date.getMonth(), date.getDate()) ? 1 : 0);
}

function SchemeMatcher({ user }) {
  const [mode, setMode] = useState("questions");
  const [form, setForm] = useState({ projectType: "", projectCost: "", requiredLoan: "", income: "", education: "", purpose: "" });
  const [profile, setProfile] = useState({});
  const [schemes, setSchemes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [journey, setJourney] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [freeTextGoal, setFreeTextGoal] = useState("");
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadData() {
      if (!user?.uid) { if (active) { setSchemes(demoSchemes); setLoading(false); } return; }
      try {
        const [userProfile, availableSchemes] = await Promise.all([getUserProfile(user.uid).catch(() => ({})), getAllSchemes().catch(() => [])]);
        if (!active) return;
        const nextProfile = userProfile || {};
        setProfile(nextProfile);
        setSchemes(Array.isArray(availableSchemes) && availableSchemes.length ? availableSchemes : demoSchemes);
        setForm((current) => ({ ...current, income: nextProfile.annualIncome || "", education: nextProfile.education || "" }));
      } catch { if (active) setError("Unable to load data. Please refresh the page."); } finally { if (active) setLoading(false); }
    }
    loadData();
    return () => { active = false; };
  }, [user?.uid]);

  const makeApplicant = (income, education) => ({ age: getAge(profile?.dateOfBirth), income: Number(income || profile?.annualIncome || 0), category: profile?.category || "General", education: education || profile?.education || "", state: profile?.state || "", occupation: profile?.occupation || "" });
  const runMatcher = (applicant, project) => generateSchemeRecommendations(applicant, project, Array.isArray(schemes) && schemes.length ? schemes : demoSchemes);

  const findScheme = () => {
    const projectCost = Number(form.projectCost || 0);
    if (!form.projectType || !projectCost || !form.income) { setFormError("Add your project type, estimated cost, and annual income to start matching."); return; }
    setMatching(true); setFormError(""); setJourney(null);
    const project = { projectType: form.projectType, projectCost, requiredLoan: Number(form.requiredLoan || projectCost), purpose: form.purpose || "business" };
    const result = runMatcher(makeApplicant(form.income, form.education), project);
    setRecommendations(Array.isArray(result) ? result : []); setMatching(false);
  };

  const findLifeEventSupport = () => {
    const nextJourney = getLifeEventJourney(selectedEvent, freeTextGoal);
    if (!nextJourney) return;
    setMatching(true); setFormError("");
    // Existing deterministic engine call: generateSchemeRecommendations(applicant, event.matcherInput, catalogue).
    const result = runMatcher(makeApplicant(), nextJourney.matcherInput);
    setJourney(nextJourney); setRecommendations(Array.isArray(result) ? result : []); setMatching(false);
  };

  if (loading) return <div className="empty-result page-skeleton"><div className="skeleton-orb" /><h2>Preparing your matcher...</h2></div>;
  if (error) return <div className="empty-result"><div className="ai-circle">!</div><h2>Unable to load recommendations</h2><p>{error}</p><button className="primary-button" onClick={() => window.location.reload()}>Refresh page</button></div>;
  const primaryResult = recommendations[0] || null;
  const confidence = Math.min(Number(primaryResult?.score || 0), 100);

  return <div className="matcher-page"><div className="page-heading animate-in"><p className="eyebrow">SCHEME MATCHER</p><h1>Find potentially suitable support</h1><p>Answer questions or describe your current situation. Results are based on the information available; final eligibility should be verified.</p></div>
    <div className="matcher-mode-tabs" role="tablist"><button type="button" className={mode === "questions" ? "active" : ""} onClick={() => setMode("questions")} role="tab" aria-selected={mode === "questions"}>Answer questions</button><button type="button" className={mode === "situation" ? "active" : ""} onClick={() => setMode("situation")} role="tab" aria-selected={mode === "situation"}>Describe your situation</button></div>
    <div className="matcher-container"><div className="matcher-form animate-in">{mode === "questions" ? <><h2>Tell us about your requirements</h2><div className="form-group"><label>Project Type</label><select name="projectType" value={form.projectType} onChange={(event) => setForm({ ...form, [event.target.name]: event.target.value })}><option value="">Select project type</option>{["Dairy", "Retail", "Textiles", "Manufacturing", "Services"].map((item) => <option key={item}>{item}</option>)}</select></div><div className="form-group"><label>Estimated Project Cost</label><div className="input-prefix"><span>₹</span><input type="number" name="projectCost" value={form.projectCost} onChange={(event) => setForm({ ...form, [event.target.name]: event.target.value })} /></div></div><div className="form-group"><label>Required Loan Amount</label><div className="input-prefix"><span>₹</span><input type="number" name="requiredLoan" value={form.requiredLoan} onChange={(event) => setForm({ ...form, [event.target.name]: event.target.value })} /></div></div><div className="form-group"><label>Annual Family Income</label><div className="input-prefix"><span>₹</span><input type="number" name="income" value={form.income} onChange={(event) => setForm({ ...form, [event.target.name]: event.target.value })} /></div></div><div className="form-group"><label>Education Status</label><select name="education" value={form.education} onChange={(event) => setForm({ ...form, [event.target.name]: event.target.value })}><option value="">Select status</option>{["School", "College", "Graduate", "Post Graduate"].map((item) => <option key={item}>{item}</option>)}</select></div><div className="form-group"><label>Purpose</label><input name="purpose" value={form.purpose} onChange={(event) => setForm({ ...form, [event.target.name]: event.target.value })} placeholder="e.g. business expansion" /></div><button className="primary-button full" onClick={findScheme} disabled={matching}><ScanSearch size={16} /> Find matching schemes</button></> : <LifeEventSelector selectedEvent={selectedEvent} freeTextGoal={freeTextGoal} onSelectEvent={setSelectedEvent} onGoalChange={setFreeTextGoal} onSubmit={findLifeEventSupport} loading={matching} />}{formError && <p className="inline-feedback error">{formError}</p>}</div>
      <div className="matcher-result animate-in">{matching ? <div className="ai-scanning"><div className="scanner-orb"><ScanSearch size={27} /></div><h2>Finding suitable support</h2><p>Applying your information to the existing scheme recommendation engine.</p></div> : journey ? <SupportPathTimeline currentSituation={journey.currentSituation} goal={journey.goal} requiredSupport={journey.requiredSupport} steps={journey.supportPath} /> : !primaryResult ? <div className="empty-result"><div className="ai-circle"><ScanSearch size={28} /></div><h2>Your recommendation will appear here</h2><p>Complete the form or choose a current situation to find potentially suitable schemes.</p></div> : <div className="result-card animate-result"><span className="recommended">Potentially suitable match</span><h2>{primaryResult.name || primaryResult.title}</h2><p>{primaryResult.description}</p><div className="confidence-block"><div className="confidence-heading"><span>Match score</span><strong>{confidence}%</strong></div><div className="confidence-track"><span style={{ width: `${confidence}%` }} /></div></div><div className="result-stats"><div><span>Loan</span><strong>₹{Number(primaryResult.maximumLoanAmount || 0).toLocaleString("en-IN")}</strong></div><div><span>Interest</span><strong>{primaryResult.interestRate || "—"}%</strong></div><div><span>Score</span><strong>{confidence}/100</strong></div></div>{Array.isArray(primaryResult.eligibleReasons) && <ul className="recommendation-list">{primaryResult.eligibleReasons.map((reason, index) => <li key={`${index}-${reason}`}>{reason}</li>)}</ul>}<p className="support-disclaimer">Potentially suitable based on the information available. Final eligibility should be verified.</p></div>}</div></div>
    <SchemeAIChatbot profile={profile} recommendations={recommendations} schemes={schemes} selectedScheme={primaryResult} supportPath={journey ? { currentSituation: journey.currentSituation, goal: journey.goal, requiredSupport: journey.requiredSupport, steps: journey.supportPath } : null} /></div>;
}

export default SchemeMatcher;
