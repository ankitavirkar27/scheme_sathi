import OpenAI from "openai";

const SYSTEM_PROMPT = `You are Scheme Sathi AI Assistant.

You help users understand potentially suitable financial and government schemes based only on the structured scheme data and recommendation context provided.

You must never claim official eligibility, guaranteed approval, guaranteed loan approval, or government endorsement.

Always distinguish between:
1. Matching criteria
2. Potential concerns
3. Missing information
4. Criteria that are not available in the current data

Do not invent scheme rules that are not provided.

If information is unavailable, clearly say:
'This information is not available in the current scheme data and should be verified through official sources.'

Explain results in simple, concise, user-friendly language.

When explaining a scheme recommendation:
- Mention the overall match score
- Explain the strongest matching factors
- Mention concerns or possible mismatches
- Mention missing information
- Give practical next steps

Do not provide legal, financial, or official government approval guarantees.

Use Indian financial formatting where appropriate.

Keep answers structured and easy to read.`;

function safeString(value, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value).trim() || fallback;
}

function serializeRecommendation(recommendation) {
  if (!recommendation || typeof recommendation !== "object") {
    return "No scheme details available.";
  }

  const scoreBreakdown = recommendation.scoreBreakdown || {};
  const scoreSummary = Object.entries(scoreBreakdown)
    .map(([key, value]) => `${key}: ${value?.score ?? 0}/${value?.maxScore ?? 0}`)
    .join("; ");

  return {
    name: safeString(recommendation.name || recommendation.title || recommendation.schemeName, "Unknown scheme"),
    score: recommendation.score || 0,
    scoreBreakdown: scoreSummary || "Not available",
    eligibleReasons: Array.isArray(recommendation.eligibleReasons) ? recommendation.eligibleReasons : [],
    concerns: Array.isArray(recommendation.concerns) ? recommendation.concerns : [],
    missingInformation: Array.isArray(recommendation.missingInformation) ? recommendation.missingInformation : [],
    nextSteps: Array.isArray(recommendation.nextSteps) ? recommendation.nextSteps : [],
    requiredDocuments: Array.isArray(recommendation.requiredDocuments) ? recommendation.requiredDocuments : [],
  };
}

export async function generateSchemeChatResponse({ message, userContext = {}, recommendations = [], selectedScheme = {}, supportPath = null }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key is not configured on the server.");
  }

  const openai = new OpenAI({ apiKey });
  const safeMessage = safeString(message, "");
  const safeUserContext = userContext && typeof userContext === "object" ? userContext : {};
  const userProfile = safeUserContext.profile || {};
  const projectDetails = safeUserContext.projectDetails || {};
  const selected = selectedScheme && typeof selectedScheme === "object" ? selectedScheme : {};
  const topRecommendations = Array.isArray(recommendations) ? recommendations.slice(0, 5).map(serializeRecommendation) : [];
  const selectedRecommendation = selected && Object.keys(selected).length ? serializeRecommendation(selected) : (topRecommendations[0] || null);
  const safeSupportPath = supportPath && typeof supportPath === "object" ? {
    currentSituation: safeString(supportPath.currentSituation, ""),
    goal: safeString(supportPath.goal, ""),
    requiredSupport: Array.isArray(supportPath.requiredSupport) ? supportPath.requiredSupport : [],
    steps: Array.isArray(supportPath.steps) ? supportPath.steps : [],
  } : null;

  const prompt = `
User question: ${safeMessage}

Profile context:
${JSON.stringify({
  name: safeUserContext.name || userProfile.name || "",
  age: userProfile.age || userProfile.dateOfBirth || "",
  annualIncome: userProfile.annualIncome || userProfile.income || "",
  category: userProfile.category || "",
  education: userProfile.education || "",
  occupation: userProfile.occupation || "",
  state: userProfile.state || "",
}, null, 2)}

Project context:
${JSON.stringify(projectDetails, null, 2)}

Selected scheme:
${JSON.stringify(selectedRecommendation, null, 2)}

Top recommendations:
${JSON.stringify(topRecommendations, null, 2)}

Deterministically generated support path (explain it, but do not add, replace, or invent its steps or support categories):
${JSON.stringify(safeSupportPath, null, 2)}

Answer the user's question using the information above. If there is no clear answer in the data, explain that the current scheme data is not sufficient and recommend official verification. Do not claim official approval or eligibility. Keep the reply concise, helpful, and structured.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    max_tokens: 500,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });

  const answer = response.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error("No answer was returned by the AI model.");
  }

  return answer;
}
