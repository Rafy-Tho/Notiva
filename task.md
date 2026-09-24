You are a senior React frontend architect.

I want you to audit my ENTIRE frontend codebase and determine whether its current structure follows good modern frontend architecture and best practices.

Do NOT immediately refactor or rewrite anything.

First, inspect the existing codebase carefully:

- folder structure
- files and responsibilities
- imports/dependencies between folders
- components
- pages
- layouts
- hooks
- services/API calls
- state management
- validation
- routing
- providers
- utilities
- shared components
- feature-specific components
- API/state/query logic

My intended architecture is:

Feature-based

- Shared components
- Application infrastructure

Target structure:

src/
├── app/
│ ├── App.jsx
│ ├── routes.jsx
│ ├── providers.jsx
│ └── store.js
│
├── features/
│ ├── auth/
│ │ ├── components/
│ │ ├── hooks/
│ │ ├── services/
│ │ └── validation/
│ │
│ ├── notes/
│ │ ├── components/
│ │ ├── hooks/
│ │ ├── services/
│ │ └── validation/
│ │
│ └── users/
│ ├── components/
│ ├── hooks/
│ └── services/
│
├── components/
│ ├── ui/
│ │ ├── Button.jsx
│ │ ├── Input.jsx
│ │ └── Modal.jsx
│ │
│ └── common/
│ ├── Navbar.jsx
│ └── Loading.jsx
│
├── layouts/
│ ├── DashboardLayout.jsx
│ └── AuthLayout.jsx
│
├── pages/
│ ├── HomePage.jsx
│ ├── LoginPage.jsx
│ └── NotFoundPage.jsx
│
├── lib/
│ ├── api.js
│ └── queryClient.js
│
├── hooks/
│ ├── useDebounce.js
│ └── useMediaQuery.js
│
├── utils/
│ ├── formatDate.js
│ └── cn.js
│
├── constants/
│ └── index.js
│
└── main.jsx

IMPORTANT:
This is a reference architecture, NOT a requirement to force every project to exactly match this structure.

Judge the architecture based on responsibilities and dependency boundaries, not simply folder names.

==================================================
AUDIT OBJECTIVES
==================================================

1. FEATURE BOUNDARIES

Check whether domain/business functionality is properly organized by feature.

For example:

features/auth/
features/notes/
features/users/

Determine:

- Which code belongs to a specific feature?
- Which code is incorrectly placed in global/shared folders?
- Whether feature-specific components are leaking into shared components.
- Whether features are too tightly coupled.
- Whether one feature directly imports internal implementation details from another feature.
- Whether a feature has unnecessary dependencies on unrelated features.

Identify cases such as:

BAD:
components/NoteEditor.jsx

when NoteEditor is only used by the notes feature.

Potentially better:
features/notes/components/NoteEditor.jsx

But do not move code merely because it is possible. Consider actual reuse.

================================================== 2. SHARED COMPONENTS

Audit:

src/components/ui/
src/components/common/

Determine whether each component is truly shared.

Distinguish between:

UI primitives:

- Button
- Input
- Modal
- Dialog
- Dropdown
- Badge

Application-wide/common components:

- Navbar
- Loading
- ErrorState
- EmptyState
- PageHeader

Feature-specific components:

- NoteEditor
- NoteList
- LoginForm
- UserProfileForm

Flag components that are incorrectly classified as shared.

Also check whether shared components contain business logic that should belong to a feature.

================================================== 3. PAGES

Audit src/pages/.

Determine what responsibility pages have.

Ideally pages should primarily compose:

- layouts
- feature components
- routing-related data
- page-level orchestration

Check whether pages contain too much:

- business logic
- API calls
- validation
- complex state management
- reusable UI
- feature-specific logic

If a page is doing too much, explain where that responsibility should move.

================================================== 4. APPLICATION INFRASTRUCTURE

Audit:

src/app/

Check:

- App.jsx
- routes.jsx
- providers.jsx
- store.js

Determine whether application-level concerns are correctly placed here.

Examples:

- router configuration
- global providers
- global state configuration
- application bootstrap
- error boundaries
- authentication initialization

Check whether app/ contains feature-specific business logic that should not be there.

================================================== 5. API / SERVICES

Audit all API-related code.

Determine:

- where API clients live
- where feature API services live
- whether generic HTTP configuration is separated from feature API operations
- whether API calls are duplicated
- whether components directly call fetch/axios unnecessarily
- whether services contain business logic that belongs in hooks/services
- whether feature services are correctly scoped

Expected conceptual separation:

