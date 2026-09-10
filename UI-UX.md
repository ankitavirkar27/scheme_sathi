UI/UX Document
1. Product Overview
Scheme Sathi is a user-focused financing and scheme discovery platform for Indian entrepreneurs. The product helps users evaluate government schemes, compare funding opportunities, and understand financing fit through a clear dashboard and guided workflows.

The UI is designed to reduce complexity for first-time users while keeping advanced information available for users who want detailed scheme matching and explanations.

2. Design Goals
Make scheme discovery feel simple, trustworthy, and actionable
Reduce confusion around eligibility, financial fit, and required documents
Present recommendations in a clear, explainable manner
Keep the experience mobile-friendly and responsive
Support both beginner and advanced users without overwhelming them
Maintain a modern, professional visual identity consistent across screens
3. Target Users
Primary users
Entrepreneurs and small business owners
First-time applicants seeking financial aid
Users exploring government support options
Users comparing schemes before applying
User needs
Understand which schemes may be relevant
View a quick overview of match strength
See reasons behind recommendations
Find next steps and required documentation
Explore partner support and application guidance
4. Core UX Principles
Clarity
Every screen should make the next action obvious. Users should understand what the app is asking, what the result means, and what they should do next.

Trust
The interface should avoid inaccurate claims. Where eligibility is uncertain, the UI clearly communicates that official verification is still required.

Guidance
The product should help users move from exploration to action through recommended schemes, explanations, and next-step suggestions.

Simplicity
The app avoids unnecessary complexity in navigation and reduces cognitive load through clean grouping, card layouts, and consistent labels.

5. User Journey
5.1 New User Journey
User lands on the sign-in screen
User creates an account or signs in with Google
User sees the dashboard with personalized recommendations
User clicks a scheme card to view details
User explores match explanations and relevant documents
User navigates to the scheme matcher or calculator for deeper action
5.2 Returning User Journey
User opens the app
Firebase session restores automatically
Dashboard loads recommended schemes and summary data
User checks partner assistance or profile information
User continues browsing, matching, or applying for support
6. Screen-by-Screen UX
6.1 Authentication Screen
Purpose: Allow users to securely sign in or create an account.

Key UI elements:

Branding area with product name and tagline
Email and password form
Google sign-in option
Secondary actions such as sign-up and password reset
Clear validation states for empty or invalid input
UX behavior:

Provide inline validation messages
Show loading states during sign-in
Display friendly error messages without exposing technical details
Keep the path short and intuitive for returning users
6.2 Dashboard
Purpose: Provide a high-level overview and immediate next steps.

Key elements:

Header with user greeting and logout access
Summary stat cards for key profile insights
Recommended scheme cards
Quick actions leading to matcher, calculator, and partners
Optional support/help card
UX behavior:

Batch key info into simple, scannable blocks
Show recommendation strength with visual indicators
Emphasize most relevant up-front actions
Keep navigation persistent on the left sidebar
6.3 Scheme Matcher
Purpose: Help users evaluate what schemes may fit their situation.

Key elements:

Form for project, income, age, category, loan, and purpose details
Clear field labels and sensible defaults
Submit action for recommendation generation
Result section with ranked scheme suggestions
UX behavior:

Use grouped sections for applicant profile and project details
Validate required inputs before submission
Display results in a ranked order with explanation metadata
Support optional AI assistance without making it mandatory
6.4 Scheme Detail View
Purpose: Give users a deeper explanation of a specific scheme.

Key elements:

Scheme title and summary
Match reasoning
Eligibility highlights
Funding details
Required documents and next steps
Back navigation to the main list
UX behavior:

Keep explanation readable and practical
Separate “why it matches” from “what is missing”
Surface actionable next steps rather than raw policy language
6.5 Financial Calculator
Purpose: Help users estimate financing requirements and project affordability.

Key elements:

Input values for project cost, amount needed, rates, or planning assumptions
Calculation output summary
Simple chart or numbers block as needed
UX behavior:

