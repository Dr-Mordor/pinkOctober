import { supabase } from "./client.js";
import { showError } from "./dom.js";
import { loadInstitutionsList } from "./institutions.js";
import { loadAnalytics } from "./analytics.js";

const views = {
	login: document.getElementById("viewLogin"),
	denied: document.getElementById("viewDenied"),
	institutions: document.getElementById("viewInstitutions"),
	analytics: document.getElementById("viewAnalytics"),
};
const tabs = document.getElementById("adminTabs");
const logoutBtn = document.getElementById("logoutBtn");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

function show(name) {
	for (const [key, view] of Object.entries(views)) view.hidden = key !== name;
	const signedIn = name === "institutions" || name === "analytics";
	tabs.hidden = !signedIn;
	logoutBtn.hidden = !(signedIn || name === "denied");
	for (const tab of tabs.querySelectorAll(".admin-tab")) {
		tab.setAttribute("aria-selected", String(tab.dataset.tab === name));
	}
}

function openTab(name) {
	show(name);
	if (name === "institutions") loadInstitutionsList();
	else loadAnalytics();
}

// The server enforces access (row-level security); this check only decides
// which screen to show, so a signed-in non-admin sees an explanation
// instead of empty tables.
async function route() {
	const { data: sessionData } = await supabase.auth.getSession();
	if (!sessionData.session) return show("login");
	const { data: isAdmin, error } = await supabase.rpc("is_admin");
	if (error || !isAdmin) return show("denied");
	openTab(location.hash === "#analytics" ? "analytics" : "institutions");
}

loginForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	showError(loginError, "");
	const fd = new FormData(loginForm);
	const { error } = await supabase.auth.signInWithPassword({
		email: fd.get("email"),
		password: fd.get("password"),
	});
	if (error) return showError(loginError, "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
	loginForm.reset();
	await route();
});

logoutBtn.addEventListener("click", async () => {
	await supabase.auth.signOut();
	show("login");
});

tabs.addEventListener("click", (event) => {
	const tab = event.target.closest(".admin-tab");
	if (!tab) return;
	location.hash = tab.dataset.tab === "analytics" ? "analytics" : "";
	openTab(tab.dataset.tab);
});

route();
