# Nexus.xReal
website project template for nexus.co.ps

tech stack:
- html
- css (vanilla, modular — `css/*.css`, no build step)
- javascript (vanilla ES modules, `script.js` + `js/`)
- DB: Supabase (Postgres + Auth), called straight from the browser — see "Admin & analytics" below

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
- `name`, `department`, `type` — display name, unit/department (e.g. "وحدة الثدي"), and service type (e.g. "مستشفى", "مختبر تشخيصي")
- `area`, `address`, `hours` — optional location/hours
- `mapsQuery` — text used to build the "الاتجاهات" Google Maps link (`https://www.google.com/maps/search/?api=1&query=...`); falls back to `address` then `name` if omitted. There's no in-house map — this only links out to Google Maps, per the project's "no backend" constraint.
- `phone`, `whatsapp`, `email` — contact links; each only renders a button when present (`whatsapp` is digits-only, used to build a `wa.me` link)
- `services` — array of service names shown as chips
- `pricing`, `freeService`, `insurance`, `referral`, `booking`, `requirements` — the institutional-intake fields from the project brief (cost/how it's calculated, free-service conditions, required insurance, required referrals, booking method + hours, what the patient needs to bring); each only renders when non-empty
- `lastVerified`, `nextUpdate` — plain date strings shown as a small verification note
- `notes` — optional free text
- `pathTags` — array of one or more of the 8 journey keys from `js/paths.js` (`reassurance`, `evaluation`, `imaging`, `diagnosis`, `treatment`, `psychosocial`, `navigation`, `palliative`); this is what makes the entry show up under a given path
- `isPlaceholder` — set to `true` on sample/unverified entries so the UI shows a "بيانات نموذجية" badge; remove this field once an entry is confirmed real

The 8 institutions currently in the file are the ones named in the project brief, with their general services filled in — but contact details, pricing, insurance, referral, booking, and requirements are intentionally left blank and marked `isPlaceholder: true`, since the brief is explicit that nothing gets published before each institution reviews and signs off on its own entry. Fill those fields in as each institution's data is verified, and clear `isPlaceholder` once it is.

The live source of truth is now the Supabase `institutions` table (edited from the admin page). `data/institutions.json` is kept as the seed and as an offline fallback: if the database can't be reached, the public guide loads this file instead.

## Admin & analytics

One admin page, [admin/index.html](admin/index.html) (`/admin/`, `noindex`), with two tabs:

- **الجهات** — add, edit, hide/publish and delete institutions (same fields as the JSON above, plus `isPublished` and `sortOrder`).
- **الإحصائيات** — sessions, which journey paths visitors pick (the "form choices"), and call/WhatsApp/email/directions clicks per institution, for the last 7/30/90 days.

Supabase project: `pink-october-nablus` (`otyyvuqpluycwwdayvzr`). Browser code lives in `js/config.js` (URL + publishable key — safe to ship; row-level security does the protecting), `js/data.js` (load institutions), `js/track.js` (anonymous event logging: random per-tab id, event type, path, institution, button — no personal data), and `js/admin/*` (login, institutions CRUD, analytics; pulls `supabase-js` from jsDelivr).

Tables (RLS on all): `institutions` (public can read published rows; admins write), `events` (public can insert, only admins can read), `admins` (allow-list of admin emails). `analytics_summary(days)` is an admin-only RPC.

### Adding an admin

1. Supabase dashboard → Authentication → Users → *Add user* (email + password).
2. Run in the SQL editor: `insert into public.admins (email) values ('name@example.com');` (lower-case email).

### Running locally

Because the directory is fetched from `data/institutions.json` via `fetch()`, opening `index.html` directly from disk (`file://`) will fail to load it in most browsers. Serve the folder statically instead, e.g.:

```bash
python3 -m http.server 8000
```

then open `http://localhost:8000`.

### QR code

[qr.html](qr.html) is a standalone printable page (not linked from the app) for the campaign's design/print team, showing the code plus downloadable [assets/qr-code.svg](assets/qr-code.svg) (vector, for print) and [assets/qr-code.png](assets/qr-code.png). Both are static files pre-generated to encode the site's URL (from [CNAME](CNAME)) — nothing is generated at runtime or via a third-party API. Regenerate them if the domain changes:

```bash
pip install segno
python3 -c "
import segno
qr = segno.make('https://pinkoctober.tonystark-webmaster.com/', error='h')
qr.save('assets/qr-code.svg', scale=10, dark='#a3125a', light='#ffffff')
qr.save('assets/qr-code.png', scale=20, dark='#a3125a', light='#ffffff')
"
```
