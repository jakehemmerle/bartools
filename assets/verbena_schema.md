# Verbena Inventory Schema

Reference for `assets/verbena_inventory.xlsx` — a real bar's working inventory spreadsheet from Verbena. Used to inform the BarBack data model and as a fixture for read/write tooling.

> **Heads-up:** This is a hand-maintained Excel file. Several columns are reused for different concepts in different row ranges, and there are real data-quality issues. Treat the cached values with skepticism — recompute totals from inputs when ingesting.

## Workbook layout

| Sheet | Rows used | Shape | Purpose |
|---|---|---|---|
| Liquor | 1–467 | **Stacked**: bottle inventory + batched cocktail recipes | Spirits stock + house batch recipes |
| Wine | 1–~50 | Bottle inventory | Wine stock |
| Owners Collection | 1–~10 | Bottle inventory | Owner's reserve wines |
| Beer | 1–~32 | Bottle inventory | Keg/bottle beer stock |
| Produce | 1–~10 | Sparse inventory | Garnish / mixers / produce |
| Wine Waste | 1–71 | Loss log | Wine waste / loss tracking |
| Cost | 1–~110 | Free-form report | Monthly cost-of-goods worksheet |

Excel `max_row` / `max_column` overstates the real bounds — most sheets have hundreds of trailing empty rows. Use the row ranges in this doc, not `max_row`.

---

## Liquor sheet

The Liquor sheet contains **two stacked sub-tables**, separated by a blank row.

### Section 1 — Bottle Inventory (rows 3–399)

- Row 1: title
- Row 2: column headers
- Rows 3–399: data (≈397 products)
- Row 400: `Total` row (label in M, sum in N)
- Row 401: stray `#DIV/0!` cell in I
- Row 402: blank separator

| Col | Header (verbatim) | Type | Required | Notes |
|---|---|---|---|---|
| A | `Size .` | string | yes | 7 unique: `750ml`, `700mL`, `1 Liter`, `1.75 Liter`, `Quart`, `Gallon`, `Bitters`. The `Bitters` value is a category, not a size — column-misuse case. |
| B | `OZ` | float | yes | 16 unique: `3.38, 4, 5, 5.95, 6.7, 7, 8, 12, 16, 23.6, 25.36, 32, 33.814, 59.17, 64, 128`. 25.36 = 750 mL, 33.814 = 1 L, 59.17 = 1.75 L, 128 = gallon. |
| C | `Name` | string | yes | ~351 unique product names, free-text |
| D | `Type` | string | yes | 27 unique. Categories: `bourbon, brandy, cognac, gin, mezcal, rum, rye, scotch, shochu, tequila, vermouth, vodka, whiskey, whisky, liq, bitters, syrup, mixer, juice, puree, garnish, ice, batch, n/a, n/a thc`. **Dirty:** `Juice`/`juice`, `puree`/`puree ` (trailing space), `whiskey`/`whisky` are duplicates that normalize to ~24 real types. |
| E | `Bottle Cost` | float (USD) | yes | wholesale cost per bottle |
| F | `Cost Per OZ` | float (formula) | derived | `= E / B` |
| G | `Cost 1.5oz` | float (formula) | derived | `= F * 1.5` (standard liquor pour) |
| H | `Menu $` | float (USD) | yes | menu price for a 1.5 oz pour |
| I | `Cost%` | float (formula, 0–1) | derived | `= G / H` |
| J | `Main Bar` | float | optional | Inventory at Main Bar. **Fractional bottles allowed** (fill levels in 0.05 increments, range 0.01–1.85). |
| K | `Pool Bar` | float | optional | **Empty in section 1** — not tracked for liquor. |
| L | `Liquor Room` | int | optional | Almost entirely empty (only 3 entries: `1, 3, 68`). |
| M | `Total` | float (formula) | derived | `= SUM(J:L)` |
| N | `Total Value` | float (formula, USD) | derived | `= M * E` |

**Section subtotal:** `N400 = SUM(N3:N399)` — total liquor inventory $.

#### Known data-quality issues in Section 1
- Some `F` and `I` cells reference the wrong row (e.g. `F3 = E3/$B9`) — likely fill-down bugs. Recompute on import.
- Row 9 has `M9 = SUM(J9:L9) + $K409` — stray reference into the recipes section.
- Row 401 contains a `#DIV/0!` error in column I.
- Trailing whitespace on header `Size .` and on some `Type` values.

### Section 2 — Batched Cocktail Recipes (rows 403–467)

The same Excel columns are reused for a completely different concept. The header `('batched cocktail', 'count (L)', 'build %', 'item', 'total oz', '750mL', '1L', 'bitters')` **repeats once per recipe block** (rows 403, 407, 411, 421, 430, 434, 438, 444, 449, 461). Each block is followed by 1–N ingredient rows.

