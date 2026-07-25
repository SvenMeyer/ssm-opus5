# Supplement Stack Manager — frontend prototype

A supplement stack is easy to accumulate and hard to reason about. Twelve bottles on a
shelf is twelve labels, and the questions that matter are not on any of them: what does
all of this add up to in a day, is any of it above a safe ceiling, is anything cancelling
anything else out, and is it doing anything.

This prototype answers those four questions. It is **frontend only** — the calculations
are real, the data lives in your browser, and there is no server or database yet.

```sh
pnpm install
pnpm dev          # http://localhost:5174
```

The port is pinned to **5174** (`strictPort`), because 5173 is in use elsewhere on the
machine this was built on.

---

## What it does

It opens with a demo stack of twelve supplements that is deliberately imperfect, because
a stack with nothing wrong in it makes half the app look pointless. Four problems are
planted in it, and all four are real mistakes people make.

### Today — `/`

A vertical timeline of the day's slots. Tap a dose to tick it off; ticking also decrements
the bottle, and un-ticking puts the units back. An adherence ring, a streak counter, the
nutrients worth watching, and what is running low.

Doses that trip a rule carry an inline chip — you see "zinc and iron compete" on the row
you are about to swallow, not three screens away.

### Stack — `/stack`, `/stack/[id]`

Every item as a card: when it is scheduled, how much is left, how many days that lasts,
what it costs a day, and how many issues it is involved in. Group by time of day, by goal,
or flat. Anything running out inside two weeks is lifted into a **Reorder soon** list at
the top, with one-click restocking.

The detail page carries the schedule editor (servings per slot, with or without food), the
full ingredient table against your whole-stack totals, inventory, cost, goal tags, notes,
and every finding that involves this item.

### Catalog — `/catalog`

Forty-two products under invented brands. Search matches names, brands, tags **and
ingredients**, so "magnesium" finds the four products that contain it rather than the one
with it in the title. Filter by form or nutrient category. Adding to the stack opens a
sheet that shows what a serving delivers before you commit, and asks when you will take it.

Anything not in the catalog can be typed in from the label — a custom product joins the
catalog and every calculation in the app.

### Nutrients — `/nutrients` — the point of the whole thing

Everything the stack delivers in a day, aggregated across products, against the daily
target and the tolerable upper limit. Expand a row to see exactly which bottles contribute
how much. Toggle between the whole stack and just what is scheduled today; sort by risk or
by category.

**The bars are not linearly scaled, deliberately.** Vitamin C's 90 mg target is 4% of its
2000 mg ceiling, so on a linear axis every realistic dose is an invisible sliver and the
question the bar exists to answer cannot be read at all. Instead the two reference values
are pinned to fixed positions, so the ticks line up down the page and each row is legible
at a glance; past the higher reference the scale compresses, because "well over" is the
only distinction that matters up there.

Magnesium is the case that shaped the design. Its supplemental ceiling (350 mg) sits
_below_ its target (420 mg), so the marks are anchored by which value is lower rather than
by which one is the target — and the dashed ceiling tick correctly appears to the left of
the solid target tick. That is real, and the bar shows it instead of hiding it.

### Interactions — `/interactions`

A rulebook of mineral competition, fat-soluble absorption, stimulant timing and known
synergies, evaluated against your **schedule** rather than your ingredient list. Zinc and
iron in the same stack is not a problem; zinc and iron in the same slot is. Ingredient
lists alone would cry wolf on nearly everything here.

Findings split three ways:

- **Problems** — ceiling breaches, absorption conflicts, things at the wrong time of day.
- **Suggestions** — synergies you are not yet exploiting. Filing these under warnings
  would train you to ignore warnings.
- **Working well** — pairs you have already scheduled together.

Most problems carry an **Apply fix** button that reschedules the dose. Every proposed move
is simulated against the whole rulebook first: "iron absorbs best fasted" would otherwise
cheerfully suggest moving iron into the slot holding the zinc it was told to avoid. The
best destination wins, and when nothing actually helps the button is not offered at all.

Fixing the planted vitamin D problem is the clearest demonstration that the engine is
live: move it out of the fasted slot and the "vitamin D rides on dietary fat" synergy flips
from a suggestion to a win.

### Goals — `/goals`

Six goals, each naming the nutrients that plausibly serve it. The coverage meter measures
your stack against those nutrients, so a goal can have four bottles assigned and still
read as poorly covered — which is exactly the useful signal. Gaps link straight into a
catalog search.

### Journal — `/journal`

Daily energy, sleep and mood on a 1–5 scale, plus a note. History is annotated with the
days you started something, so a change in scores has a suspect.

### Insights — `/insights`

Ninety days of adherence as a calendar heatmap, per-item adherence (the view that reveals
_which_ supplement you keep forgetting), monthly spend by item, and journal trends as a
seven-day rolling mean — raw 1–5 daily scores plotted straight are noise, not a trend.
Vertical markers show when each item entered the stack.

### Settings — `/settings`

Rename, retime, add and remove the day's slots; the timing engine reads clock time and slot
kind, so custom slots work fully. Theme, currency, JSON export and import, reset to demo
data.

---

## How it is built

| Layer                                | What lives there                                                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/domain/`                    | Pure TypeScript. Types, the nutrient reference table, aggregation, the rule engine, adherence, inventory, cost, goal coverage. No Svelte, no storage, no DOM. |
| `src/lib/data/`                      | Seed data, a `Repository` interface, and a localStorage implementation of it.                                                                                 |
| `src/lib/components/`, `src/routes/` | Presentation. One `AppState` runes class is the single source of truth.                                                                                       |

SvelteKit 2 · Svelte 5 (runes) · TypeScript (strict) · Tailwind CSS v4 · Fraunces + Inter.
No component library and no chart library: the UI primitives are hand-rolled on the native
`<dialog>` element, and the four charts are hand-rolled SVG and CSS. Both were deliberate —
a component library brings its own visual defaults to fight, and 60 kB of chart library for
a ring, a bar, a heatmap and three lines is a bad trade.

### The seam for the real backend

`Repository` is async even though localStorage is not. That is the whole point: each
`save*` method maps to what will become one table, so a Drizzle implementation drops in
without touching a single call site. Mutations in the store are immutable replacements
followed by a fire-and-forget repository write.

The root layout sets `export const ssr = false`. All state is client-side, so server
rendering would mean painting seed data and then swapping it for the user's own. Deleting
that one line and moving reads into `+page.server.ts` is the entire migration.

### Honest limitations

- Reference values are approximate adult figures. A real build would source them per-locale
  and vary them by age, sex and pregnancy status.
- Interaction rules are plausible, widely-repeated guidance, not clinical advice, and they
  say nothing about prescription medication.
- Brands — Nordkap, Terra Vitae, Halo Labs and the rest — are invented. Nothing here
  implies a claim about a real product.
- Past days are scored against your _current_ schedule; there is no history of schedule
  changes yet, so a day before you added something can look worse than it was. The
  Insights page says so on the page.

---

## Working on it

```sh
pnpm dev          # dev server on 5174
pnpm test         # 60 unit tests over the domain layer
pnpm check        # svelte-check
pnpm lint         # prettier --check && eslint
pnpm format       # prettier --write
```

The domain layer is fully unit-tested and the tests use their own fixtures rather than the
demo seed — a test that breaks because someone re-priced a seed product teaches nothing.
