# Development Document

## 1. Project Overview
Scheme Sathi is a React and Vite application that helps Indian entrepreneurs discover government and financial assistance schemes. It combines Firebase authentication, Firestore-backed data, deterministic explainable scheme matching, financial planning tools, partner discovery, and an optional AI assistant.

The development approach prioritizes a focused MVP, modular code, secure AI integration, graceful fallbacks, and a clear path from local development to production deployment.

## 2. Development Objectives
- Deliver a reliable authenticated workspace for entrepreneurs
- Provide useful and explainable scheme recommendations
- Keep recommendation scoring deterministic and testable
- Use AI only for natural-language guidance and explanations
- Protect server-side secrets and user data
- Preserve usable fallback behavior when Firebase or AI is unavailable
- Keep the codebase maintainable and easy to extend

## 3. Technology Stack
### Frontend
- React 19
- Vite
- JavaScript and JSX
- CSS
- Lucide React icons

### Backend
- Node.js
- Express
- OpenAI SDK
- dotenv
- CORS

### Services and storage
- Firebase Authentication
- Cloud Firestore
- Local demo data for development and fallback behavior

## 4. Repository Structure
```text
scheme-sathi/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── App.css
│   ├── Components/
│   ├── Pages/
│   ├── firebase/
│   ├── data/
│   └── utils/
├── server/
│   ├── server.js
│   ├── routes/
│   └── services/
├── public/
├── Architecture.md
├── SRS.md
├── UI-UX.md
├── package.json
└── vite.config.js
```

## 5. Local Development Setup
### Prerequisites
- Node.js 18 or newer
- npm
- A Firebase project
- Firebase Authentication enabled
- Firestore database configured
- OpenAI API key for AI functionality

### Installation
```bash
npm install
```

### Environment configuration
Create a local `.env` file using `.env.example` as a reference.