| Col | Header (verbatim) | Type | Meaning |
|---|---|---|---|
| C | `batched cocktail` | string | recipe name (only on the first row of each block) |
| D | `count (L)` | float | batch size in liters. Observed: `2.2, 2.3, 4, 5.4` |
| E | `build %` | float (0–1) | ingredient ratio in the batch. Observed range `0.01–0.95` |
| F | `item` | string | ingredient name |
| H | `total oz` | float (formula) | `= D × 33.8 × E` — total oz of this ingredient needed for the batch |
| I | `750mL` | float (formula) | `= H / 25.36` — number of 750 mL bottles needed |
| J | `1L` | float (formula) | `= H / 33.8` — number of 1 L bottles needed |
| K | `bitters` | float (formula) | `= H / 5` — number of (≈5 oz) bitters bottles needed |

#### Known recipes (~14)
`Banana`, `Chamoyada`, `Chef's Garden`, `Figgy`, `Hard Launch`, `Limoncello`, `Margarita`, `Old Fashioned`, `Rum Old Fashioned`, `Shell Yeah`, plus a few more.

#### Known issues in Section 2
- Rows 464–467 are stub recipes — just a name + `count (L)` with no ingredient rows. Treat as incomplete.
- Recipe header repeats are required by the layout but redundant in a normalized model.

### Suggested normalized model for Liquor

```
liquor_product
  id
  size_label        -- raw "750ml", "1.75 Liter"...
  size_oz           -- normalized float
  category          -- "Bitters" hoisted out of size column
  name
  type              -- normalized ("whiskey", not "whisky")
  bottle_cost_usd
  menu_price_usd    -- 1.5 oz pour price

liquor_inventory
  product_id
  location          -- "main_bar" | "pool_bar" | "liquor_room"
  qty               -- float, fractional bottles allowed

batched_cocktail
  id
  name
  batch_size_liters

cocktail_ingredient
  cocktail_id
  product_id        -- FK to liquor_product where possible
  ingredient_name   -- raw text fallback
  build_pct         -- 0..1
```

---

## Wine sheet

Single bottle-inventory table. Header on row 2. Same shape as Liquor section 1 but with bottle and glass pricing.

| Col | Header | Type | Notes |
|---|---|---|---|
| A | `Size` | string | "750ml" etc. |
| B | `Ounces` | float | |
| C | `Name` | string | |
| D | `W/R/S` | string | "BTG Sparkling", "Red", "White", … (white/red/sparkling category) |
| E | `Cost` | float | wholesale per bottle |
| F | `Cost per OZ` | float (formula) | `= E / B` |
| G | `Menu Price Bottle` | float | |
| H | `Cost Bottle%` | float (formula) | `= E / G` |
| I | `Menu Price Glass 5oz` | float | |
| J | `Cost Glass%` | float (formula) | `= (F × 5) / I` |
| K | `Main Bar` | float | qty |
| L | `Pool Bar` | float | qty |
| M | `Restaurant, Server Alley & Wine Cubby` | float | qty |
| N | `Wine Storage` | float | qty |
| O | `Total` | float (formula) | `= SUM(K:N)` |
| P | `Total Value` | float (formula) | `= O × E` |

- Row 51: section subtotal `P51 = SUM(P3:P48)`
- Row 53: section avg `I53 = AVERAGE(H3:H48, J3:J48)` — average cost%

Wine has both bottle and glass economics — pour size is **5 oz**.

---

## Owners Collection sheet

Same shape as Wine, but with only two location columns and `SUBTOTAL(101, …)` (filter-aware AVERAGE) for section roll-ups. Treat as a separate `wine_owners_reserve` table or as wine with a `is_reserve` flag.

| Col | Header | Type |
|---|---|---|
| A | `Size` | string |
| B | `Ounces` | float |
| C | `Name` | string |
| D | `W/R/S` | string |
| E | `Cost` | float |
| F | `Cost per OZ` | float (formula) `= E / B` |
| G | `Menu Price Bottle` | float |
| H | `Cost Bottle%` | float (formula) `= E / G` |
| I | `Menu Price Glass 5oz` | float |
| J | `Cost Glass%` | float (formula) `= (F × 5) / I` |
| K | `Restaurant ` | float | qty (note trailing space) |
| L | `Office Wine Storage` | float | qty |
| M | `Total` | float (formula) `= SUM(K:L)` |
| N | `Total Value` | float (formula) `= M × E` |

---

## Beer sheet

Header on row 2; **column A is intentionally blank** (aesthetic gutter).

