const API_BASE_URL = "/api";

function normalizeBackendResponse(payload) {
  const safePayload = payload || {};
  const extracted = safePayload.message || "Unable to get AI guidance right now. Please try again.";

  return {
    success: safePayload.success === true,
    message: extracted,
    error: safePayload.error || "",
  };
}

export async function getAISchemeRecommendation(userProfile, projectData, availableSchemes) {
  const requestBody = {
    message: "Recommend the strongest scheme based on the user's profile and project details and explain the score, concerns, missing information, and next steps.",
    userContext: {
      profile: userProfile || {},
      projectDetails: projectData || {},
    },
    recommendations: Array.isArray(availableSchemes) ? availableSchemes.slice(0, 5) : [],
    selectedScheme: Array.isArray(availableSchemes) && availableSchemes.length ? availableSchemes[0] : {},
  };

  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = normalizeBackendResponse(await response.json().catch(() => ({ success: false, message: "Unable to get AI guidance right now. Please try again." })));

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to get AI guidance right now. Please try again.");
    }

    return {
      type: "ai",
      schemeName: (userProfile && userProfile.name) || "Recommended scheme",
      reasons: [data.message],
      eligibilityScore: 82,
      nextSteps: ["Review the recommendation summary", "Verify the official scheme guideline"],
      aiGenerated: true,
      message: data.message,
    };
  } catch (error) {
    console.error("AI backend error:", error);
    throw error;
  }
}

export async function getEligibilityAnalysis(userProfile, scheme) {
  return {
    isEligible: null,
    matchPercentage: 0,
    gaps: ["AI guidance is unavailable right now."],
    recommendations: ["Please verify the scheme details with official sources."],
    note: "Eligibility should be confirmed with the relevant scheme authority.",
  };
}
