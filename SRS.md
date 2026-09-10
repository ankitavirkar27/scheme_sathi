Software Requirements Specification (SRS)
1. Introduction
1.1 Purpose
The purpose of Scheme Sathi is to help Indian entrepreneurs identify potentially suitable government and financial assistance schemes based on their profile, project details, and financial needs. The system aims to simplify scheme discovery, provide explainable score-based recommendations, and guide users toward the next practical steps without claiming guaranteed eligibility or approval.

1.2 Product Scope
The product supports:

user authentication through Firebase
user profile management
scheme discovery and comparison
deterministic recommendation scoring
explainable recommendation insights
AI-powered guidance for scheme understanding
document preparation guidance
optional channel partner discovery
1.3 Intended Users
Entrepreneurs and small business owners
First-time applicants seeking financial assistance
Users exploring government schemes for business support
Users who need guidance on scheme compatibility, documents, and next steps
1.4 Assumptions and Constraints
The application is a browser-based React + Vite system.
Firebase Authentication and Firestore are used for identity and data persistence.
Scheme data may come from Firestore or a fallback demo dataset when live data is unavailable.
AI guidance is optional and must be server-side secured.
The system must never guarantee official eligibility or approval.
2. Overall Description
2.1 Product Perspective
Scheme Sathi is a standalone web application that helps users evaluate financial support schemes in a clear, guided manner. It combines user profile information, project data, and stored scheme metadata to generate recommendations that are easy to understand and explain.

2.2 Product Functions
The software shall provide:

User authentication and session handling.
A dashboard showing profile-based recommendations and summary statistics.
A scheme matcher with applicant and project inputs.
A recommendation engine with scoring and explanatory metadata.
A scheme detail view with eligibility and document information.
A chatbot that explains recommendations and next steps.
A safe backend API for OpenAI-backed explanation.
Graceful fallback behavior when data is unavailable.
2.3 User Classes
New users creating an account
Returning authenticated users
Users exploring schemes without a complete profile
Users seeking a specific scheme recommendation and next actions
2.4 Operating Environment
Modern browser (Chrome, Edge, Firefox, Safari)
Node.js environment for development and backend server
Firebase project configured for authentication and Firestore access
OpenAI API access configured only on the backend server
3. User Requirements
3.1 Authentication
The system shall allow users to:

sign up using email and password
sign in using email and password
use Google sign-in
reset password when needed
remain authenticated across page refreshes until sign-out
3.2 Dashboard
The system shall display:

a greeting with the user’s name
a list of recommended schemes
summary stat cards
nearby channel partners
quick navigation to scheme matching and other sections
3.3 Scheme Matching
The system shall allow users to input:

project type
estimated project cost
required loan amount
annual income
education level and profile information
business purpose
The system shall then rank schemes according to a deterministic scoring model.

3.4 Explainable Recommendations
For each recommended scheme, the system shall provide:

overall match score
age compatibility reasoning
income compatibility reasoning
category compatibility reasoning
location compatibility reasoning
project type compatibility reasoning
loan fit reasoning
eligible reasons
concerns
missing information
next steps
3.5 AI Assistant
The system shall provide a chatbot that can answer questions such as:

Why was this scheme recommended?
Why am I not fully eligible?
What information is missing?
Explain my match score.
What documents should I prepare?
What should I do next?
The chatbot shall use the current user context and recommendation data but shall not guarantee eligibility or approval.

3.6 Documents Guidance
If document metadata exists, the system shall display relevant documents for the scheme. If no reliable document list is available, it shall clearly state that official verification is required.

4. Functional Requirements
FR-01: User Sign In
The system shall authenticate the user via Firebase Authentication.

FR-02: User Profile Retrieval
The system shall fetch the user’s profile if it exists and fallback safely when it does not.

FR-03: Scheme Loading
The system shall load the active schemes from Firestore and fallback to demo scheme data when necessary.

FR-04: Recommendation Generation
The system shall generate scheme recommendations based on user profile and project data using deterministic logic.

FR-05: Recommendation Explanation
Each recommendation shall include structured metadata explaining the strength and weakness of the match.

FR-06: Safe Missing Data Handling
The system shall handle null, empty, and undefined fields without crashing or causing incorrect eligibility assumptions.

