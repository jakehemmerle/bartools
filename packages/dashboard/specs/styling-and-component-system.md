# Styling And Component System

## Purpose

Define the visual rules for the web dashboard before implementation starts so the product does not default into a generic SaaS admin look.

## Foundation Decision

Mantine is the chosen component foundation for the dashboard.

Reasons:

- It provides enough components to move quickly on a dashboard MVP
- It is themeable enough to avoid shipping Mantine defaults as the final product language
- It is web-first, which keeps the dashboard free to evolve separately from the current React Native-based shared UI package

## Principle

Use Mantine for structure, accessibility, and behavior. Do not use Mantine defaults as the design language.

## Desired Product Feel

The dashboard should feel:

- Clear
- Operational
- Intentional
- Slightly premium
- Operational utility with a little polish

The dashboard should not feel:

- Like a generic AI admin template
- Overly soft or bubbly
- Pill-heavy
- Dribbble-first and operator-second

## Surface Strategy

### Public Landing Surface

- More expressive typography
- Stronger layout moments
- More contrast and storytelling
- Slightly more visual personality than the signed-in app
- Purely marketing in purpose

### Authenticated App Surface

- Denser and calmer
- Built for scanning and action
- Uses hierarchy and spacing more than decorative chrome
- Purely utility-focused in purpose

## Typography Strategy

- MVP uses one shared typography system across the public site and the authenticated app
- The landing page may use that shared system more expressively, but should not introduce a separate type language

## Core Rules

### Radius

- Default radius should be small to medium
- `rounded-full` styling is not a default pattern
- Full-pill shapes should be reserved for true chips, avatars, and status dots if needed

### Buttons

- Primary actions should look decisive, not bubbly
- Avoid oversized rounded buttons on data-heavy pages
- Limit the number of button variants used across MVP

### Badges And Pills

- Do not solve hierarchy by adding a badge to every row or card
- Use badges only when a compact semantic label is truly needed
- Low-stock state should not depend on a colorful badge alone

### Cards

- Do not wrap every section in a softly shadowed card by default
- Prefer layout structure, dividers, and spacing before introducing cards
- When cards are used, they should support grouping or emphasis, not decorate empty space

### Tables

- Tables are a first-class primitive in the authenticated app
- Favor strong headers, consistent row height, and restrained borders
- Avoid cardifying tabular data on desktop unless responsive layout requires it

### Color

- Use a restrained palette
- Accent color should be chosen intentionally and not default to generic blue or purple without review
- Warning and low-stock colors must remain legible and not overpower the page

### Typography

- Commit to a dashboard font stack intentionally
- Heading scale should create hierarchy without oversized marketing headings in the app shell
- Numeric data should be easy to scan

## Component Ownership

- Dashboard-specific components should live in the dashboard package first
- Only promote components into `packages/ui` after they prove to be truly shared across web and mobile
- Do not force web styling decisions through React Native abstractions during MVP

## Mantine Usage Guidance

- Create a dashboard theme before building page components
- Define approved variants for buttons, inputs, badges, tables, and shells
- Wrap or compose Mantine primitives into dashboard-level components where repeated patterns emerge
- Avoid mixing raw Mantine defaults with ad hoc custom styling page by page

## Deliverables Before Page Build

- Theme tokens
  Color palette, typography, spacing, radius, shadows
- App shell spec
  Header, nav, content width, page padding
- Component rules
  Buttons, inputs, tables, empty states, badges, alerts
- Reference screens
  One landing section and one inventory screen with the intended visual language

## Responsive Support

- MVP must support desktop, tablet, and phone-sized web layouts
- Responsive behavior should be intentional, not a desktop layout squeezed onto smaller screens

## Accessibility Baseline

- Core flows must be keyboard navigable
- Focus states must remain visible
- Forms and tables should use semantic structure
- Primary actions and key data views should have screen-reader-friendly labels

## State Tone

- Empty, partial, stale, and error states should feel calm and operational
- State messaging should be plainspoken and useful
- Avoid cute copy, alarmist visuals, or overly dramatic interruption patterns

## Acceptance Criteria

- A reviewer can describe the app’s visual rules without looking at code
- The inventory page can be built without inventing styling conventions ad hoc
- The team has explicit constraints that reduce generic layouts and pill overuse