| Col | Header | Type | Notes |
|---|---|---|---|
| B | `Size.` | string | "1/4bbl", "1/6bbl", "12oz", … |
| C | `Ounces` | float | size in oz (e.g. 992 oz for ¼ bbl) |
| D | `Name` | string | |
| E | `Cost` | float | wholesale per unit |
| F | `Cost/ OZ` | float (formula) | `= E / C` |
| G | `Menu $` | float | menu price for a **15 oz pour** |
| H | `Cost%` | float (formula) | `= (F × 15) / G` |
| I | `Main Bar` | float | qty |
| J | `Pool Bar` | float | qty |
| K | `Cooler` | float | qty |
| L | `Total` | float (formula) | `= SUM(I:K)` |
| M | `Total Value` | float (formula) | `= L × E` |

- Row 32: subtotals — `H32 = SUBTOTAL(101, H4:H30)` (avg cost%), `M32 = SUM(M3:M31)` (total beer $)
- Beer pour size assumption is **15 oz** (pint-ish), unlike liquor's 1.5 oz and wine's 5 oz.

---

## Produce sheet

Sparse — most cells are empty in the source file.

| Col | Header | Type |
|---|---|---|
| A | `NAME` | string |
| B | `UOM` | string ("case", "flat", "boxes") |
| C | `Cost` | float |
| D | `Cost per OZ` | float |
| E | `Main Bar` | float |
| F | `Pool Bar` | float |
| G | `Restaurant ` | float (trailing space) |
| H | `Storage` | float |
| I | `Total` | float |
| J | `Total Value` | float (formula) `= I × C` |

Only formula in this sheet is `J = I × C`. No bottle/oz math.

---

## Wine Waste sheet

A loss log. Header is on **row 5** (not row 2).

| Col | Header | Type |
|---|---|---|
| B | `Date:` | datetime |
| C | `Wine` | string |
| D | `Unit Lost` | float |
| E | `Whole Sale Cost` | float |
| F | `Total Loss` | float (formula) `= E × D` |

- Row 71: `G71 = SUM(F7:F70)` — total wine waste $.

---

## Cost sheet

**Not a tabular dataset** — this is a free-form monthly P&L worksheet with two side-by-side blocks: "Liquor Cost Worksheet" (cols B–L) and "Beer Cost Worksheet" (cols N–Z+). Labeled cells include `Month/Year:`, `Gross Beverage Revenue:`, `Beginning Inventory:`, `Purchases:`, `Ending Inventory:`, etc.

Key cross-sheet references (these are the "outputs" of the inventory sheets):
- `I22 = Liquor!$N$400` — pulls liquor ending inventory
- `S22 = Beer!$M$32` — pulls beer ending inventory

Standard cost-of-goods math appears at row 109:
- `N109 = N78 + N83 − N105 − N107` (`begin + purchases − transfers − ending`)

The pour-analysis section in rows 7–23 uses `X = (V × W) / 2` (likely an average-pour calc), with column subtotals at row 22/23 and a cross-block average at `V25 = ((X23 + AC23) × 0.5)`.

For ingestion: treat the Cost sheet as a **report**, not a data source. Read its inputs by name from the labeled cells; do not parse it as a table.

---

## Read/write rules of thumb

When reading:
1. Use the row ranges in this doc — `max_row` is unreliable due to trailing empty rows.
2. **Always recompute** `Cost per oz`, `Cost%`, `Total`, and `Total Value` from inputs. Several formulas in the source file have wrong row references.
3. Normalize `Type` strings (lowercase, trim, merge `whiskey`/`whisky`).
4. For Liquor, **split at row 402**: rows 3–399 are bottle inventory, rows 403+ are recipes. Detect recipe-block boundaries by the repeated header pattern.
5. Handle the column-meaning shift in Liquor section 2: cols D, E, F, H, I, J, K mean different things below row 402.
6. Pour sizes by category: liquor = 1.5 oz, wine glass = 5 oz, beer = 15 oz.

When writing:
1. **Preserve formulas** in `F`, `G`, `I`, `M`, `N` (Liquor) and equivalents — overwrite the *inputs* (Cost, Menu price, location qtys), not the derived cells.
2. Preserve row 400 (`Total`) and row 401 (the `#DIV/0!` cell) so the Cost sheet's `Liquor!$N$400` reference still resolves.
3. If adding rows, insert above row 399 (last data row) so the `SUM(N3:N399)` formula picks them up — or extend the formula range.
4. Don't touch the Cost sheet directly; let Excel recalculate from the inventory sheets.
5. Bottle quantities accept fractional values (fill levels) — don't round to int.

## Open questions

- **No SKU/UPC column anywhere.** BarBack will need to bolt one on. Tracked in `docs/init_research_notes.md` ("Where to get SKUs - UPC/GTIN-12").
- Several Wine sheet location columns (Pool Bar, Wine Storage) are sparsely populated — confirm with the bar whether these locations are real.
- Does the bar want to keep "Owners Collection" as a separate concept or fold into Wine with a flag?
- Are the other sheets (Wine, Beer) free of stacked sub-tables, or do they have a section break like Liquor? Worth a quick scan before finalizing the importer.
