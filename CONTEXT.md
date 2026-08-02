# CONTEXT.md — namakh domain language

The vocabulary of this codebase. Each term is defined once here; use it exactly.
The **avoid** list matters as much as the definition — those synonyms are how the
same concept ends up with three different names across files.

Scope note: this describes what exists today (a marketing site with a hardcoded
catalogue). Commerce terms — cart, order, payment — are deliberately **not** defined
yet, because none of it is built. See `CLAUDE.md` for build/status facts.

---

## The brand & products

### Namakh
The client and the brand. Indian direct-to-consumer electrolyte company; the site
is `namakh.in`. From *namak* (नमक), Hindi for salt — hence the salt/saline visual
language throughout the design.
*Write it* **Namakh** in copy, `namakh` in code and filenames.

### Blend
A product. There are exactly **two**, and the number two is load-bearing in the
copy ("Two blends. Zero filler."). Don't write code that assumes an arbitrary-length
catalogue is the interesting case, and don't write copy that hardcodes "two" so
deeply that a third blend becomes a rewrite.
- **Hydration Blend** — everyday use. Sugar-free. 50 servings, ₹1450.
- **Sports Blend** — training/heavy sweat. Contains dextrose. 30 servings, ₹1150.

*Avoid:* product line, SKU, variant, flavour, formula (see **Formula** below —
it means something else), mix, drink.

> **Open discrepancy — Heart Blend.** The client's FAQ copy describes a *third*
> blend ("Heart Blend", a different sodium-to-potassium ratio for people mindful
> of blood pressure). It does not exist in `lib/products.ts`, has no product page,
> and contradicts the "Two blends. Zero filler." copy on `/shop`. The FAQ page
> renders it verbatim as supplied. Needs a client decision: ship the third blend,
> or cut it from the FAQ.

### Slug vs blend key — a real trap
Two different identifiers exist for the same two products and they are **not**
interchangeable:
- **slug** — `"hydration-blend"` / `"sports-blend"`. The URL segment and the `id`
  in `lib/products.ts`. Used by `getProductBySlug()`, the `/shop/[slug]` route, and
  the `ACCENT` lookup in `app/shop/page.tsx`.
- **blend key** — `"hydration"` / `"sports"`. The short form. Used by the quiz
  scoring (`score: { hydration, sports }`, `result`) and by the accent-colour CSS
  tokens (`--color-hydration`, `--color-sports`).

Anything crossing between the quiz and the catalogue has to map one to the other.
There is no shared helper for this today — if you write a third place that needs it,
extract one into `lib/products.ts` rather than hand-rolling `` `${key}-blend` ``.

### Stats
The per-serving electrolyte numbers on a blend: sodium, potassium, magnesium (mg),
dextrose (g), citric acid (mg). Lives in `Product.stats`.
*Avoid:* nutrition, macros, ingredients, facts. **Ingredients** would be the list of
what's in it; **stats** are the measured amounts. Not the same thing, don't merge them.

### Nutritional label
The photographed pack-back image (`Product.nutritionalLabel`), shown as the second
gallery image on a product page. It is an **image asset**, not structured data —
if someone asks to "change the nutritional label", that's a design/asset task, not
a `lib/products.ts` edit.

### Formula / Formulae
The *science* story — why these ratios, what each electrolyte does. Reserved for the
`/formulae` route (currently a stub with its body commented out) and the
`ScienceSection` on the landing page. **Not** a synonym for blend or for stats.

---

## Site structure

### Section
One full-width horizontal band of the landing page, one file in
`components/sections/`, re-exported through `components/sections/index.ts`. Pages are
assembled by stacking sections. A section owns its own vertical padding and its own
`Reveal` wrapping; the page does not lay it out.
*Avoid:* block, band, module, panel, slice.

Live sections, in render order on `/`: `LandingSection`, `Ticker`,
`PrinciplesSection`, `ScienceSection`, `HowItWorksSection`, `ComparisonSection`,
`ProductCTASection`. `RootedSection` and `BenefitsSection` are exported but rendered
nowhere — treat them as parked, not as examples to copy.

