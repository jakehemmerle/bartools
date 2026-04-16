# The Workbench Design System: Editorial Precision

## 1. Overview & Creative North Star: "The Master Archivist"
The Workbench design system is rooted in the "Master Archivist" North Star. This philosophy treats data not as a digital commodity, but as a prestigious record. We move beyond the "SaaS dashboard" aesthetic by prioritizing high-end editorial layouts, intentional asymmetry, and a tactile, ink-on-paper quality.

The system rejects the standard "box-within-a-box" layout. Instead, we use extreme typographic scale shifts and tonal layering to guide the eye. It is an environment of "Operational Density"—where high volumes of information are managed with quiet, restrained elegance.

---

## 2. Colors: Tonal Depth & The Copper Pulse
The palette is a study in darkness. We utilize a range of "Ink" and "Charcoal" tones to create depth without relying on artificial lighting or shadows.

### Core Surface Tokens
*   **Background / Surface:** `#131313` (The base canvas)
*   **Surface Container Lowest:** `#0E0E0E` (Used for "inset" areas or deep background wells)
*   **Surface Container Low:** `#1C1B1B` (The standard secondary sectioning color)
*   **Surface Bright:** `#393939` (Highlight areas or high-visibility surfaces)

### Accents & Status
*   **Primary (Copper/Brass):** `#FFB782` (Text/Icon highlights) and `#C7804A` (Solid actions)
*   **Success (Reviewed):** Controlled Green (Use muted, low-saturation greens to maintain the premium tone)
*   **Error (Failed):** `#FFB4AB` (on surface) / `#93000A` (container)

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Layout boundaries must be defined solely by background color shifts. A section is defined by moving from `Surface` to `Surface-Container-Low`. This creates a sophisticated, "carved" look rather than a "sketched" look.

### Signature Textures & Glass
For floating overlays (modals or dropdowns), use **Glassmorphism**: 
*   **Background:** `Surface-Container` at 80% opacity.
*   **Effect:** Backdrop-blur of 12px to 20px. 
*   **The "Ghost Border":** A 1px stroke using `Outline-Variant` (`#52443B`) at 15% opacity to catch the light.

---

## 3. Typography: The Editorial Scale
We use three distinct typefaces to separate narrative, utility, and data.

*   **The Narrative (Newsreader):** A sophisticated serif used for Headings and High-level Titles. It provides the "editorial" feel.
    *   *Headline-LG:* 2rem. High-contrast pairing with small labels.
*   **The Utility (Manrope):** A humanist sans-serif used for body text and Title-SM. It is clean, legible, and avoids the generic feel of Inter.
    *   *Body-MD:* 0.875rem. The workhorse for report content.
*   **The Technical (Space Grotesk):** A geometric, monospaced-adjacent font for Labels, Metadata, and Numbers. 
    *   *Label-MD:* 0.75rem, Uppercase, 5% Letter Spacing. Used for table headers and system stats.

---

## 4. Elevation & Depth: Tonal Layering
Depth is achieved through the **Layering Principle**, stacking surface tiers to create a physical sense of hierarchy.

*   **Nesting:** Place a `Surface-Container-Highest` card upon a `Surface-Container-Low` sidebar. The "lift" is purely tonal.
*   **Ambient Shadows:** If a component must float (e.g., a primary action menu), use an extra-diffused shadow:
    *   `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);`
*   **Vertical Rhythm:** Use a strict 4px/8px grid, but allow for wide asymmetric margins (e.g., a left-aligned header with a right-aligned data grid) to break the "template" feel.

---

## 5. Components: Operational Primitives

### Buttons: The Ingot Variant
*   **Primary:** Copper (`#C7804A`) background, `On-Primary` (`#4F2500`) text. Radius: `sm` (0.125rem). No gradients, just solid, authoritative color.
*   **Secondary:** `Surface-Container-Highest` background with a Copper `Label-MD` text. 
*   **Tertiary:** Ghost style. No background, only `Space Grotesk` uppercase text.

### Inputs & Fields
*   **Style:** Inset appearance. Use `Surface-Container-Lowest` as the field background. 
*   **Focus State:** A 1px bottom-border only in Copper (`#FFB782`). Avoid full-box focus rings.
*   **Labels:** Always `Space Grotesk` Uppercase, positioned above the field.

### Cards & Lists: The "No-Divider" Rule
*   **Structure:** Forbid the use of horizontal divider lines. 
*   **Separation:** Use 24px of vertical white space or a subtle shift from `Surface-Container-Low` to `Surface`. 
*   **Density:** Data rows should be tight (32px-40px height) but use high-contrast typography to remain readable.

### The Report Ledger (Custom Component)
A specialized table-view for the Workbench. Use `Newsreader` for the Row Title and `Space Grotesk` for the numerical data. The row background should shift to `Surface-Bright` on hover—never use a border for hover states.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use extreme contrast in type sizes (e.g., a `Display-LG` title next to a `Label-SM` date).
*   **Do** use the "Ghost Border" (10-20% opacity) for accessibility on buttons if they sit on a similar tonal background.
*   **Do** maintain a strict "small crisp radius" (2px-4px) to keep the workbench feeling like a professional tool.

### Don’t:
*   **Don't** use Inter. It is the hallmark of the generic web; we are building a bespoke instrument.
*   **Don't** use drop shadows for sectioning. Use tonal shifts (`Surface-Low` vs `Surface-High`).
*   **Don't** use decorative icons. Icons must be functional, geometric, and thin-stroke (1px or 1.5px).
*   **Don't** use bright white (#FFFFFF). All "white" text should be `On-Surface` (`#E5E2E1`) to reduce eye strain in the dark environment.