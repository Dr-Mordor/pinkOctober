// Everything that turns data into DOM for the two views (the home journey
// grid and the results directory). Kept in one file because both views are
// small and always used together — splitting them added file-hopping
// without adding clarity.
import { PATHS, findPath } from "./paths.js";

// Institution data will eventually come from hand-edited JSON (and later,
// maybe a simple admin form) — not from code we control — so every value
// is escaped before it lands in a template string. Routing it through a
// detached element's textContent leans on the browser's own escaper
// instead of a hand-rolled regex that could miss a case.
function escapeHtml(value) {
	const div = document.createElement("div");
	div.textContent = value ?? "";
	return div.innerHTML;
}

export function renderJourney(container, onSelect) {
	container.innerHTML = "";
	for (const path of PATHS) {
		const card = document.createElement("button");
		card.type = "button";
		card.className = "journey-card";
		card.setAttribute("role", "listitem");
		card.innerHTML = `<h3>${path.title}</h3><p>${path.desc}</p>`;
		card.addEventListener("click", () => onSelect(path.key));
		container.appendChild(card);
	}
}

export function renderResultsHeading(el, path) {
	el.innerHTML = `<h2>${path.title}</h2><p>${path.desc}</p>`;
}

// No institution has confirmed map coordinates (some share a building, some
// may never get a pin), so "directions" is always a Google Maps text
// search rather than an embedded map we'd have to geocode and maintain.
function mapsUrl(inst) {
	const query = inst.mapsQuery || inst.address || inst.name;
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// Institution entries fill in gradually as each organization signs off on
// its own data (see README) — most start out with only a name and a list
// of services. These two tables map a JSON field to its Arabic label;
// renderFieldList() below silently skips whatever a given entry doesn't
// have yet, so a half-filled entry never shows a blank line.
const LOCATION_FIELDS = [
	["area", "المنطقة"],
	["address", "العنوان"],
	["hours", "أوقات الدوام"],
];

const INTAKE_FIELDS = [
	["pricing", "التكلفة"],
	["freeService", "الخدمة المجانية"],
	["insurance", "التأمين الصحي"],
	["referral", "التحويل المطلوب"],
	["booking", "الحجز والمواعيد"],
	["requirements", "المتطلبات"],
];

// Location details (plain bullets) and intake details (label + value pairs)
// are the same problem in two shapes: pick whichever fields this record
// actually has, render one row per field, skip the wrapper tag entirely if
// none apply. One function instead of two copies of that logic.
function renderFieldList(tag, className, fields, record, toRow) {
	const rows = fields
		.filter(([key]) => record[key])
		.map(([key, label]) => toRow(label, record[key]))
		.join("");
	return rows ? `<${tag} class="${className}">${rows}</${tag}>` : "";
}

function institutionCard(inst) {
	const card = document.createElement("article");
	card.className = "institution-card";
	card.setAttribute("role", "listitem");

	const services = inst.services?.length
		? `<ul class="institution-services">${inst.services.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>`
		: "";

	const location = renderFieldList(
		"ul",
		"institution-meta",
		LOCATION_FIELDS,
		inst,
		(label, value) => `<li>${label}: ${escapeHtml(value)}</li>`,
	);

	const details = renderFieldList(
		"dl",
		"institution-details",
		INTAKE_FIELDS,
		inst,
		(label, value) => `<dt>${label}</dt><dd>${escapeHtml(value)}</dd>`,
	);

	// Each contact method is a differently-shaped link (tel:, wa.me/,
	// mailto:), so — unlike the field lists above — a lookup table would
	// need as much branching as it saves. Directions has no condition:
	// every institution gets a maps link even with nothing but a name.
	const actions = [
		inst.phone &&
			`<a class="btn btn-call" href="tel:${escapeHtml(inst.phone.replace(/[^\d+]/g, ""))}">اتصال</a>`,
		inst.whatsapp &&
			`<a class="btn btn-whatsapp" href="https://wa.me/${escapeHtml(inst.whatsapp.replace(/[^\d]/g, ""))}" target="_blank" rel="noopener">واتساب</a>`,
		inst.email &&
			`<a class="btn btn-email" href="mailto:${escapeHtml(inst.email)}">بريد إلكتروني</a>`,
		`<a class="btn btn-directions" href="${mapsUrl(inst)}" target="_blank" rel="noopener">الاتجاهات</a>`,
	]
		.filter(Boolean)
		.join("");

	const verifiedOn = [
		inst.lastVerified && `آخر تحقق: ${escapeHtml(inst.lastVerified)}`,
		inst.nextUpdate && `التحديث القادم: ${escapeHtml(inst.nextUpdate)}`,
	]
		.filter(Boolean)
		.join(" · ");

	const tags = (inst.pathTags ?? [])
		.map((key) => `<span class="institution-tag">${escapeHtml(findPath(key)?.title ?? key)}</span>`)
		.join("");

	card.innerHTML = `
		${inst.isPlaceholder ? '<span class="institution-placeholder-badge">بيانات نموذجية</span>' : ""}
		<h3>${escapeHtml(inst.name)}</h3>
		<p class="institution-type">${escapeHtml(inst.department ? `${inst.type} · ${inst.department}` : inst.type)}</p>
		${services}
		${location}
		${details}
		${inst.notes ? `<p class="institution-notes">${escapeHtml(inst.notes)}</p>` : ""}
		<div class="institution-actions">${actions}</div>
		${verifiedOn ? `<p class="institution-verification">${verifiedOn}</p>` : ""}
		${tags ? `<div class="institution-tags">${tags}</div>` : ""}
	`;

	return card;
}

export function renderInstitutions(listEl, institutions, pathKey) {
	listEl.innerHTML = "";
	const matches = institutions.filter((inst) => inst.pathTags?.includes(pathKey));

	if (matches.length === 0) {
		listEl.innerHTML = `<p class="directory-empty">لا تتوفر جهات مرتبطة بهذا المسار حالياً.</p>`;
		return;
	}

	for (const inst of matches) {
		listEl.appendChild(institutionCard(inst));
	}
}