### Page shell
The wrapper every route repeats: `grain relative min-h-screen bg-ink text-bone
font-sans`, containing `<Navbar />` + `<MobileNav />`, a `<main className="relative
z-[2]">`, and `<Footer />`. Not currently abstracted into a component — it's
duplicated across `/`, `/shop`, and `/shop/[slug]`. If you touch all three anyway,
extracting it is welcome; doing it as a drive-by on one route is not.

### Document page
One of the seven long-form copy routes — `/about`, `/faq`, `/contact`, and the four
policies. Built from `components/doc/`: a `DocPage` shell wrapping `DocSection`
blocks, with prose styled by `.doc-prose` in `globals.css`. Distinct from a
**section**, which is a band of the landing page.
*Avoid:* static page, content page, legal page (only four of the seven are legal),
markdown page (nothing renders markdown at runtime — the copy is committed as TSX).

The source copy lives in `docs/pages/` as `.md` alongside the client's original
`.docx`/`.pdf`. Those files are the record of what the client supplied; the TSX is
the published version. If copy changes, change both.

### The quiz
The "find your blend" modal (`components/quiz-modal.tsx`). Six questions, each option
carrying a `score` for both blend keys; the higher total picks the result. Opened
from the navbar and from `ProductCTASection` via an `onQuizClick` prop threaded down
from `app/page.tsx`. Entirely client-side, stateless across sessions — nothing is
persisted or sent anywhere.
*Avoid:* survey, questionnaire, finder, recommender, wizard.

---

## Design system

All of it lives in `app/globals.css` — there is no `tailwind.config`, because
Tailwind v4 declares tokens in `@theme inline`.

### Ink / bone
The two-colour foundation. **Ink** is the warm near-black background family
(`ink`, `ink-2` raised panels, `ink-3` cards/inputs). **Bone** is the off-white type
family (`bone`, `bone-dim` secondary, `bone-faint` tertiary/captions).
*Avoid:* black, white, background, foreground, dark, light — as *names*. Use the
tokens: `bg-ink-2`, `text-bone-dim`. Never a raw hex in a component.

### Accents
Four, used sparingly and deliberately: **salt** (`#f3b9c6`, the pink whisper),
**silver** (the chrome droplet), **hydration** (cool blue) and **sports** (warm
orange) as the per-blend accents. Accent-per-blend is looked up by slug, not
hardcoded per component.

### Type roles
Three fonts, each with a job — address them by role, never by family name:
- `font-display` (Fraunces) — headings. The `.display-xl` utility.
- `font-sans` (Geist) — body and UI.
- `font-mono` (JetBrains Mono) — technical labels: stats, prices, index numbers.

### Kicker
The small uppercase mono label above a heading, usually `/ The Collection`,
`/ 01`. Utility class `.kicker`. The leading slash is part of the house style.
*Avoid:* eyebrow, overline, label, tag.

### Grain
The fixed film-grain SVG noise overlay applied via the `.grain` class on the page
shell. Sits at `z-index: 1`, which is exactly why `<main>` is `z-[2]` everywhere.
If content ever renders *under* the texture, this is why.

### Reveal
The scroll-into-view animation wrapper, `@/components/ui/reveal`. **The** way things
animate in. Don't hand-roll `motion.div` variants for scroll reveals — extend
`Reveal` if it can't do what you need.

### Dark-only
The site has exactly one theme. `app/layout.tsx` sets `forcedTheme="dark"` on
`ThemeProvider`, so `dark:` variants are dead code and light-mode values are never
read. The shadcn tokens (`--background`, `--card`, …) are intentionally mapped onto
the ink palette so `components/ui/*` keeps working unmodified — keep that mapping.

---

## Terms we are NOT using yet

Listed so nobody quietly invents a meaning for them mid-feature. When any of these
becomes real, define it here in the same session:

**cart, checkout, order, payment, Razorpay** — no commerce exists. `razorpay` is an
installed dependency with zero importers. There is no "buy" path; product pages end
at a CTA.

**customer, account, user** — no auth, no accounts, no user records. The quiz result
is not a user profile.

**inventory, stock, servings-remaining** — `quantity` on a `Product` is display copy
(`"/ per pack (50 servings)"`), a string, not a number. It is not stock tracking.

**CMS, content** — all copy is hardcoded in TSX, including the seven document
pages. Nothing renders markdown at runtime.
