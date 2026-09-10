const number = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function calculateEMI(principal, annualRate, tenureYears) {
  const amount = number(principal);
  const months = Math.max(number(tenureYears) * 12, 1);
  const monthlyRate = number(annualRate) / 1200;
  if (!amount) return 0;
  if (!monthlyRate) return amount / months;
  const factor = (1 + monthlyRate) ** months;
  return (amount * monthlyRate * factor) / (factor - 1);
}

export function calculateEMIToIncomeRatio(emi, monthlyIncome) {
  const income = number(monthlyIncome);
  return income > 0 ? (number(emi) / income) * 100 : 0;
}

export function calculateFinancialRisk(ratio) {
  const burden = number(ratio);
  if (burden < 30) return { label: "LOW", tone: "good" };
  if (burden < 45) return { label: "MODERATE", tone: "caution" };
  if (burden < 60) return { label: "HIGH", tone: "warning" };
  return { label: "VERY HIGH", tone: "danger" };
}

export function calculateDocumentReadiness(documents = []) {
  const required = documents.filter((document) => document.required !== false);
  const completed = required.filter((document) => document.status === "available").length;
  return { total: required.length, completed, missing: required.length - completed, percentage: required.length ? Math.round((completed / required.length) * 100) : 0 };
}

export function calculateApplicationReadiness({ profile, financial, documentReadiness, schemeResults }) {
  const profileFields = ["name", "dateOfBirth", "category", "state", "occupation", "annualIncome"].filter((field) => profile?.[field]);
  const profileScore = Math.round((profileFields.length / 6) * 25);
  const financialScore = financial.risk.label === "LOW" ? 25 : financial.risk.label === "MODERATE" ? 20 : financial.risk.label === "HIGH" ? 12 : 6;
  const schemeScore = schemeResults.length ? Math.min(20, Math.round((schemeResults[0].score || 0) / 5)) : 0;
  const documentScore = Math.round((documentReadiness.percentage / 100) * 30);
  return { total: Math.min(100, profileScore + financialScore + documentScore + schemeScore), profileScore, financialScore, documentScore, schemeScore };
}

export function getScenarioMetrics(scenario) {
  const emi = calculateEMI(scenario.requiredLoan, scenario.interestRate, scenario.tenureYears);
  const ratio = calculateEMIToIncomeRatio(emi, scenario.monthlyIncome);
  return { emi, ratio, risk: calculateFinancialRisk(ratio) };
}

export function getDocumentsForScheme(scheme, profile = {}) {
  const configured = Array.isArray(scheme?.requiredDocuments) ? scheme.requiredDocuments : null;
  const documents = configured?.length ? configured : [
    { id: "identity", name: "Identity proof", description: "Government-issued identity proof", category: "IDENTITY" },
    { id: "address", name: "Address proof", description: "Valid residential address proof", category: "ADDRESS" },
    { id: "income", name: "Income certificate or bank statements", description: "Commonly required financial evidence", category: "INCOME / FINANCIAL" },
    { id: "project", name: "Project report and cost estimate", description: "Recommended business and project details", category: "BUSINESS / PROJECT" },
  ];
  const statuses = profile.documentStatuses || profile.documents || {};
  return documents.map((document, index) => {
    const id = document.id || document.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `document-${index}`;
    const rawStatus = typeof statuses === "object" && !Array.isArray(statuses) ? statuses[id] || statuses[document.name] : null;
    const status = rawStatus === "available" || rawStatus === "pending" ? rawStatus : "missing";
    return { ...document, id, required: document.required !== false, status };
  });
}

export function compareRecommendations(original = [], simulated = []) {
  const originalIds = new Set(original.map((scheme) => scheme.id || scheme.name));
  const simulatedIds = new Set(simulated.map((scheme) => scheme.id || scheme.name));
  return { unlocked: simulated.filter((scheme) => !originalIds.has(scheme.id || scheme.name)), lost: original.filter((scheme) => !simulatedIds.has(scheme.id || scheme.name)) };
}
