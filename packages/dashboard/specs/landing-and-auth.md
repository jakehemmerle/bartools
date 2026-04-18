# Landing And Auth Spec

## Purpose

Provide a simple public website that explains the product and routes users into sign in or sign up.

For MVP, the public surface is purely marketing. Utility begins only after sign in.

## In Scope

- Public landing page
- Sign in page
- Sign up page
- Post-signup onboarding
- Authenticated redirect into the dashboard

## Out Of Scope

- Public product demo surface
- Pricing page
- Blog or content marketing system
- Enterprise contact forms
- Social login unless chosen later

## User Stories

- As a prospect, I want to understand what the product does quickly
- As a prospect, I want a clear way to create an account
- As an existing user, I want to sign in without hunting for the entry point

## Landing Page Content

### Required Sections

- Hero with concise value proposition
- Short explanation of how BarTools works
- Primary CTAs for `Sign up` and `Sign in`
- Lightweight proof section
  Suggested content: screenshot, product flow, or a short list of operational outcomes

### Suggested Message

The message should emphasize:

- Phone-based bottle inventory capture
- Faster inventory checks
- Low-stock visibility and exportable data

## Visual Direction

- The landing page should feel more branded and expressive than the authenticated app
- Mantine components may be used, but they should be customized through the dashboard theme rather than used in their default visual state
- Avoid pill-heavy hero CTAs, badges, tabs, and stat cards unless the element is semantically chip-like

## Landing Page Actions

- `Sign up`
- `Sign in`

## Auth Flows

### Sign Up

- Sign up is self-serve in MVP
- User provides email and password
- Validation errors are shown inline
- On success, user enters a lightweight onboarding flow before landing in `Inventory`
- The authenticated user operates within exactly one bar context in MVP

### Sign In

- User provides email and password
- Invalid credentials show a clear error
- On success, user lands in `Inventory`

### Password Reset

- User can request a password reset from the sign in page
- The MVP auth cut includes a reset request screen and a reset completion screen
- Reset failures should show clear recovery guidance

### Post-Signup Onboarding

- After account creation, the user must establish their bar context before entering the app
- The onboarding flow supports two paths:
  - Create a new bar
  - Join an existing bar

#### Create A New Bar

- Collect bar name
- Collect timezone
- Collect default PAR
- The first user who creates a bar receives the lightweight manager capability for that bar

#### Join An Existing Bar

- Allow the user to join an existing bar via a lightweight invite link flow
- The user should not need to re-enter bar settings when joining an existing bar
- Invite links are shared out-of-band by an existing employee at the bar

### Session Handling

- Signed-in users should not be sent back to the landing page by default
- Signed-out users visiting app routes should be redirected to `Sign in`

## Required States

### Landing

- Default
- Loading only if content is fetched dynamically

### Sign In / Sign Up

- Default
- Submitting
- Validation error
- Authentication failure

### Onboarding

- Choose create or join path
- Create-bar form
- Join-bar form
- Join failure
- Onboarding success

### Password Reset

- Request form
- Request submitted confirmation
- Invalid or expired reset token
- Reset success

## Acceptance Criteria

- A first-time visitor can identify the product purpose in under one screen
- `Sign up` and `Sign in` are visible without scrolling
- Successful auth routes the user to `Inventory`
- Successful signup routes the user through onboarding before `Inventory`
- Protected routes require authentication
- Users can reset a forgotten password in MVP
- The public auth and marketing pages remain usable on desktop, tablet, and phone-sized web layouts
- Core auth flows are keyboard navigable with visible focus states and accessible form labeling
