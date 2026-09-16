# Nexus.xReal
website project template for nexus.co.ps

tech stack:
- html
- css (vanilla, modular — `css/*.css`, no build step)
- javascript (vanilla ES modules, `script.js` + `js/`)
- DB none (right now)

no npm, no bundler, no preprocessor. Open `index.html` directly (or serve the folder statically).

`css/` is split by concern, one stylesheet per `<link>` in `index.html`:
- `tokens.css` — design tokens (`:root` custom properties) + the `@layer` order declaration
- `base.css` — reset + global element defaults + typography utilities
- `layout.css` — app shell (`.app`, sticky app bar, container)
- `buttons.css`, `journey.css`, `directory.css` — one file per page section/component
- `motion.css` — view-transition and reveal animations, highest-priority layer

The actual cascade order comes from the `@layer` statement in `tokens.css` (`base, layout, components, motion`), not from `<link>` order — a rule in a later layer always wins over one in an earlier layer, regardless of selector specificity. Edit whichever file matches what you're changing; there's nothing to compile.

## Pink October Nablus — project notes

This instance of the template is a digital guide ("طريق إلى الخدمة", a path to service — not a medical app) that helps women in Nablus find breast cancer screening, imaging, diagnosis, treatment, psychosocial support, navigation, and palliative/home care services during the Pink October 2026 campaign. It's meant to be reached via a QR code, so it stays mobile-first, fast, and account-free — no sign-ups, no medical records collected.

It's a single-page app with two views swapped client-side (`#viewHome`, `#viewResults` in [index.html](index.html)) — no framework, just plain DOM in [script.js](script.js). The URL hash is the single source of truth for which view is showing: setting `location.hash` navigates, the `hashchange` event re-renders (covering clicks, back/forward, and typed/shared links alike), and there's no separate app state to keep in sync.

- **Home** — one question, "أين أنتِ الآن في رحلتك؟", with 8 fixed path cards defined in [js/paths.js](js/paths.js).
- **Results** — tapping a card sets the hash to `#<pathKey>` and swaps to a results view showing only institutions tagged with that path, with a back button and a "اختيار مسار آخر" button to return home.

The hash in the URL means a path is directly linkable/shareable, e.g. `index.html#diagnosis` opens straight into the diagnosis results — useful if a specific flyer or QR code should target one path. Browser back/forward work automatically since setting `location.hash` is itself a history entry.

### Data: adding or removing institutions

Institutions and services live in [data/institutions.json](data/institutions.json) — a plain JSON array, kept separate from the app logic in `js/paths.js` so it can be edited without touching any code. To add, edit, or remove an organization, just add/edit/delete an object in that array. Fields:

- `id` — unique slug
- `name`, `type` — display name and service type (e.g. "مركز فحص", "علاج الأورام")
- `area`, `address`, `phone`, `hours` — optional contact/location details
- `notes` — optional free text
- `pathTags` — array of one or more of the 8 journey keys from `js/paths.js` (`reassurance`, `evaluation`, `imaging`, `diagnosis`, `treatment`, `psychosocial`, `navigation`, `palliative`); this is what makes the entry show up under a given path
- `isPlaceholder` — set to `true` on sample/unverified entries so the UI shows a "بيانات نموذجية" badge; remove this field once an entry is confirmed real

The entries currently in the file are placeholders (clearly marked) to exercise the layout — replace them with the verified list of Nablus institutions before launch.

### Running locally

Because the directory is fetched from `data/institutions.json` via `fetch()`, opening `index.html` directly from disk (`file://`) will fail to load it in most browsers. Serve the folder statically instead, e.g.:

```bash
python3 -m http.server 8000
```

then open `http://localhost:8000`.
