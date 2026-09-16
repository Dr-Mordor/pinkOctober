import { PATHS } from "./paths.js";

function escapeHtml(value) {
	const div = document.createElement("div");
	div.textContent = value ?? "";
	return div.innerHTML;
}

function pathTitle(key) {
	return PATHS.find((p) => p.key === key)?.title ?? key;
}

export function renderResultsHeading(el, path) {
	el.innerHTML = `
		<span class="results-heading-icon" aria-hidden="true">${path.icon}</span>
		<div>
			<h2>${path.title}</h2>
			<p>${path.desc}</p>
		</div>
	`;
}

function institutionCard(inst) {
	const card = document.createElement("article");
	card.className = "institution-card";
	card.setAttribute("role", "listitem");

	const metaItems = [
		inst.area && `<li>📍 ${escapeHtml(inst.area)}</li>`,
		inst.address && `<li>🏢 ${escapeHtml(inst.address)}</li>`,
		inst.hours && `<li>🕐 ${escapeHtml(inst.hours)}</li>`,
		inst.notes && `<li>💬 ${escapeHtml(inst.notes)}</li>`,
	]
		.filter(Boolean)
		.join("");

	const tags = (inst.pathTags ?? [])
		.map((key) => `<span class="institution-tag">${escapeHtml(pathTitle(key))}</span>`)
		.join("");

	const callBtn = inst.phone
		? `<a class="btn btn-call" href="tel:${escapeHtml(inst.phone.replace(/[^\d+]/g, ""))}">📞 اتصال: ${escapeHtml(inst.phone)}</a>`
		: "";

	card.innerHTML = `
		${inst.isPlaceholder ? '<span class="institution-placeholder-badge">بيانات نموذجية</span>' : ""}
		<h3>${escapeHtml(inst.name)}</h3>
		<p class="institution-type">${escapeHtml(inst.type)}</p>
		${metaItems ? `<ul class="institution-meta">${metaItems}</ul>` : ""}
		${callBtn}
		${tags ? `<div class="institution-tags">${tags}</div>` : ""}
	`;

	return card;
}

export function renderInstitutions(listEl, institutions, pathKey) {
	listEl.innerHTML = "";

	const filtered = institutions.filter((inst) => (inst.pathTags ?? []).includes(pathKey));

	if (filtered.length === 0) {
		const empty = document.createElement("p");
		empty.className = "directory-empty";
		empty.textContent = "لا تتوفر جهات مرتبطة بهذا المسار حالياً.";
		listEl.appendChild(empty);
		return;
	}

	for (const inst of filtered) {
		listEl.appendChild(institutionCard(inst));
	}
}
