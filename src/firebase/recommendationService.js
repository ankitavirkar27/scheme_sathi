import { getFriendlyErrorMessage } from "./firestore";

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeString(value, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }

  const text = String(value).trim();
  return text || fallback;
}

function toLowerArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
    .map((value) => String(value).toLowerCase());
}

function addBreakdownEntry(breakdown, key, score, maxScore, reason) {
  breakdown[key] = {
    score: Number(score) || 0,
    maxScore: Number(maxScore) || 0,
    reason,
  };
}

export function generateSchemeRecommendations(userProfile = {}, projectDetails = {}, schemes = []) {
  const safeSchemes = Array.isArray(schemes) ? schemes : [];
  const profileAge = safeNumber(userProfile.age, safeNumber(userProfile.dateOfBirth ? new Date().getFullYear() - new Date(userProfile.dateOfBirth).getFullYear() : 30, 30));
  const profileIncome = safeNumber(userProfile.income, safeNumber(userProfile.annualIncome, 0));
  const profileCategory = safeString(userProfile.category, "").toLowerCase();
  const profileEducation = safeString(userProfile.education, "").toLowerCase();
  const profileState = safeString(userProfile.state, "").toLowerCase();
  const profileOccupation = safeString(userProfile.occupation, "").toLowerCase();

  const projectType = safeString(projectDetails.projectType, "").toLowerCase();
  const projectCost = safeNumber(projectDetails.projectCost, 0);
  const requiredLoan = safeNumber(projectDetails.requiredLoan, projectCost);
  const purpose = safeString(projectDetails.purpose, "").toLowerCase();

  return safeSchemes
    .map((scheme, index) => {
      const schemeName = safeString(scheme?.name || scheme?.title || `Scheme ${index + 1}`, "Scheme");
      const eligibleCategories = toLowerArray(scheme?.eligibleCategories);
      const eligibleStates = toLowerArray(scheme?.eligibleStates);
      const projectTypes = toLowerArray(scheme?.projectTypes);
      const loanAmount = requiredLoan || projectCost;
      const maxLoanAmount = safeNumber(scheme?.maximumLoanAmount, safeNumber(scheme?.loanAmount, 0));
      const minLoanAmount = safeNumber(scheme?.minimumLoanAmount, 0);
      const minIncome = safeNumber(scheme?.minIncome, 0);
      const maxIncome = safeNumber(scheme?.maxIncome, 0);
      const minAge = safeNumber(scheme?.minAge, 0);
      const maxAge = safeNumber(scheme?.maxAge, 0);

      const scoreBreakdown = {};
      let totalScore = 0;
      const eligibleReasons = [];
      const concerns = [];
      const missingInformation = [];
      const nextSteps = [
        "Review the scheme requirements carefully before proceeding.",
        "Prepare the required documents and supporting records.",
        "Verify the latest official scheme guideline before applying.",
      ];

      if (profileAge > 0 && minAge > 0 && maxAge > 0) {
        if (profileAge >= minAge && profileAge <= maxAge) {
          const earned = 20;
          totalScore += earned;
          addBreakdownEntry(scoreBreakdown, "age", earned, 20, "Your age falls within the configured age range for this scheme.");
          eligibleReasons.push("Age is within the configured range for this scheme.");
        } else {
          addBreakdownEntry(scoreBreakdown, "age", 0, 20, "Age may fall outside the configured age range for this scheme.");
          concerns.push("Age may fall outside the scheme's configured age window.");
        }
      } else {
        addBreakdownEntry(scoreBreakdown, "age", 0, 20, "Age criteria is not available in the current scheme data.");
        missingInformation.push("Age information is missing or not clearly available for this scheme.");
      }

      if (profileIncome > 0 && (minIncome > 0 || maxIncome > 0)) {
        if (profileIncome <= maxIncome || (maxIncome === 0 && profileIncome >= minIncome)) {
          const earned = 20;
          totalScore += earned;
          addBreakdownEntry(scoreBreakdown, "income", earned, 20, "Income appears aligned with the scheme thresholds based on the current profile.");
          eligibleReasons.push("Income is aligned with the configured limits for this scheme.");
        } else {
          addBreakdownEntry(scoreBreakdown, "income", 0, 20, "Income may be above the scheme threshold or needs final verification.");
          concerns.push("Income may exceed the scheme's preferred eligibility limit.");
        }
      } else {
        addBreakdownEntry(scoreBreakdown, "income", 0, 20, "Income criteria is not available in the current scheme data.");
        missingInformation.push("Income information required to confirm this criterion is not available.");
      }

      if (profileCategory && eligibleCategories.length > 0) {
        if (eligibleCategories.includes(profileCategory)) {
          const earned = 15;
          totalScore += earned;
          addBreakdownEntry(scoreBreakdown, "category", earned, 15, "Your category matches one of the scheme's eligible beneficiary groups.");
          eligibleReasons.push("Category matches the targeted beneficiary group.");
        } else {
          addBreakdownEntry(scoreBreakdown, "category", 0, 15, "Category data does not clearly match the scheme's configured beneficiary group.");
          concerns.push("Category may not match all target beneficiary conditions.");
        }
      } else if (!profileCategory) {
        addBreakdownEntry(scoreBreakdown, "category", 0, 15, "Category information is not available in the current profile.");
        missingInformation.push("Category details are not available, so this match should be verified.");
      } else {
        addBreakdownEntry(scoreBreakdown, "category", 0, 15, "Category criteria is not available in the current scheme data.");
        missingInformation.push("Scheme category criteria is missing from the stored record.");
      }

      if (profileEducation || profileOccupation) {
        const educationDescription = safeString(scheme?.targetBeneficiaries || scheme?.description || "").toLowerCase();
        const combinedText = `${profileEducation} ${profileOccupation} ${educationDescription}`;
        const educationMatch = [profileEducation, profileOccupation].some((value) => value && combinedText.includes(value));

        if (educationMatch) {
          const earned = 10;
          totalScore += earned;
          addBreakdownEntry(scoreBreakdown, "education", earned, 10, "Education or occupation information appears supportive of the scheme profile.");
          eligibleReasons.push("Profile qualifications or occupation align with the target beneficiary profile.");
        } else {
          addBreakdownEntry(scoreBreakdown, "education", 0, 10, "Education or occupation data is only partially aligned with this scheme's target users.");
          concerns.push("Education or occupation information may need a final review for this scheme.");
        }
      } else {
        addBreakdownEntry(scoreBreakdown, "education", 0, 10, "Education or occupation details are not available in the current profile.");
        missingInformation.push("Education or occupation information is missing for a clearer eligibility review.");
      }

      if (profileState && eligibleStates.length > 0) {
        if (eligibleStates.includes(profileState)) {
          const earned = 10;
          totalScore += earned;
          addBreakdownEntry(scoreBreakdown, "location", earned, 10, "Your state matches the scheme's configured eligible geography.");
          eligibleReasons.push("State appears eligible under the current scheme data.");
        } else {
          addBreakdownEntry(scoreBreakdown, "location", 0, 10, "State information may not match the scheme's available geography.");
          concerns.push("State eligibility may be limited or require additional verification.");
        }
      } else if (!profileState) {
        addBreakdownEntry(scoreBreakdown, "location", 0, 10, "State information is not available in the current profile.");
        missingInformation.push("Current location details are missing, which affects the state-eligibility check.");
      } else {
        addBreakdownEntry(scoreBreakdown, "location", 0, 10, "Location criteria is not available in the current scheme data.");
        missingInformation.push("State or location eligibility details are not available in the stored scheme record.");
      }

      if (projectType && projectTypes.length > 0) {
        if (projectTypes.includes(projectType)) {
          const earned = 15;
          totalScore += earned;
          addBreakdownEntry(scoreBreakdown, "projectType", earned, 15, "Your project type matches the industries supported by this scheme.");
          eligibleReasons.push("Project type aligns with the scheme's support area.");
        } else {
          addBreakdownEntry(scoreBreakdown, "projectType", 0, 15, "Project type may only be partially aligned with the scheme's support categories.");
          concerns.push("Project type may need further review against the official scheme conditions.");
        }
      } else if (!projectType) {
        addBreakdownEntry(scoreBreakdown, "projectType", 0, 15, "Project type is not available in the current profile.");
        missingInformation.push("Project type data is missing, which limits the assessment confidence.");
      } else {
        addBreakdownEntry(scoreBreakdown, "projectType", 0, 15, "Project type criteria is not available in the current scheme data.");
        missingInformation.push("Project-type requirements are not clearly stored for this scheme.");
      }

      if (loanAmount > 0 && (maxLoanAmount > 0 || minLoanAmount > 0)) {
        if (loanAmount <= maxLoanAmount && (minLoanAmount === 0 || loanAmount >= minLoanAmount)) {
          const earned = 10;
          totalScore += earned;
          addBreakdownEntry(scoreBreakdown, "loan", earned, 10, "Requested loan requirement appears compatible with the scheme's funding range.");
          eligibleReasons.push("Loan requirement is compatible with the scheme funding range.");
        } else {
          addBreakdownEntry(scoreBreakdown, "loan", 0, 10, "Loan requirement may be outside the current scheme's funding guidance and may need review.");
          concerns.push("Loan size may need adjustment or a different scheme may be more suitable.");
        }
      } else {
        addBreakdownEntry(scoreBreakdown, "loan", 0, 10, "Loan requirement data is not available in the current profile.");
        missingInformation.push("Loan amount information is missing for a precise funding-fit assessment.");
      }

      if (purpose) {
        const schemeText = safeString(scheme?.description || scheme?.name || "").toLowerCase();
        if (schemeText.includes(purpose) || purpose.includes("business") || purpose.includes("enterprise")) {
          const earned = 5;
          totalScore += earned;
          addBreakdownEntry(scoreBreakdown, "purpose", earned, 5, "Purpose appears aligned with the scheme's stated objective.");
          eligibleReasons.push("Business purpose appears aligned with the scheme objective.");
        } else {
          addBreakdownEntry(scoreBreakdown, "purpose", 0, 5, "Purpose is not clearly matched in the current scheme description.");
          concerns.push("Purpose may need final verification against the scheme objective.");
        }
      } else {
        addBreakdownEntry(scoreBreakdown, "purpose", 0, 5, "Purpose information is not available in the current profile.");
        missingInformation.push("Business purpose details are missing for a stronger match explanation.");
      }

      if (Object.keys(scoreBreakdown).length === 0) {
        addBreakdownEntry(scoreBreakdown, "general", 0, 100, "No scoring fields were available in the current scheme data.");
      }

      const normalizedScore = Math.max(0, Math.min(100, Math.round(totalScore)));
      const uniqueReasons = Array.from(new Set(eligibleReasons)).slice(0, 6);
      const uniqueConcerns = Array.from(new Set(concerns)).slice(0, 4);
      const uniqueMissing = Array.from(new Set(missingInformation)).slice(0, 5);

      if (normalizedScore >= 70) {
        nextSteps.unshift("This recommendation appears potentially suitable based on the current profile and scheme data.");
      } else if (normalizedScore >= 40) {
        nextSteps.unshift("This appears to be a partial or moderate fit and should be verified with official rules.");
      } else {
        nextSteps.unshift("This is not a strong match based on the current information and may require a different scheme.");
      }

      return {
        ...scheme,
        id: scheme?.id || `scheme-${index}`,
        name: schemeName,
        title: schemeName,
        score: normalizedScore,
        scoreBreakdown,
        eligibleReasons: uniqueReasons.length ? uniqueReasons : ["This scheme appears broadly relevant based on the available information."],
        concerns: uniqueConcerns.length ? uniqueConcerns : ["Final eligibility should still be verified against the official scheme rules."],
        missingInformation: uniqueMissing.length ? uniqueMissing : ["The current scheme data does not provide enough detail to confirm every criterion."],
        nextSteps,
        requiredDocuments: Array.isArray(scheme?.requiredDocuments) && scheme.requiredDocuments.length ? scheme.requiredDocuments : [],
        reasons: [...uniqueReasons, ...uniqueConcerns].slice(0, 6),
      };
    })
    .filter((scheme) => Number(scheme?.score || 0) > 0 || Boolean(scheme?.active))
    .sort((a, b) => Number(b?.score || 0) - Number(a?.score || 0));
}

export async function getRecommendationSummary(userProfile, projectDetails, schemes) {
  try {
    return generateSchemeRecommendations(userProfile, projectDetails, schemes);
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error, "Unable to generate recommendations."));
  }
}