Use real-time feedback when possible
Avoid overly technical financial jargon
Present calculations clearly with units and formatting
6.6 Channel Partners
Purpose: Help users find support and service providers connected to schemes.

Key elements:

Searchable or filterable partner cards
Basic metadata such as specialty and location
Contact or route information if available
UX behavior:

Show nearby or relevant partners first
Keep cards compact and scannable
Use consistent and readable labels
6.7 Applications
Purpose: Track user journey stages or application-related actions.

Key elements:

Lists or cards representing application progress
Status labels
Needed actions or missing steps
UX behavior:

Keep status categories intuitive and consistent
Use visual emphasis for pending, active, and completed states
6.8 Profile
Purpose: Manage user information relevant to matching.

Key elements:

Personal info fields
Profile completeness indicators
Editable account settings
UX behavior:

Show what is required for better recommendations
Highlight missing profile information to improve eligibility matching
7. Navigation and Information Architecture
The app uses a clear, single-level navigation model with a persistent sidebar.

Navigation structure:

Dashboard
Scheme Matcher
Financial Calculator
Channel Partners
Applications
Profile
This structure reduces complexity and keeps common tasks one click away.

8. Visual Design System
8.1 Color Palette
The project uses a professional, trust-building palette based on a modern finance aesthetic.

Suggested system colors:

Primary: deep indigo / purple
Secondary: slate-gray neutrals
Success: green for positive match states
Warning: amber for caution or missing data
Error: red for invalid or critical states
Background: off-white / soft neutral
8.2 Typography
Clean sans-serif style for modern readability
Hierarchy based on screen role and content importance
Clear labels for inputs, CTAs, and result summaries
8.3 Components
Card-based UI for schemes and partner information
Primary action buttons for major user tasks
Secondary buttons for less critical actions
Status pills for match score or application progress
Divider lines and subtle shadows for hierarchy
8.4 Spacing and Layout
Consistent 8px spacing scale
Use padding and margins to separate content clusters
Card spacing supports quick scanning
Layouts remain readable on desktop and tablet screens
9. Interaction Patterns
Loading states
Use spinners and skeleton-like placeholders to avoid blank interruptions
Keep the user informed when profile or scheme data is being loaded
Empty states
Show friendly messages when no recommendations or partners are found
Suggest the next action instead of leaving the screen unclear
Error states
Display concise, human-readable errors
Avoid exposing raw technical traces to end users
Offer a recovery path such as refresh or retry
Form validation
Validate required fields before submission
Show validation text close to the field
Highlight errors without blocking the full form
10. Accessibility
The interface should adhere to practical accessibility standards:

Sufficient color contrast for text and interactive elements
Keyboard-accessible navigation for all major controls
Focus states for links, buttons, and form inputs
Clear labels for all inputs and actions
Readable font sizes and consistent spacing
11. Responsive Design
The UI should work across common device widths:

Desktop: full dashboard and multi-column layouts
Tablet: balanced content stacking with preserved navigation
Mobile: simplified layout with compact cards and accessible tap targets
The existing layout already follows a dashboard structure that can adapt well to smaller screens through stacked panels and compressed forms.

12. UX Quality Checks
The product should be evaluated against the following:

Can a new user understand the purpose of the app within the first 30 seconds?
Can a user find a scheme recommendation without reading help documentation?
Are recommendation reasons understandable to a non-technical user?
Does the interface communicate uncertainty and official verification clearly?
Are loading, empty, and error states helpful and consistent?
13. UI Acceptance Criteria
Users can sign in or create an account without confusion
Authenticated users reach the dashboard in a single clear flow
Scheme recommendations are displayed with readable match information
Users can open a specific scheme and understand eligibility and next steps
The dashboard remains easy to scan and navigate
Forms provide validation and clear actions
The design remains responsive and consistent across major screen sizes
14. Summary
The UI/UX of Scheme Sathi is centered on trust, clarity, and actionability. The app presents complex government scheme information in a digestible, modern dashboard experience while preserving the ability to review detailed eligibility reasoning and next steps. The overall design supports the product’s goal of making financial scheme discovery more approachable for entrepreneurs.
