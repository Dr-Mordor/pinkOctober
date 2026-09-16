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
		<div>
			<h2>${path.title}</h2>
			<p>${path.desc}</p>
		</div>
	`;
}

function mapsUrl(inst) {
	const query = inst.mapsQuery || inst.address || inst.name;
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function institutionCard(inst) {
	const card = document.createElement("article");
	card.className = "institution-card";
	card.setAttribute("role", "listitem");

	const metaItems = [
		inst.area && `<li>المنطقة: ${escapeHtml(inst.area)}</li>`,
		inst.address && `<li>العنوان: ${escapeHtml(inst.address)}</li>`,
		inst.hours && `<li>أوقات الدوام: ${escapeHtml(inst.hours)}</li>`,
	]
		.filter(Boolean)
		.join("");

	const services = (inst.services ?? [])
		.map((s) => `<li>${escapeHtml(s)}</li>`)
		.join("");

	const detailRows = [
		inst.pricing && ["التكلفة", inst.pricing],
		inst.freeService && ["الخدمة المجانية", inst.freeService],
		inst.insurance && ["التأمين الصحي", inst.insurance],
		inst.referral && ["التحويل المطلوب", inst.referral],
		inst.booking && ["الحجز والمواعيد", inst.booking],
		inst.requirements && ["المتطلبات", inst.requirements],
	]
		.filter(Boolean)
		.map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`)
		.join("");

	const tags = (inst.pathTags ?? [])
		.map((key) => `<span class="institution-tag">${escapeHtml(pathTitle(key))}</span>`)
		.join("");

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

	const verification =
		inst.lastVerified || inst.nextUpdate
			? `<p class="institution-verification">
				${inst.lastVerified ? `آخر تحقق: ${escapeHtml(inst.lastVerified)}` : ""}
				${inst.nextUpdate ? ` · التحديث القادم: ${escapeHtml(inst.nextUpdate)}` : ""}
			</p>`
			: "";

	card.innerHTML = `
		${inst.isPlaceholder ? '<span class="institution-placeholder-badge">بيانات نموذجية</span>' : ""}
		<h3>${escapeHtml(inst.name)}</h3>
		<p class="institution-type">${escapeHtml(inst.department ? `${inst.type} · ${inst.department}` : inst.type)}</p>
		${services ? `<ul class="institution-services">${services}</ul>` : ""}
		${metaItems ? `<ul class="institution-meta">${metaItems}</ul>` : ""}
		${detailRows ? `<dl class="institution-details">${detailRows}</dl>` : ""}
		${inst.notes ? `<p class="institution-notes">${escapeHtml(inst.notes)}</p>` : ""}
		<div class="institution-actions">${actions}</div>
		${verification}
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
