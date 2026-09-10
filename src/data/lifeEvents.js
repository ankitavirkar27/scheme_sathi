export const LIFE_EVENTS = {
  job_loss: {
    label: "I lost my job",
    currentSituation: "Recently unemployed",
    goal: "Build a new livelihood or self-employment option",
    requiredSupport: ["Skill development", "Entrepreneurship support", "Business loan", "Nearby financial assistance"],
    matcherInput: { projectType: "Services", projectCost: 100000, requiredLoan: 100000, purpose: "self-employment" },
    supportPath: ["Explore self-employment and entrepreneurship schemes.", "Identify a skill course or certification relevant to your work plan.", "Prepare a simple project cost and income plan.", "Check potentially suitable concessional finance options.", "Connect with an authorised bank or channel partner to verify final eligibility."],
  },
  first_business: {
    label: "I want to start my first business",
    currentSituation: "First-time entrepreneur",
    goal: "Start a new business",
    requiredSupport: ["Entrepreneurship support", "Business loan", "Subsidy opportunity", "Nearby financial assistance"],
    matcherInput: { projectType: "Services", projectCost: 250000, requiredLoan: 250000, purpose: "new business" },
    supportPath: ["Check entrepreneurship schemes for new enterprises.", "Complete any required entrepreneurship or skill preparation.", "Prepare your project cost, loan requirement, and basic business plan.", "Review potentially suitable subsidy or concessional finance options.", "Connect with an authorised bank or channel partner to verify final eligibility."],
  },
  struggling_business: {
    label: "My business is struggling",
    currentSituation: "Existing business facing difficulty",
    goal: "Stabilise the business",
    requiredSupport: ["Business loan", "Subsidy opportunity", "Entrepreneurship support", "Nearby financial assistance"],
    matcherInput: { projectType: "Retail", projectCost: 200000, requiredLoan: 150000, purpose: "business support" },
    supportPath: ["Review schemes that may support working capital or business continuity.", "Assess the business issue and prepare recent sales, expense, and repayment records.", "Prepare a revised project cost or working-capital requirement.", "Check potentially suitable concessional finance or subsidy options.", "Connect with an authorised bank or channel partner to verify final eligibility."],
  },
  expand_business: {
    label: "I want to expand my business",
    currentSituation: "Existing entrepreneur planning growth",
    goal: "Expand an existing business",
    requiredSupport: ["Business loan", "Subsidy opportunity", "Entrepreneurship support", "Nearby financial assistance"],
    matcherInput: { projectType: "Manufacturing", projectCost: 750000, requiredLoan: 500000, purpose: "business expansion" },
    supportPath: ["Check schemes that support business expansion.", "Prepare evidence of your existing business activity and growth plan.", "Estimate expansion costs, equipment needs, and loan requirement.", "Review potentially suitable concessional finance and subsidy options.", "Connect with an authorised bank or channel partner to verify final eligibility."],
  },
  completed_education: {
    label: "I completed my education",
    currentSituation: "Recently completed education",
    goal: "Move into employment or entrepreneurship",
    requiredSupport: ["Skill development", "Entrepreneurship support", "Business loan", "Nearby financial assistance"],
    matcherInput: { projectType: "Services", projectCost: 150000, requiredLoan: 150000, purpose: "self-employment" },
    supportPath: ["Identify a career, skill, or entrepreneurship direction.", "Check relevant skill development or certification support.", "Prepare a small project plan if you want to start an enterprise.", "Review potentially suitable entrepreneurship finance options.", "Connect with an authorised bank or channel partner to verify final eligibility."],
  },
  moved_state: {
    label: "I moved to another state",
    currentSituation: "Recently relocated",
    goal: "Re-establish livelihood support in the new state",
    requiredSupport: ["Nearby financial assistance", "Skill development", "Business loan", "Entrepreneurship support"],
    matcherInput: { projectType: "Services", projectCost: 150000, requiredLoan: 150000, purpose: "self-employment" },
    supportPath: ["Confirm your current state and local support options.", "Check skill or livelihood support available in your new location.", "Prepare your project cost and required finance details.", "Review potentially suitable business finance schemes.", "Connect with an authorised local partner to verify final eligibility."],
  },
  income_decreased: {
    label: "My family income has decreased",
    currentSituation: "Household income has decreased",
    goal: "Strengthen household livelihood",
    requiredSupport: ["Subsidy opportunity", "Skill development", "Business loan", "Nearby financial assistance"],
    matcherInput: { projectType: "Services", projectCost: 100000, requiredLoan: 75000, purpose: "livelihood" },
    supportPath: ["Review livelihood, subsidy, and income-support opportunities.", "Identify a practical skill or income-generating activity.", "Prepare a modest project cost and finance requirement.", "Check potentially suitable concessional finance options.", "Connect with an authorised bank or channel partner to verify final eligibility."],
  },
  self_employed: {
    label: "I want to become self-employed",
    currentSituation: "Seeking self-employment",
    goal: "Create a self-employment livelihood",
    requiredSupport: ["Entrepreneurship support", "Skill development", "Business loan", "Nearby financial assistance"],
    matcherInput: { projectType: "Services", projectCost: 150000, requiredLoan: 150000, purpose: "self-employment" },
    supportPath: ["Check self-employment and entrepreneurship schemes.", "Complete any relevant skill or entrepreneurship preparation.", "Prepare a project cost, expected income, and loan requirement.", "Review potentially suitable concessional finance options.", "Connect with an authorised bank or channel partner to verify final eligibility."],
  },
};

export const LIFE_EVENT_OPTIONS = Object.entries(LIFE_EVENTS).map(([id, event]) => ({ id, label: event.label }));

export function getLifeEventJourney(eventId, freeTextGoal = "") {
  const event = LIFE_EVENTS[eventId];
  if (!event) return null;
  const goal = String(freeTextGoal || "").trim() || event.goal;
  return { ...event, goal, requiredSupport: Array.isArray(event.requiredSupport) ? event.requiredSupport : [], supportPath: Array.isArray(event.supportPath) ? event.supportPath : [], matcherInput: { ...event.matcherInput, purpose: goal } };
}
