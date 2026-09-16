import { PATHS } from "./js/paths.js";
import { loadInstitutions } from "./js/data.js";
import { renderJourney } from "./js/render-journey.js";
import { renderInstitutions, renderResultsHeading } from "./js/render-directory.js";

const viewHome = document.getElementById("viewHome");
const viewResults = document.getElementById("viewResults");
const journeyGrid = document.getElementById("journeyGrid");
const directoryList = document.getElementById("directoryList");
const resultsHeading = document.getElementById("resultsHeading");
const backBtn = document.getElementById("backBtn");
const browseOtherBtn = document.getElementById("browseOtherBtn");
const appBarTitle = document.getElementById("appBarTitle");
const DEFAULT_TITLE = appBarTitle.textContent;

let institutions = [];

function showView(view) {
	viewHome.hidden = view !== viewHome;
	viewResults.hidden = view !== viewResults;
	view.classList.remove("view-enter");
	void view.offsetWidth;
	view.classList.add("view-enter");
}

function renderHome() {
	backBtn.hidden = true;
	appBarTitle.textContent = DEFAULT_TITLE;
	showView(viewHome);
}

function renderResults(pathKey) {
	const path = PATHS.find((p) => p.key === pathKey);
	if (!path) {
		renderHome();
		return;
	}
	backBtn.hidden = false;
	appBarTitle.textContent = path.title;
	renderResultsHeading(resultsHeading, path);
	renderInstitutions(directoryList, institutions, pathKey);
	showView(viewResults);
}

// The URL hash is the single source of truth for which view is showing,
// so back/forward, deep links, and in-app navigation all resolve the same way.
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
	if (location.hash) {
		location.hash = "";
	}
}

backBtn.addEventListener("click", goHome);
browseOtherBtn.addEventListener("click", goHome);
window.addEventListener("hashchange", syncWithHash);

renderJourney(journeyGrid, PATHS, goToResults);
syncWithHash();

loadInstitutions()
	.then((data) => {
		institutions = data;
		const key = location.hash.slice(1);
		if (key) renderInstitutions(directoryList, institutions, key);
	})
	.catch((err) => {
		console.error(err);
	});