lib/api.js
↓
feature service
↓
hook/query/mutation
↓
component/page

Do not assume this exact chain is mandatory. Explain deviations when they are reasonable.

================================================== 6. HOOKS

Audit:

src/hooks/
features/\*/hooks/

Determine whether hooks are correctly classified.

Global/shared hooks should be truly reusable, such as:

- useDebounce
- useMediaQuery
- useClickOutside

Feature hooks should remain inside the feature when they depend on feature-specific logic.

Flag hooks that are placed globally but are actually feature-specific.

Also detect:

- duplicated hooks
- overly complex hooks
- hooks containing inappropriate business logic
- hooks that should be split
- hooks that should remain together

================================================== 7. STATE MANAGEMENT

Audit all state management.

Determine:

- local component state
- feature state
- global state
- server state
- URL state

Check whether the project correctly separates:

UI/local state
vs
global client state
vs
server/cache state.

If React Query/TanStack Query is used, determine whether server data is unnecessarily duplicated into global Zustand/Redux/etc.

Check for:

- unnecessary global state
- duplicated server state
- state that belongs to a feature but is global
- overly large global stores
- incorrect store responsibilities

================================================== 8. VALIDATION

Audit validation code.

Determine whether validation is:

- feature-specific
- shared
- duplicated
- located in the correct layer

For example:

features/auth/validation/

should contain authentication-specific validation.

Shared validation utilities should only contain genuinely reusable rules.

================================================== 9. UTILS / LIB / CONSTANTS

Audit:

src/lib/
src/utils/
src/constants/

Clearly distinguish their responsibilities.

For example:

lib/

- infrastructure/integrations
- API client
- query client
- external library configuration

utils/

- pure reusable helper functions

constants/

- genuinely shared constants

Flag cases where these folders become "miscellaneous dumping grounds."

================================================== 10. DEPENDENCY DIRECTION

Analyze import relationships.

Look for architecture problems such as:

shared → feature

components/ui → auth

utils → feature

global hooks → notes-specific code

feature A → feature B internal implementation

pages → low-level implementation details

Prefer a dependency direction similar to:

app
↓
pages / layouts
↓
features
↓
shared components / lib / utils

However, do not enforce this mechanically.

Explain legitimate exceptions.

================================================== 11. CIRCULAR DEPENDENCIES

Detect:

- circular imports
- indirect circular dependencies
- feature-to-feature cycles
- barrel-file-related cycles

Report the exact dependency chain when possible.

================================================== 12. BARREL FILES

Check index.js/index.jsx files.

Determine whether barrel exports improve the architecture or create:

- circular dependencies
- hidden dependencies
- unnecessarily large imports
- poor tree-shaking
- unclear ownership

Do not automatically recommend removing all barrel files.

================================================== 13. DUPLICATION

Find duplicated:

- components
- hooks
- API functions
- validation
- utilities
- state logic
- loading/error handling

Determine whether duplication should actually be abstracted.

Do NOT recommend abstraction simply because two pieces of code look similar.

Prefer simple code over premature abstraction.

================================================== 14. RESPONSIBILITY VIOLATIONS

For important files, identify whether they have too many responsibilities.

Examples:

Component doing:

- UI
- API request
- validation
- business rules
- state management
- data transformation

Service doing:

- HTTP request
- UI state
- React-specific logic

Utility doing:

- feature-specific business logic

Identify these violations and explain the better boundary.

================================================== 15. ROUTING

Audit React Router configuration.

Check:

- route organization
- layouts
- nested routes
- protected routes
- public routes
- lazy loading
- route-level loading
- error handling
- route/page ownership

Determine whether routing logic is properly separated from feature implementation.

================================================== 16. CODE SPLITTING / PERFORMANCE

Audit:

- lazy loading
- Suspense boundaries
- large imports
- unnecessary re-renders
- unnecessary global state updates
- duplicated API requests
- query/cache usage
- component boundaries

Do not optimize prematurely.

Only report meaningful performance concerns supported by the actual code.

================================================== 17. SECURITY-RELATED FRONTEND STRUCTURE

Audit architectural security concerns such as:

- authentication state handling
- sensitive data stored in localStorage/sessionStorage
- token/cookie handling
- authorization checks
- protected routes
- exposing secrets in frontend code
- unsafe HTML rendering
- insecure API configuration
- client-side-only assumptions about authorization

Do not claim client-side route protection provides backend authorization.

================================================== 18. NAMING AND CONSISTENCY

Check:

- folder naming
- file naming
- component naming
- hook naming
- service naming
- page naming
- consistency between features

