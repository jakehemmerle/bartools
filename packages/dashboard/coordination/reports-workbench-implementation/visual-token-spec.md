# Visual Token Spec

This document is the hard visual contract for the BARTOOLS web reports workbench.

It exists to answer one question:

What visual decisions are already made, and therefore do not get renegotiated accidentally during implementation?

## Source Precedence

For visual decisions, use this order:

1. `packages/mobile/theme/tokens.ts`
2. approved screens in `packages/dashboard/coordination/golden-set-approved/`
3. this token spec
4. implementation convenience

If implementation convenience conflicts with the mobile visual language or the approved screens, implementation convenience loses.

## Product Tone

The product should read as:
- dark
- calm
- precise
- slightly editorial
- operational without becoming "enterprise dashboard" sludge

The product should not read as:
- generic admin SaaS
- bright productivity app
- developer tooling UI
- fintech control panel
- stock component library showcase

## Token Implementation Contract

The web app should define dashboard-local tokens with stable names and stable roles.

Recommended CSS custom property names:
- `--color-bg-app`
- `--color-bg-canvas`
- `--color-surface-low`
- `--color-surface-base`
- `--color-surface-high`
- `--color-surface-highest`
- `--color-surface-variant`
- `--color-border-subtle`
- `--color-border-strong`
- `--color-text-primary`
- `--color-text-secondary`
- `--color-text-muted`
- `--color-accent-soft`
- `--color-accent`
- `--color-accent-strong`
- `--color-accent-ink`
- `--color-success`
- `--color-success-strong`
- `--color-error`
- `--color-error-strong`
- `--shadow-ambient`

The names may vary slightly in code, but the role separation must stay intact.

## Color Tokens

### Core Surface Ladder

| Token | Value | Source | Use |
| --- | --- | --- | --- |
| `--color-bg-app` | `#131313` | mobile | app background, top-level page field |
| `--color-bg-canvas` | `#0E0E0E` | mobile | deepest inset canvas, ghost-border wells |
| `--color-surface-low` | `#1C1B1B` | mobile + golden set | top bar, low-elevation panels, list rows |
| `--color-surface-base` | `#20201F` | mobile | default card/panel surface |
| `--color-surface-high` | `#2A2A2A` | mobile | emphasized cards, selected rows, metadata slabs |
| `--color-surface-highest` | `#353535` | mobile | chips, dividers, stronger inset surfaces |
| `--color-surface-variant` | `#353535` | mobile | secondary emphasis where a warmer edge is needed |

### Text And Border Tokens

| Token | Value | Source | Use |
| --- | --- | --- | --- |
| `--color-text-primary` | `#E5E2E1` | mobile | primary body text, main content labels |
| `--color-text-secondary` | `#D8C3B4` | mobile | warm secondary text, subdued emphasis |
| `--color-text-muted` | `#A08D80` | mobile | metadata, helper text, non-critical timestamps |
| `--color-border-strong` | `#524439` | mobile | explicit separators, structured panel outlines |
| `--color-border-subtle` | `rgba(82, 68, 59, 0.15)` | golden set | ghost borders, low-contrast boundaries |

### Accent Tokens

| Token | Value | Source | Use |
| --- | --- | --- | --- |
| `--color-accent-soft` | `#FFDCC5` | golden set | warm headline highlights, quiet chip emphasis, subtle gradients |
| `--color-accent` | `#FFB782` | mobile | primary CTA fills, selected controls, corrected-value emphasis |
| `--color-accent-strong` | `#C7804A` | mobile | stronger accent stops, copper edge, hover/depth treatment |
| `--color-accent-ink` | `#4F2500` | mobile | text on filled copper controls |

### Feedback Tokens

| Token | Value | Source | Use |
| --- | --- | --- | --- |
| `--color-success` | `#00E639` | mobile | positive status details only, very sparingly |
| `--color-success-strong` | `#00A827` | mobile | success container edge or high-contrast success indicator |
| `--color-error` | `#FFB4AB` | mobile | error text or failed state foreground |
| `--color-error-strong` | `#93000A` | mobile | failed-state background treatment |

## Color Usage Rules

The color system is restrained on purpose.

Required usage rules:
- the app background stays dark on every real route
- surfaces step upward through the surface ladder rather than by inventing unrelated grays
- copper is a scarce emphasis color, not a default text color for everything
- green is used for success or positive readiness only
- red is used for failure or error only

Forbidden usage rules:
- no blue primary actions
- no purple accents
- no white cards on dark pages
- no fully transparent glassmorphism panels
- no rainbow status palettes
- no bright neon gradients except where the approved screens already imply a restrained copper wash

## Typography Contract

The type system is part of the product identity.

### Font Roles

| Role | Font | Use |
| --- | --- | --- |
| display and editorial headings | `Newsreader` | hero headline, page titles, section titles, wordmark |
| body and utility prose | `Manrope` | paragraphs, metadata blocks, helper copy, field text |
| labels and machine-like metadata | `Space Grotesk` | chips, overlines, table/list headers, compact utility labels |