FR-07: AI Chat Endpoint
The system shall expose a backend endpoint for AI chat requests.

FR-08: Secure AI Communication
The system shall send only relevant user and recommendation context to the backend. The OpenAI API key shall remain server-only.

FR-09: AI Error Handling
If the AI service is unavailable, the system shall show a safe fallback response and continue functioning.

FR-10: Scheme Detail View
The system shall provide scheme details including title, description, eligibility context, funding information, and required documents when available.

FR-11: Navigation
The user shall be able to navigate between Dashboard, Scheme Matcher, Calculator, Partners, Applications, and Profile sections.

FR-12: Fallback Data Support
When Firebase or Firestore is unavailable, the app shall continue working with local prototype data.

5. Non-Functional Requirements
5.1 Performance
Dashboard and recommendation rendering shall remain responsive for normal data sizes.
AI requests shall be triggered only on user action.
The app shall not call AI on every render.
Only the most relevant recommendations should be passed to the AI backend.
5.2 Reliability
Missing or incomplete data shall not break app rendering.
Recommendation generation shall gracefully handle empty arrays and missing fields.
The app shall show meaningful fallback messages instead of crashing.
5.3 Security
The OpenAI API key shall never be exposed in the browser.
No internal error stack traces or raw server details shall be exposed to the client.
User context sent to AI shall be limited to relevant scheme and profile data.
5.4 Usability
The interface shall be simple, modern, and easy for first-time users.
Recommendation explanations shall be short, understandable, and practical.
The chatbot shall be easy to open and use without interrupting the current workflow.
5.5 Maintainability
Recommendation logic shall be kept separate from UI code.
Backend AI logic shall be isolated in server-side modules.
Components should remain focused, reusable, and easy to extend.
6. Data Requirements
6.1 User Profile Data
The system may use user fields such as:

name
email
date of birth
category
annual income
education
occupation
state
project type
purpose
loan requirement
6.2 Scheme Data
The system may use fields such as:

name
title
description
category
eligibleCategories
eligibleStates
minAge
maxAge
minIncome
maxIncome
projectTypes
maximumLoanAmount
minimumLoanAmount
interestRate
tenureYears
requiredDocuments
6.3 Data Validation
The system shall validate:

missing or empty strings
missing arrays
invalid numeric values
absent required fields
malformed object payloads in AI requests
7. Functional Use Cases
Use Case 1: Sign In
Actor: User
Goal: access the dashboard
Flow: user enters credentials or clicks Google sign-in; Firebase authenticates the user; authenticated dashboard loads
Use Case 2: View Recommendations
Actor: User
Goal: see recommended schemes
Flow: system loads profile and schemes; recommendation engine ranks them; dashboard displays the top recommendations
Use Case 3: Ask Why a Scheme Was Recommended
Actor: User
Goal: understand recommendation rationale
Flow: user opens chatbot; sends a question; backend uses context and recommendation data; system returns explanation
Use Case 4: Review Missing Information
Actor: User
Goal: see what still needs verification
Flow: system identifies incomplete fields and displays them in the recommendation metadata and chatbot response
Use Case 5: Review Scheme Details
Actor: User
Goal: understand scheme guidance and required documents
Flow: user clicks scheme card; scheme details page loads; system displays eligibility and document list
8. Acceptance Criteria
A user can sign in and view the dashboard without errors.
Recommendations are displayed for a valid profile and active scheme list.
Each recommendation includes a score and explanation data.
The chatbot responds to user questions using live recommendation context.
Missing data does not break the app.
AI requests do not expose secrets in the browser.
If AI is unavailable, the app still works and returns safe messaging.
The interface clearly communicates that scheme approval is not guaranteed.
9. Out of Scope
official government approvals or legal eligibility verification
financial advice beyond informational guidance
deployment to a production environment without environment configuration
full enterprise-grade multi-tenant backend infrastructure
10. Future Enhancements
user-specific document checklist tracking
richer scheme metadata ingestion from official sources
analytics dashboards for recommendation quality
multi-language support
more advanced AI explanations with support-path guidance
11. Summary
Scheme Sathi is intended to provide a practical, explainable, and secure way for users to understand how well they may fit a scheme. The solution combines Firebase-based authentication, deterministic recommendation logic, AI-powered explanation, and safe error handling to create a system that is useful, transparent, and resilient.
