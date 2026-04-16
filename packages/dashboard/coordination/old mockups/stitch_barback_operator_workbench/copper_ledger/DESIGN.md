# THE DESIGN SYSTEM: OPERATOR’S EDITION

## 1. Overview & Creative North Star
**Creative North Star: The Night Steward**
This design system is not a generic dashboard; it is a high-precision workbench designed for the quiet hours of professional operation. It draws inspiration from the tactile world of high-end hospitality—heavy bond paper, etched brass, and the low-light ambiance of a premium lounge. 

To move beyond the "SaaS template" look, we employ **Intentional Asymmetry** and **Editorial Density**. We reject the "one-size-fits-all" card layout in favor of a reports-first architecture where data is treated like typography in a luxury journal. This system prioritizes the "calm" of deep focus and the "precision" of operational mastery.

---

## 2. Colors: Tonal Depth & Metallic Accents
The palette is rooted in deep ink and charcoal, punctuated by a warm copper (`primary`) that mimics brass fixtures under a spotlight.

### Palette Strategy
- **Base Surfaces:** `surface` (#131313) is our canvas. We do not use "pure black" to avoid organic OLED smearing and to maintain a softer, paper-like ink quality.
- **The Accents:** `primary` (#FFB77B / Copper) is used sparingly for critical actions and brand presence. `secondary` (#88D982) is reserved for growth and success metrics.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off the UI. 
Traditional lines create visual noise. Instead, define boundaries through:
1. **Background Shifts:** Place a `surface_container_high` module directly onto a `surface` background.
2. **Negative Space:** Use the spacing scale to create "rivers" of black that naturally separate functional groups.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of lacquered wood or glass.
- **Level 0 (Foundation):** `surface_container_lowest` (#0E0E0E) for the outermost workspace.
- **Level 1 (The Desk):** `surface` (#131313) for the main dashboard area.
- **Level 2 (The Reports):** `surface_container` (#201F1F) for primary data modules.
- **Level 3 (The Focus):** `surface_container_highest` (#353534) for active inputs or pop-over elements.

### The "Glass & Gradient" Rule
To add "soul," use a subtle linear gradient on primary CTAs: `primary` (#FFB77B) to `primary_container` (#C8803F) at a 135-degree angle. For floating overlays, apply a `backdrop-filter: blur(12px)` over a 70% opaque `surface_container_high` to create a "Smoked Glass" effect.

---

## 3. Typography: The Editorial Voice
We use a tri-font system to balance prestige with technical utility.

| Level | Font Family | Token | Intent |
| :--- | :--- | :--- | :--- |
| **Display** | *Newsreader* | `display-lg` | Large-scale reporting figures and section intros. Elegant, high-contrast serif. |
| **Headline** | *Newsreader* | `headline-sm` | Narrative headers. Sets the "moody" editorial tone. |
| **Title** | *Inter* | `title-md` | Functional navigation and module titles. |
| **Body** | *Inter* | `body-md` | Standard reading. High legibility, neutral. |
| **Label** | *Space Grotesk* | `label-sm` | Technical metadata, timestamps, and table headers. Uppercase with 0.05em tracking. |

**The Hierarchy Strategy:** 
Large serif headers (`Newsreader`) act as anchors for the eye, while monospace-adjacent labels (`Space Grotesk`) provide the "Operator" feel—precise, technical, and authoritative.

---

## 4. Elevation & Depth: Tonal Layering
We reject the standard drop-shadow. Depth is a matter of light and material, not "floating" boxes.

- **The Layering Principle:** Achieve lift by stacking. A `surface_container_low` card placed on a `surface_dim` background provides enough contrast for the human eye without structural clutter.
- **Ambient Shadows:** When an element must float (e.g., a dropdown), use a "Copper Glow" shadow: `box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 4px rgba(184, 115, 51, 0.05)`.
- **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline_variant` (#524439) at **20% opacity**. It should be felt, not seen.
- **Small Radii:** Use `sm` (0.125rem) or `DEFAULT` (0.25rem) exclusively. This system is "crisp," not "bubbly." Rounded corners should feel like a machined edge, not a toy.

---

## 5. Components: The Workbench
Components are dense and high-contrast, designed for the "Reports-First" workflow.

- **Primary Button:** Gradient of `primary` to `primary_container`. Text in `on_primary_fixed` (#2E1500). Square-ish corners (`sm` radius). No shadow, just pure color luminance.
- **Inputs:** `surface_container_lowest` background with an `outline_variant` (20% opacity) "Ghost Border." Focus state uses a 1px solid `primary` bottom-border only—mimicking a signature line on a receipt.
- **Data Tables (The Core):** Forbid horizontal and vertical dividers. Use zebra-striping with `surface` and `surface_container_low`. Header labels must be `label-sm` (Space Grotesk), Uppercase, tracked out.
- **Status Chips:** No background fills. Use a 1px `Ghost Border` with a small, glowing `primary` (or `secondary` for success) dot to the left of the text.
- **The "Metric Block":** A custom component. Large `display-md` (Newsreader) serif numbers paired with a tiny `label-sm` technical description. Use `primary` for the number to make it the focal point of the report.

---

## 6. Do’s and Don’ts

### Do
- **Do** use "Negative Space" as a structural tool. Let the dark surfaces breathe.
- **Do** align technical data to a strict grid, but allow Display Typography to break the grid slightly for an editorial feel.
- **Do** use `Newsreader` for any text that is meant to be "read" rather than "scanned."
- **Do** use high-contrast color shifts for hover states (e.g., shifting from `surface_container` to `surface_bright`).

### Don’t
- **Don't** use standard blue for links. Use `primary` (Copper).
- **Don't** use large border-radii. Anything over 8px (lg) breaks the premium, machined aesthetic.
- **Don't** use "Information" or "Warning" blues/yellows. Stick to the tonal palette; if something isn't an error or a success, it should stay within the Copper/Neutral spectrum.
- **Don't** add icons to every button. Let the typography and color communicate the hierarchy.