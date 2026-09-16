These rules apply to the `main` branch:

languages exist only in their files with extensions respectively.
vanilla css only — no sass, no build step, no preprocessor.
vanilla js only — no typescript, no bundler, no frameworks.
no backend services and api.
no databases.

`frameworkTestingVUE` and `frameworkTestingSvelte` are the deliberate
exception: each is a spike rewriting the same app in one framework, to
evaluate it against the vanilla version. Neither is meant to replace `main`
or ship to the campaign domain — see each branch's README for what changed
and why.
