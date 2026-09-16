// The URL hash is the single source of truth for which path is showing —
// same contract as the vanilla version: back/forward, a shared deep link,
// and clicking a journey card all just change location.hash. A single
// instance (not a per-component composable) is enough here since there's
// exactly one route for the whole app's lifetime.
function readHash() {
	return location.hash.slice(1);
}

class HashRoute {
	key = $state(readHash());

	constructor() {
		window.addEventListener("hashchange", () => {
			this.key = readHash();
		});
	}

	goTo(key) {
		location.hash = key;
	}

	goHome() {
		if (location.hash) location.hash = "";
	}
}

export const hashRoute = new HashRoute();
