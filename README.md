# Nexus.xReal

website project template for nexus.co.ps

> **This branch (`frameworkTestingSvelte`) is a technology spike.** The
> `main` branch is intentionally vanilla HTML/CSS/JS with no build step (see
> [rules.md](rules.md)) — this branch exists only to evaluate rewriting the
> same app in Svelte, and is not meant to replace `main`. There's a sibling
> `frameworkTestingVUE` branch doing the same rewrite in Vue, for comparison.

tech stack (this branch):
- Svelte 5 (runes: `$state`, `$props`, `$derived`) + Vite
- css (vanilla, modular — `css/*.css`, unchanged from `main`, served from `public/css/`)
- DB none

## Running locally

```bash
npm install
npm run dev       # dev server with hot reload
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

`public/` holds everything Vite copies to the build output as-is: the shared `css/*.css` (identical to `main`'s, unchanged, so all three versions stay visually interchangeable), `data/institutions.json`, `assets/qr-code.{svg,png}`, and the standalone `qr.html`.

## Pink October Nablus — project notes

This is a digital guide ("طريق إلى الخدمة", a path to service — not a medical app) that helps women in Nablus find breast cancer screening, imaging, diagnosis, treatment, psychosocial support, navigation, and palliative/home care services during the Pink October 2026 campaign. It's meant to be reached via a QR code, so it stays mobile-first, fast, and account-free — no sign-ups, no medical records collected.

### Why this looks different from the vanilla version

The vanilla `main` branch keeps both views (`#viewHome`, `#viewResults`) permanently in the DOM and toggles `[hidden]`, which meant the CSS entrance animation needed a manual "remove class, force a reflow, re-add class" dance in JS to replay on every switch (`showView()` in the old `script.js`).

Here, [`App.svelte`](src/App.svelte) uses `{#if}/{:else}` between `HomeView` and `ResultsView`, plus a `{#key activePath.key}` block around `ResultsView` — so switching views (or between two different results paths) always mounts a brand-new DOM node, and a freshly created node just plays its CSS animation on its own. No reflow hack needed.

[`InstitutionCard.svelte`](src/components/InstitutionCard.svelte) replaces the vanilla version's hand-built, manually-escaped HTML strings with markup driven by `$derived()` values; `{expression}` and attribute bindings escape automatically. The "which fields does this institution actually have" logic is the same declarative `[key, label]` table idea as the vanilla/Vue versions, just expressed with `$derived` instead of a string-building helper.

Reactive state that isn't local to one component ([`hashRoute.svelte.js`](src/lib/hashRoute.svelte.js) for the URL hash, [`institutions.svelte.js`](src/lib/institutions.svelte.js) for the async fetch) lives in plain classes using Svelte 5's `$state` rune in a `.svelte.js` module — the idiomatic way to share reactive state outside a component in Svelte 5, playing the same role the Vue branch's composables do.

One concrete thing the Svelte compiler caught that the other two versions don't: it refused to build while `role="listitem"` sat directly on the `<button>` in the journey card (an interactive element can't carry a non-interactive ARIA role). [`JourneyCard.svelte`](src/components/JourneyCard.svelte) fixes it by moving that role onto a wrapping `<div>` — worth porting back to `main` and the Vue branch, both of which have the same button.

- **Home** ([`HomeView.svelte`](src/components/HomeView.svelte)) — one question, "أين أنتِ الآن في رحلتك؟", with 8 fixed path cards from [`src/paths.js`](src/paths.js).
- **Results** ([`ResultsView.svelte`](src/components/ResultsView.svelte)) — tapping a card sets the hash to `#<pathKey>` and shows only institutions tagged with that path, with a back button and a "اختيار مسار آخر" button to return home.
- Routing is still just the URL hash — see [`hashRoute.svelte.js`](src/lib/hashRoute.svelte.js) — so `index.html#diagnosis` still opens straight into the diagnosis results, and back/forward still work for free.

### Data: adding or removing institutions

Institutions and services live in [public/data/institutions.json](public/data/institutions.json) — a plain JSON array, kept separate from the app logic in `src/paths.js` so it can be edited without touching any code. To add, edit, or remove an organization, just add/edit/delete an object in that array. Fields:

- `id` — unique slug
- `name`, `department`, `type` — display name, unit/department (e.g. "وحدة الثدي"), and service type (e.g. "مستشفى", "مختبر تشخيصي")
- `area`, `address`, `hours` — optional location/hours
- `mapsQuery` — text used to build the "الاتجاهات" Google Maps link (`https://www.google.com/maps/search/?api=1&query=...`); falls back to `address` then `name` if omitted. There's no in-house map — this only links out to Google Maps, per the project's "no backend" constraint.
- `phone`, `whatsapp`, `email` — contact links; each only renders a button when present (`whatsapp` is digits-only, used to build a `wa.me` link)
- `services` — array of service names shown as chips
- `pricing`, `freeService`, `insurance`, `referral`, `booking`, `requirements` — the institutional-intake fields from the project brief (cost/how it's calculated, free-service conditions, required insurance, required referrals, booking method + hours, what the patient needs to bring); each only renders when non-empty
- `lastVerified`, `nextUpdate` — plain date strings shown as a small verification note
- `notes` — optional free text
- `pathTags` — array of one or more of the 8 journey keys from `src/paths.js` (`reassurance`, `evaluation`, `imaging`, `diagnosis`, `treatment`, `psychosocial`, `navigation`, `palliative`); this is what makes the entry show up under a given path
- `isPlaceholder` — set to `true` on sample/unverified entries so the UI shows a "بيانات نموذجية" badge; remove this field once an entry is confirmed real

The 8 institutions currently in the file are the ones named in the project brief, with their general services filled in — but contact details, pricing, insurance, referral, booking, and requirements are intentionally left blank and marked `isPlaceholder: true`, since the brief is explicit that nothing gets published before each institution reviews and signs off on its own entry. Fill those fields in as each institution's data is verified, and clear `isPlaceholder` once it is.

There is no admin dashboard yet — editing this JSON file (by hand or via a future admin UI) and rebuilding/redeploying is the update workflow for this phase.

### QR code

[public/qr.html](public/qr.html) is a standalone printable page (not linked from the app) for the campaign's design/print team, showing the code plus downloadable [public/assets/qr-code.svg](public/assets/qr-code.svg) (vector, for print) and [public/assets/qr-code.png](public/assets/qr-code.png). Both are static files pre-generated to encode the site's URL (from [CNAME](CNAME)) — nothing is generated at runtime or via a third-party API. Regenerate them if the domain changes:

```bash
pip install segno
python3 -c "
import segno
qr = segno.make('https://pinkoctober.tonystark-webmaster.com/', error='h')
qr.save('public/assets/qr-code.svg', scale=10, dark='#a3125a', light='#ffffff')
qr.save('public/assets/qr-code.png', scale=20, dark='#a3125a', light='#ffffff')
"
```