Identify inconsistent patterns.

================================================== 19. OVER-ENGINEERING

IMPORTANT:

Do not assume that more folders or abstractions = better architecture.

Look for:

- unnecessary folders
- unnecessary layers
- unnecessary wrapper components
- unnecessary custom hooks
- unnecessary services
- unnecessary abstractions
- excessive indirection

Prefer the simplest architecture that preserves clear responsibilities and scalability.

================================================== 20. ACTUAL CODEBASE VS TARGET STRUCTURE

At the end, compare the actual project against the target architecture.

Create a table:

| Area       | Current Structure | Target Principle   | Status | Reason |
| ---------- | ----------------- | ------------------ | ------ | ------ |
| Features   | ...               | Feature-based      | ...    | ...    |
| Shared UI  | ...               | Truly reusable     | ...    | ...    |
| Pages      | ...               | Composition        | ...    | ...    |
| API        | ...               | Proper separation  | ...    | ...    |
| Hooks      | ...               | Shared vs feature  | ...    | ...    |
| State      | ...               | Correct ownership  | ...    | ...    |
| Routing    | ...               | App infrastructure | ...    | ...    |
| Validation | ...               | Feature ownership  | ...    | ...    |

Use statuses:

GOOD
NEEDS IMPROVEMENT
PROBLEM
NOT APPLICABLE

Do NOT use numeric scores, percentages, rankings, or an overall rating.

================================================== 21. FILE-BY-FILE FINDINGS

For every meaningful problem, report:

File:
Problem:
Why it is a problem:
Current responsibility:
Recommended responsibility:
Suggested location:
Priority:

Priority should only be:

HIGH
MEDIUM
LOW

Do not report trivial style preferences as architectural problems.

================================================== 22. RECOMMENDED STRUCTURE

After the audit, propose an improved folder structure based on the ACTUAL codebase.

Do not blindly copy the example structure.

For example:

src/
├── app/
├── features/
│ ├── auth/
│ ├── notes/
│ └── users/
├── components/
├── layouts/
├── pages/
├── hooks/
├── lib/
└── utils/

But only include folders that are actually justified.

================================================== 23. REFACTOR PLAN

Create a safe refactoring plan.

Group changes into:

Phase 1 — Architecture problems
Phase 2 — Responsibility boundaries
Phase 3 — Folder/file movement
Phase 4 — Dependency cleanup
Phase 5 — Performance improvements
Phase 6 — Cleanup

For every change:

- explain why
- identify affected files
- mention potential risks
- preserve current behavior

Do NOT rewrite the whole application.

================================================== 24. IMPORTANT RULES

Follow these rules throughout the audit:

1. Inspect the actual code before making recommendations.

2. Do not assume the target architecture is automatically correct.

3. Do not force every feature to have:
   components/
   hooks/
   services/
   validation/

   If a feature does not need one of these folders, do not create it.

4. Do not move files just to make the folder tree look cleaner.

5. Judge ownership and dependency boundaries, not folder aesthetics.

6. Preserve existing application behavior.

7. Avoid unnecessary abstraction.

8. Prefer feature ownership for business logic.

9. Keep genuinely reusable UI in shared components.

10. Keep application-wide infrastructure in app/.

11. Keep generic infrastructure/integrations in lib/.

12. Keep pure generic helpers in utils/.

13. Separate server state from client/UI state.

14. Do not duplicate server state unnecessarily.

15. Do not introduce new libraries unless there is a strong reason.

16. Do not introduce TypeScript, Next.js, Docker, or other technologies that are not already part of the project.

17. The project uses React + JavaScript.

18. Prefer @ path aliases when supported by the existing project.

19. Do not change architecture merely because another architecture is possible.

20. Every recommendation must be justified by an actual problem found in the codebase.

==================================================
FINAL OUTPUT
==================================================

Return the audit in this order:

1. Executive Summary
2. Current Architecture Overview
3. Architecture Strengths
4. Architecture Problems
5. Feature Boundary Analysis
6. Shared Component Analysis
7. Pages & Layout Analysis
8. API & Service Analysis
9. Hook Analysis
10. State Management Analysis
11. Routing Analysis
12. Dependency Analysis
13. Performance Analysis
14. Security Architecture Analysis
15. File-by-File Findings
16. Recommended Target Structure
17. Refactoring Plan
18. Final Checklist

Be specific.

Reference actual file paths from the codebase.

Do not give generic React advice unless it directly applies to this project.

Most importantly:

DO NOT MODIFY CODE YET.

This is an architecture audit only.
