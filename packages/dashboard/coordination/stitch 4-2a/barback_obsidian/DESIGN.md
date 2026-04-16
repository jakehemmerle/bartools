# Design System: The Technical Atelier

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Sommelier"**

This design system rejects the "SaaS-standard" aesthetic of blue buttons and rounded containers. Instead, it draws inspiration from the precision of high-end watchmaking and the tactile authority of a boutique bar ledger. The goal is an "Editorial Workbench"—a space that feels as curated as a print magazine but functions with the cold efficiency of a laboratory.

To move beyond the template look, we leverage **Intentional Asymmetry** and **Tonal Depth**. By avoiding symmetrical grids and using aggressive typography scale shifts, we create a layout that feels "designed" rather than "assembled." We do not use borders to define space; we use light and shadow.

---

## 2. Colors & Surface Philosophy
The palette is rooted in obsidian and copper. It is a "Dark-First" system where legibility is maintained through sophisticated contrast rather than pure white text.

### The Surface Hierarchy
Depth is created through a "Stacking" logic using the `surface-container` tiers.
- **Base Layer:** `background` (#131313) is the void.
- **Inset Elements:** `surface-container-lowest` (#0E0E0E) for "wells" or deep background areas.
- **Elevated Sections:** Use `surface-container-low` (#1C1B1B) for the primary workspace.
- **Interactive Layers:** Use `surface-container-high` (#2A2A2A) and `highest` (#353535) for modals, menus, and hovering elements.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Boundaries must be defined solely through background color shifts or the **Ghost Border** (see Elevation & Depth). If two sections are adjacent, one should be `surface-container-low` and the other `surface-container`, creating a soft, natural seam.

### Signature Textures
- **The Copper Glow:** Primary CTAs should not be flat. Use a subtle linear gradient from `primary` (#FFDCC5) to `primary-container` (#C7804A) at a 45-degree angle to give the copper a metallic, reflective soul.
- **Glassmorphism:** For floating utility panels (like report filters), use `surface-container-high` at 80% opacity with a `20px` backdrop-blur. This integrates the component into the environment rather than "pasting" it on top.

---

## 3. Typography: The Editorial Voice
We use a three-font strategy to balance heritage, utility, and modernism.

*   **The Authority (Newsreader):** Used for Display and Headlines. It provides a human, literary quality. Use wide tracking for a "premium restraint" feel.
*   **The Workhorse (Manrope):** Used for Body and Title scales. It is neutral, legible, and modern.
*   **The Technical (Space Grotesk):** Reserved for `label-md` and `label-sm`. Used for metadata, status tags, and uppercase utility text. It mimics the look of a printed receipt or a technical manual.

**Hierarchy Tip:** Pair a `display-lg` Newsreader headline with a `label-md` Space Grotesk sub-label in all-caps for an immediate high-end editorial feel.

---

## 4. Elevation & Depth
In this system, elevation is an atmospheric property, not a drop-shadow effect.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section to create a "recessed" look. Place a `surface-container-high` element over a `surface` background to create a "raised" look.
*   **Ambient Shadows:** For floating modals, use a custom shadow: `0px 24px 48px rgba(0, 0, 0, 0.5)`. Never use harsh, dark grey shadows; they must feel like ambient light being blocked by a physical object.
*   **The Ghost Border:** If accessibility requires a stroke, use `outline-variant` (#52443B) at **15% opacity**. It should be felt, not seen.
*   **Crisp Radii:** Use `sm` (2px) or `md` (6px) for almost all containers. Avoid `full` (pill) shapes except for specific status chips. We want "crisp," not "bubbly."

---

## 5. Components

### Buttons & Inputs
*   **Primary Button:** Gradient of `primary` to `primary-container`. Typography: `label-md` (Space Grotesk, Uppercase). Radius: `sm`.
*   **Secondary Button:** Transparent background with a "Ghost Border." On hover, shift background to `surface-container-highest`.
*   **Input Fields:** Use `surface-container-lowest` for the field background. The bottom border only (1px `outline-variant`) activates on focus. Labels use `label-sm` Space Grotesk.

### Chips & Status
*   **Review Status:** Success states use a "Controlled Green." Background: 10% opacity green, Text: 100% opacity green. No border.
*   **Metadata Chips:** `surface-container-high` background, `label-sm` Space Grotesk text.

### Cards & Lists
*   **Forbid Dividers:** Do not use horizontal rules between list items. Use vertical spacing (16px–24px) and subtle `surface` shifts on hover to indicate row boundaries.
*   **The "Workbench" Card:** Use `none` or `sm` radius. Cards should feel like heavy slabs of material.

### Specialized Component: The Data Scrubber
For the Workbench context, create a custom scrubber using a thin `primary` line with `label-sm` metadata floating above it in Space Grotesk. This emphasizes the "technical tool" aspect of the brand.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use extreme typographic contrast (e.g., a massive Newsreader header next to a tiny Space Grotesk label).
*   **Do** lean into "Tonal Layering." If a screen feels flat, adjust the container tiers rather than adding a border.
*   **Do** use high-density layouts for data-heavy views, but offset them with generous "editorial" whitespace in report headers.

### Don’t:
*   **Don’t** use "Enterprise Blue" or any color outside the defined copper/stone/obsidian palette.
*   **Don’t** use large corner radii. Anything above 8px (lg) starts to feel too consumer/casual.
*   **Don’t** use standard Material Design drop shadows. Stick to the Ambient Shadow or Tonal Layering.
*   **Don’t** center-align editorial headers. Keep them left-aligned to maintain the "Workbench" precision.

---
*Document Version 1.0 — Confident, Intentional, Precise.*