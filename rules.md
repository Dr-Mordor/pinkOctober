languages exist only in their files with extensions respectively.
vanilla css only — no sass, no build step, no preprocessor.
vanilla js only — no typescript, no bundler, no frameworks.
backend: Supabase only (database + auth), reached from the browser — no custom server code.
the public guide must keep working if Supabase is unreachable (it falls back to data/institutions.json).
