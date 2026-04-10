# Phase 2 Through Phase 4 Breakdown

## Purpose

Break the next dependency-heavy implementation phases into concrete engineering tasks:

- Phase 2: app shell and styling foundation
- Phase 3: public and auth flows
- Phase 4: settings and access

These phases should be planned together because they define:

- the visual system
- the signed-out to signed-in transition
- the minimum configuration and permissions needed for the operational views to mean anything

## Phase 2: App Shell And Styling Foundation

## Objective

Turn the foundation reset into an intentional product shell that matches the approved dashboard design direction.

## Why This Comes Before Feature Pages

- Public and authenticated pages need stable layout primitives
- Auth, onboarding, inventory, and settings will all reuse the same shell and state components
- If the theme and layout language are left until later, visual cleanup will become expensive

## Concrete Tasks

### 2.1 Theme Token Definition

- Define initial color palette
- Define spacing scale
- Define radius scale
- Define typography stack and sizing
- Define default component density choices

Done means:

- Theme values exist in one clear place
- The app can stop relying on ad hoc per-page styling decisions

### 2.2 Public Shell

- Define public page container behavior
- Define landing/auth page spacing
- Define header/nav treatment for signed-out routes if needed

Done means:

- Landing and auth routes share a coherent shell

### 2.3 Authenticated Shell

- Define top-level app layout
- Define primary nav placement
- Define content container width and padding
- Define mobile/tablet adaptations for the shell

Done means:

- Inventory, Low Stock, Sessions, and Settings have a stable place to live

### 2.4 Shared UI States

- Create reusable empty-state pattern
- Create reusable loading-state pattern
- Create reusable error-state pattern
- Create reusable stale-state treatment
- Keep the tone calm and operational

Done means:

- MVP pages can express state consistently without inventing one-off patterns

### 2.5 Responsive Foundation

- Verify public shell on desktop, tablet, and phone web
- Verify authenticated shell on desktop, tablet, and phone web
- Ensure layout collapse behavior is intentional

Done means:

- The shell works across all required breakpoints before feature density increases

## Phase 2 Suggested Sequence

1. Theme tokens
2. Public shell
3. Authenticated shell
4. Shared state components
5. Responsive verification

## Phase 2 Exit Criteria

- The app clearly reflects the approved visual direction
- The shell is stable enough for feature implementation
- Reusable state and layout components exist for later phases

## Phase 3: Public And Auth Flows

## Objective

Implement the full self-serve account-entry flow from landing page through onboarding.

## Why This Comes Before Operational Views

- It defines the first-time-user experience
- It establishes bar context and lightweight manager capability
- Settings and permissions assume the onboarding outcome already exists

## Concrete Tasks

### 3.1 Landing Page

- Build hero section
- Build short product explanation
- Build lightweight proof section
- Keep the public surface purely marketing

Done means:

- A first-time visitor can understand the product and find sign up/sign in immediately

### 3.2 Sign In

- Build email/password sign-in form
- Add validation and failure states
- Add redirect behavior for signed-out users

Done means:

- Existing users can sign in cleanly

### 3.3 Sign Up

- Build email/password sign-up form
- Add validation states
- Route successful signup into onboarding instead of directly into the app

Done means:

- New users can begin self-serve onboarding

### 3.4 Password Reset

- Build password reset request screen
- Build reset completion screen
- Support invalid or expired reset-token state

Done means:

- Users who forgot their password have a complete recovery path

### 3.5 Onboarding Entry Choice

- Build choice between:
  - create a new bar
  - join an existing bar

Done means:

- The two onboarding paths are explicit and understandable

### 3.6 Onboarding: Create Bar

- Build create-bar form
- Collect:
  - bar name
  - timezone
  - default PAR
- Mark the creating user as initial manager

Done means:

- A new bar can be established with the minimum required configuration

### 3.7 Onboarding: Join Existing Bar

- Build invite-link consumption flow
- Support join failure state
- Ensure the user does not have to re-enter bar settings
- Use fixture-generated invite links during this phase so the join flow is reviewable before real invite generation lands in Phase 4

Done means:

- Additional employees can join an existing bar through a lightweight path

### 3.8 Auth Route Protection

- Protect authenticated routes
- Ensure signed-in users do not bounce back to landing by default

Done means:

- Route behavior matches the approved auth spec

## Phase 3 Suggested Sequence

1. Landing
2. Sign in
3. Sign up
4. Password reset
5. Onboarding entry choice
6. Create-bar onboarding
7. Join-bar onboarding
8. Route protection

Note:

- Real invite-link generation is still implemented in Phase 4
- Phase 3 only needs the invite-link consumption path to be reviewable and coherent

## Phase 3 Exit Criteria

- New-user self-serve flow is coherent from landing to dashboard entry
- Existing users can sign in and reset password
- Onboarding establishes bar context before app entry

## Phase 4: Settings And Access

## Objective

Implement the minimum settings and lightweight access model required for the operational dashboard to behave correctly.

## Why This Comes Before Inventory And Low Stock

- Inventory dates rely on bar timezone
- Low Stock depends on PAR configuration
- Manager and non-manager states need to be defined before the app exposes restricted actions

## Concrete Tasks

### 4.1 Settings Route Foundation

- Create the `Settings` route
- Define section layout for:
  - bar settings
  - product PAR overrides
  - team access

Done means:

- Settings exists as a structured dashboard route

### 4.2 Bar Settings

- Add timezone editing UI
- Add default PAR editing UI
- Define save, success, and error states

Done means:

- A manager can configure bar-wide default settings

### 4.3 Product PAR Override Table

- Add searchable product list
- Show current override or fallback behavior
- Allow add/update/remove override

Done means:

- Product-level PAR is manageable in the dashboard

### 4.4 Invite Link Generation

- Add lightweight invite-link generation UI
- Present the generated link clearly for sharing out-of-band

Done means:

- Existing employees with manager capability can invite coworkers

### 4.5 Manager Capability Grant Flow

- Show existing members
- Allow a manager to grant manager capability to another member
- Keep the UI minimal, not a broad team-management console

Done means:

- The bar is not operationally dependent on one account

### 4.6 Permission States

- Show restricted state for users without `canManageBar`
- Ensure managers see editable settings and team actions
- Ensure non-managers do not see or cannot use restricted controls

Done means:

- Permission behavior is intentional and reviewable

## Phase 4 Suggested Sequence

1. Settings route foundation
2. Bar settings
3. Product PAR overrides
4. Invite link generation
5. Manager capability grant flow
6. Restricted-state verification

## Phase 4 Exit Criteria

- Settings can fully configure the inputs needed by Low Stock
- Manager versus non-manager behavior is clear
- Invite and manager-grant flows are reviewable on localhost

## Combined Exit Criteria For Phases 2 Through 4

- The app shell and theme are stable
- The public and authenticated entry flows are complete
- Bar context and permissions are established through onboarding
- Settings can configure the bar-level inputs the rest of the MVP depends on

## Suggested Validation Gates

- `bun --filter @bartools/dashboard lint`
- `bun --filter @bartools/dashboard build`
- `bun test`

## Suggested Immediate Checklist For These Phases

1. Finalize theme tokens and shell structure
2. Build landing, sign in, sign up, and password reset
3. Build onboarding create/join routes
4. Build settings route and section layout
5. Build timezone/default PAR UI
6. Build product PAR override table
7. Build invite-link generation and manager-grant flow
8. Validate manager and non-manager states across breakpoints
