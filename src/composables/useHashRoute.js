import { onMounted, onUnmounted, ref } from "vue";

// The URL hash is the single source of truth for which path is showing —
// same contract as the vanilla version: back/forward, a shared deep link,
// and clicking a journey card all just change location.hash. This
// composable is the one place that turns that into reactive state Vue can
// render from, so there's no separate app state that could drift out of
// sync with the URL.
export function useHashRoute() {
	const pathKey = ref(location.hash.slice(1));

	function sync() {
		pathKey.value = location.hash.slice(1);
	}

	onMounted(() => window.addEventListener("hashchange", sync));
	onUnmounted(() => window.removeEventListener("hashchange", sync));

	function goTo(key) {
		location.hash = key;
	}

	function goHome() {
		if (location.hash) location.hash = "";
	}

	return { pathKey, goTo, goHome };
}
