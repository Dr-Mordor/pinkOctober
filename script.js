import { findPath } from "./js/paths.js";
import { loadInstitutions } from "./js/data.js";
import { renderJourney, renderInstitutions, renderResultsHeading } from "./js/render.js";

const viewHome = document.getElementById("viewHome");
const viewResults = document.getElementById("viewResults");
const journeyGrid = document.getElementById("journeyGrid");
const directoryList = document.getElementById("directoryList");
const resultsHeading = document.getElementById("resultsHeading");
const backBtn = document.getElementById("backBtn");
const browseOtherBtn = document.getElementById("browseOtherBtn");
const appBarTitle = document.getElementById("appBarTitle");

// Read once from the DOM rather than hardcoded a second time — whatever
// title index.html ships with is "home", by definition.
const HOME_TITLE = appBarTitle.textContent;

// Institutions load over the network and can resolve after the user has
// already picked a path, so the app starts with an empty list and fills
// it in once loadInstitutions() below settles.
let institutions = [];

function showView(view) {
	viewHome.hidden = view !== viewHome;
	viewResults.hidden = view !== viewResults;

	// Re-trigger the CSS entrance animation on every switch. Toggling the
	// same class off and back on is normally a no-op — reading offsetWidth
	// forces the browser to apply the removal before the class is re-added.
	view.classList.remove("view-enter");
	void view.offsetWidth;
	view.classList.add("view-enter");
}

function renderHome() {
	backBtn.hidden = true;
	appBarTitle.textContent = HOME_TITLE;
	showView(viewHome);
}

function renderResults(pathKey) {
	const path = findPath(pathKey);
	if (!path) {
		renderHome(); // unrecognized hash (typo, stale link) — home is the safe fallback
		return;
	}
	backBtn.hidden = false;
	appBarTitle.textContent = path.title;
	renderResultsHeading(resultsHeading, path);
	renderInstitutions(directoryList, institutions, pathKey);
	showView(viewResults);
}

// The URL hash is the single source of truth for which view is showing.
// Clicking a journey card, the back button, browser back/forward, and a
// shared deep link all boil down to "location.hash changed" — this is the
// one place that reacts to it, so there's no separate app state that could
// drift out of sync with the URL.
function syncWithHash() {
	const key = location.hash.slice(1);
	if (key) {
		renderResults(key);
	} else {
		renderHome();
	}
}

function goToResults(pathKey) {
	location.hash = pathKey;
}

function goHome() {
	if (location.hash) location.hash = "";
}

backBtn.addEventListener("click", goHome);
browseOtherBtn.addEventListener("click", goHome);
window.addEventListener("hashchange", syncWithHash);

renderJourney(journeyGrid, goToResults);
syncWithHash();

loadInstitutions()
	.then((data) => {
		institutions = data;
		// Patch just the directory list for whatever path is open right now.
		// Re-running syncWithHash() would also replay renderHome()'s entrance
		// animation if the user has already navigated back while this loaded.
		const key = location.hash.slice(1);
		if (key) renderInstitutions(directoryList, institutions, key);
	})
	.catch((error) => {
		console.error("could not load the institutions directory:", error);
	});