### Type Hierarchy

| Token | Recommended Range | Rules |
| --- | --- | --- |
| wordmark | `24px` to `28px` | uppercase, `Newsreader`, tracking around `0.18em` to `0.22em` |
| display hero | `64px` to `72px` | `Newsreader`, high contrast, reserved for entry and major screen headlines |
| page title | `48px` to `56px` | `Newsreader`, used on list and detail pages |
| section title | `28px` to `36px` | `Newsreader`, used in cards or section headers |
| body large | `18px` to `20px` | `Manrope`, calm explanatory copy |
| body default | `16px` | `Manrope`, most app body content |
| body compact | `14px` | `Manrope`, metadata and supporting details |
| label default | `12px` to `13px` | `Space Grotesk`, uppercase, moderate tracking |
| label compact | `10px` to `11px` | `Space Grotesk`, uppercase, only for dense metadata |

### Typography Rules

Required:
- `Newsreader` carries the product's high-level voice
- `Manrope` carries readability and operational calm
- `Space Grotesk` is reserved for labels, chips, and machine-like metadata
- labels should usually be uppercase with visible tracking

Forbidden:
- no system-font fallback as the intended product look
- no four-font soup
- no giant all-caps paragraph copy
- no bolding everything to create hierarchy

## Spacing Scale

Use the mobile spacing system directly.

| Token | Value |
| --- | --- |
| `--space-xs` | `4px` |
| `--space-sm` | `8px` |
| `--space-md` | `12px` |
| `--space-lg` | `16px` |
| `--space-xl` | `20px` |
| `--space-2xl` | `24px` |
| `--space-3xl` | `32px` |
| `--space-4xl` | `40px` |
| `--space-5xl` | `48px` |
| `--space-6xl` | `64px` |

Required spacing behavior:
- page shells should feel airy, not cramped
- dense report content should still align to the same spacing scale
- repeated gaps should use tokens, not ad hoc pixel values

## Corner Radius Scale

Use the mobile radius system directly.

| Token | Value |
| --- | --- |
| `--radius-sm` | `2px` |
| `--radius-md` | `4px` |
| `--radius-lg` | `8px` |
| `--radius-xl` | `12px` |
| `--radius-full` | `9999px` |

Rules:
- main panels and report cards should typically use `8px` or `12px`
- chips and pill controls can use `9999px`
- do not randomly mix six different rounding styles on one screen

## Borders And Shadows

### Shadow Contract

Primary ambient shadow:
- `0 24px 48px rgba(0, 0, 0, 0.5)`

Use:
- elevated entry card
- major report detail slabs
- emphasized surfaces that need separation from the page field

Do not use:
- giant fuzzy modal shadows everywhere
- bright drop shadows
- library-default shadow ladders

### Border Contract

Use:
- `--color-border-subtle` for ghost edges
- `--color-border-strong` for deliberate separators and stronger contained panels

Do not use:
- fully opaque light borders on every surface
- thick framed admin-table outlines

## Layout Invariants

These are locked unless consciously renegotiated.

### App Shell

- no left sidebar
- no permanent utility rail
- top bar height should stay close to `64px`
- desktop horizontal page padding should usually start around `32px`
- route families should share a common shell

### Entry Screen

- centered composition
- oversized editorial headline
- one dominant primary CTA
- minimal supporting copy
- no fake auth surface

### Reports List

- custom report rows, not generic grid/table chrome
- desktop-first list density
- row structure should clearly separate identity, status, operator/location, timestamps, and bottle count
- MVP should not add pagination chrome

### Report Detail

- report header is top-weighted
- metadata should live in a deliberate slab, not scattered badges
- record cards should stack with consistent rhythm
- review controls should live inside the record treatment, but review submission stays report-level

## Motion Rules

Motion should be restrained.

Use:
- short fades
- subtle translate transitions
- emphasis on clarity, not delight theater

Do not use:
- springy bouncing cards
- scale-heavy hover effects
- decorative shimmer everywhere

## Anti-Drift Rules

If a screen violates any of these, it failed visual fidelity:
- it looks acceptable in isolation but could belong to any admin template
- it defaults to a data table because that was quicker
- it introduces a fresh gray scale unrelated to the locked surface ladder
- it invents a new accent color because one component "needed contrast"
- it lets chip colors or badge styles become the main hierarchy driver
- it reads as a light app with dark paint applied on top

## Visual Review Checklist

Every visual pass should explicitly ask:

1. Does the screen use only the locked surface ladder and accent roles?
2. Does the typography still read as `Newsreader` plus `Manrope` plus `Space Grotesk`, or has it drifted?
3. Is copper being used as emphasis rather than wallpaper?
4. Does the page feel like the approved product family without relying on the golden-set screenshot being next to it?
5. If the golden set disappeared tomorrow, would this token spec still be sufficient to rebuild the same family?