Frontend Firebase variables:
```text
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

Backend-only variable:
```text
OPENAI_API_KEY=...
```

The OpenAI key must remain server-side. It must not be placed in a `VITE_` variable or imported into browser code.

### Start the frontend
```bash
npm run dev
```

### Start the backend
```bash
npm run server
```

The Vite development server proxies `/api` requests to the Express server according to the project configuration.

## 6. Development Workflow
1. Review the related requirement in `SRS.md`.
2. Confirm the intended screen behavior in `UI-UX.md`.
3. Check the owning component or service before editing.
4. Implement the smallest change that satisfies the requirement.
5. Keep UI, domain logic, and backend responsibilities separate.
6. Run focused validation after each implementation slice.
7. Run the full lint and production build before merging.
8. Update documentation when behavior, data, or setup changes.

## 7. Implementation Workstreams

### Workstream A: Application Shell and Authentication
Tasks:
- Maintain Firebase auth state in `App.jsx`
- Support sign-in, sign-up, Google authentication, password reset, and logout
- Restore sessions safely after refresh
- Show authentication loading and error states
- Protect authenticated pages from signed-out access

Completion criteria:
- A new user can create an account
- A returning user can sign in and reach the dashboard
- Logout returns the user to authentication
- Auth failures show a useful message

### Workstream B: User Profile
Tasks:
- Load and update profile data through `userService.js`
- Capture information used by recommendation scoring
- Show missing profile information clearly
- Avoid assuming optional fields exist

Completion criteria:
- Profile data persists for an authenticated user
- Missing values do not crash the app
- Profile changes affect future recommendations

### Workstream C: Scheme Catalogue
Tasks:
- Load schemes from Firestore through `schemeService.js`
- Maintain local demo data for development and fallback
- Normalize optional scheme fields
- Display scheme summaries and details

Completion criteria:
- Schemes render when Firestore is available
- Demo schemes render when Firestore is empty or unavailable
- Scheme details remain readable with incomplete metadata

### Workstream D: Explainable Scheme Matching
Tasks:
- Keep scoring logic in `recommendationService.js`
- Score relevant fields such as age, income, category, location, project type, and loan amount
- Return ranked recommendations
- Return `scoreBreakdown`, `eligibleReasons`, `concerns`, `missingInformation`, `nextSteps`, and documents
- Never treat missing data as guaranteed eligibility

Completion criteria:
- Matching produces stable results for the same inputs
- Each result includes understandable reasoning
- Invalid or incomplete input is handled safely
- The UI distinguishes a match estimate from official approval

### Workstream E: AI Assistant
Tasks:
- Keep the frontend request wrapper in `aiService.js`
- Validate requests in `server/routes/aiRoutes.js`
- Generate responses through `server/services/openaiService.js`
- Send only relevant profile and recommendation context
- Return safe fallback responses when the AI service fails
- Keep `OPENAI_API_KEY` on the server

Completion criteria:
- A user can ask about a recommendation
- The assistant explains existing recommendation data rather than inventing scores
- API validation rejects malformed requests
- Backend failures do not expose stack traces or secrets

### Workstream F: Supporting Workflows
Tasks:
- Maintain the financial calculator
- Display channel partners and distance-aware sorting where available
- Display application status information
- Keep profile, navigation, and scheme detail flows connected

Completion criteria:
- All sidebar destinations load without breaking the app
- Empty and unavailable data states remain usable
- Navigation returns users to the expected workspace context

## 8. Data and Business Rules
- Firebase Authentication is the source of truth for session state.
- Firestore is the preferred source for user, scheme, partner, and application data.
- Local demo data is a fallback, not a replacement for verified official data.
- Recommendation scores are estimates based on available profile and scheme metadata.
- The system must not promise eligibility, funding, approval, or application success.
- Official scheme rules and issuing authority guidance take precedence over application output.
- AI responses must be framed as guidance and should direct users to official verification when appropriate.

## 9. API Development Plan
### `POST /api/ai/chat`
Request shape:
```json
{
  "message": "Why was this scheme recommended?",
  "context": {
    "profile": {},
    "recommendation": {}
  }
}
```

Development requirements:
- Require a non-empty message
- Validate that context is an object when provided
- Limit context to relevant fields
- Handle OpenAI service errors centrally
- Return a stable JSON response shape
- Avoid returning provider-specific internal errors

Future API additions may include authenticated application tracking, document checklists, and analytics, but these are outside the current MVP.

## 10. Testing Strategy
### Static validation
```bash
npm run lint
npm run build
```

### Manual smoke testing
- Open the app while signed out
- Create an account and sign in
- Refresh the page and verify session restoration
- Open every sidebar page
- Load the dashboard with Firebase data available and unavailable
- Submit the scheme matcher with complete and incomplete values
- Open scheme details and inspect explanations
- Ask the AI assistant a recommendation question
- Test the AI service with an unavailable or missing API key
- Sign out and verify protected content is no longer visible

### Test data scenarios
- Complete profile with matching scheme
- Profile with missing income or category
- Scheme with missing optional fields
- Empty scheme collection
- Firestore read failure
- Invalid numeric input
- Empty AI message
- AI provider timeout or API failure

## 11. Bug-Fixing Process
1. Reproduce the issue using the smallest realistic scenario.
2. Identify whether the problem belongs to the UI, domain service, Firebase integration, or backend.
3. Confirm the controlling code path and input values.
4. Fix the root cause without changing unrelated behavior.
5. Run the narrowest relevant check.
6. Run lint and build after the fix.
7. Record any new edge case in the relevant documentation or test plan.

## 12. Milestones
### Milestone 1: Project Setup
Deliverables:
- Dependencies installed
- Firebase environment configured
- Frontend and backend start commands working
- Repository scripts verified

### Milestone 2: Authentication and Shell
Deliverables:
- Login and sign-up flows
- Persistent session handling
- Protected application shell
- Sidebar and navbar navigation

### Milestone 3: Scheme Discovery MVP
Deliverables:
- User profile loading
- Scheme catalogue loading
- Dashboard recommendations
- Scheme detail view
- Demo-data fallback

### Milestone 4: Explainable Matching
Deliverables:
- Deterministic scoring engine
- Score breakdown
- Eligibility reasons and concerns
- Missing information and next steps
- Matcher form integration

### Milestone 5: Secure AI Guidance
Deliverables:
- Express API route
- Server-side OpenAI integration
- Chatbot interface
- Request validation and safe errors
- AI context restrictions

### Milestone 6: Quality and Release
Deliverables:
- Responsive UI review
- Accessibility review
- Manual smoke testing
- Lint and production build passing
- Documentation updated
- Deployment configuration prepared

## 13. Priorities and Dependencies
### P0: Required for MVP
- Authentication
- Dashboard
- Scheme data loading and fallback
- Recommendation scoring
- Scheme details
- Responsive navigation
- Lint and build verification

### P1: Important supporting capability
- AI explanation assistant
- Financial calculator
- Channel partner directory
- Profile completeness guidance
- Application status view

### P2: Future enhancements
- Saved schemes
- Document checklist tracking
- Notifications
- Multi-language content
- Admin scheme management
- Analytics and recommendation feedback

Dependencies:
- Firebase configuration is required for live authentication and Firestore data.
- The AI assistant requires a server-side OpenAI key.
- Official scheme metadata must be reviewed before production use.
- Deployment requires hosting for the frontend and a runtime for the Express backend.

## 14. Deployment Plan
### Frontend
1. Configure production Firebase variables.
2. Run `npm run build`.
3. Deploy the generated `dist/` directory to a static hosting provider.
4. Configure SPA fallback to serve `index.html` for application routes.

### Backend
1. Configure `OPENAI_API_KEY` as a server environment secret.
2. Install production dependencies.
3. Start the Express server with `node server/server.js`.
4. Restrict CORS to approved frontend origins.
5. Add health monitoring and request logging without logging sensitive user data.

### Production checks
- Authentication works on the deployed domain
- Firestore rules allow only intended access
- AI key is absent from browser bundles
- API errors are safe and actionable
- HTTPS is enabled
- Environment variables are configured outside source control

## 15. Definition of Done
A feature is complete when:
- Its behavior matches the SRS and UI/UX documentation
- The implementation is placed in the correct owning layer
- Loading, empty, validation, and error states are handled
- Sensitive data is not exposed
- The feature works with realistic fallback data
- Relevant manual or automated checks pass
- `npm run lint` passes
- `npm run build` passes
- Related documentation is updated

## 16. Out of Scope
The current development plan does not include:
- A Digital Twin page or Digital Twin feature
- Guaranteed eligibility decisions
- Direct loan approval or disbursement
- Full government portal submission automation
- An administrative scheme-management console
- Collection of unnecessary sensitive personal information

## 17. Summary
Development of Scheme Sathi should proceed in small, testable workstreams. The MVP is centered on authentication, scheme discovery, explainable deterministic matching, and practical user guidance. The AI assistant remains a secure supporting feature that explains results and helps users take the next step, while official eligibility rules remain the final authority.
