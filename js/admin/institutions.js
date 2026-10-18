import { supabase } from "./client.js";
import { el, showError } from "./dom.js";
import { PATHS, findPath } from "../paths.js";
import { fromRow, toRow } from "../data.js";

const rowsEl = document.getElementById("institutionRows");
const listError = document.getElementById("listError");
const dialog = document.getElementById("institutionDialog");
const form = document.getElementById("institutionForm");
const fieldsEl = document.getElementById("institutionFields");
const dialogTitle = document.getElementById("dialogTitle");
const formError = document.getElementById("formError");
const saveBtn = document.getElementById("saveBtn");

const TEXT_FIELDS = [
	["name", "الاسم", true],
	["department", "القسم / الوحدة"],
	["type", "نوع الجهة (مستشفى، مختبر...)"],
	["area", "المنطقة"],
	["address", "العنوان"],
	["mapsQuery", "نص البحث في خرائط جوجل"],
	["phone", "الهاتف"],
	["whatsapp", "واتساب (أرقام فقط مع رمز الدولة)"],
	["email", "البريد الإلكتروني"],
	["hours", "أوقات الدوام"],
	["pricing", "التكلفة"],
	["freeService", "الخدمة المجانية"],
	["insurance", "التأمين الصحي"],
	["referral", "التحويل المطلوب"],
	["booking", "الحجز والمواعيد"],
	["requirements", "المتطلبات"],
	["lastVerified", "آخر تحقق"],
	["nextUpdate", "التحديث القادم"],
];

let institutions = [];
let editing = null; // the institution being edited, or null when adding

function emptyInstitution() {
	return {
		id: "",
		services: [],
		pathTags: [],
		isPlaceholder: true,
		isPublished: true,
		sortOrder: institutions.length,
		...Object.fromEntries(TEXT_FIELDS.map(([key]) => [key, ""])),
		notes: "",
	};
}

export async function loadInstitutionsList() {
	showError(listError, "");
	const { data, error } = await supabase
		.from("institutions")
		.select("*")
		.order("sort_order")
		.order("name");
	if (error) return showError(listError, `تعذّر تحميل الجهات: ${error.message}`);
	institutions = data.map(fromRow);
	renderRows();
}

function renderRows() {
	rowsEl.replaceChildren(
		...institutions.map((inst) =>
			el(
				"tr",
				{},
				el("td", {}, inst.name, inst.department ? ` · ${inst.department}` : ""),
				el("td", {}, inst.type),
				el("td", {}, inst.pathTags.map((k) => findPath(k)?.title ?? k).join("، ")),
				el(
					"td",
					{},
					el(
						"span",
						{ class: `admin-badge${inst.isPublished ? "" : " admin-badge-off"}` },
						inst.isPublished ? "منشورة" : "مخفية",
					),
					inst.isPlaceholder ? " " : null,
					inst.isPlaceholder ? el("span", { class: "admin-badge admin-badge-off" }, "نموذجية") : null,
				),
				el(
					"td",
					{},
					el(
						"div",
						{ class: "admin-row-actions" },
						el("button", { type: "button", class: "btn btn-quiet", onclick: () => openForm(inst) }, "تعديل"),
						el(
							"button",
							{ type: "button", class: "btn btn-quiet", onclick: () => togglePublished(inst) },
							inst.isPublished ? "إخفاء" : "نشر",
						),
						el("button", { type: "button", class: "btn btn-danger", onclick: () => remove(inst) }, "حذف"),
					),
				),
			),
		),
	);
}

async function togglePublished(inst) {
	const { error } = await supabase
		.from("institutions")
		.update({ is_published: !inst.isPublished })
		.eq("id", inst.id);
	if (error) return showError(listError, `تعذّر التحديث: ${error.message}`);
	await loadInstitutionsList();
}

async function remove(inst) {
	if (!confirm(`حذف «${inst.name}» نهائيًا؟`)) return;
	const { error } = await supabase.from("institutions").delete().eq("id", inst.id);
	if (error) return showError(listError, `تعذّر الحذف: ${error.message}`);
	await loadInstitutionsList();
}

function textField(name, label, value, { required = false, multiline = false, disabled = false } = {}) {
	const input = multiline
		? el("textarea", { name, rows: 3, value })
		: el("input", { type: "text", name, value, required, disabled });
	return el("label", {}, label, input);
}

function openForm(inst) {
	editing = inst.id ? inst : null;
	const data = inst.id ? inst : emptyInstitution();
	dialogTitle.textContent = editing ? `تعديل: ${data.name}` : "إضافة جهة";
	showError(formError, "");

	fieldsEl.replaceChildren(
		el(
			"label",
			{},
			"المعرّف (أحرف إنجليزية صغيرة وأرقام وشرطات، لا يتغيّر بعد الحفظ)",
			el("input", {
				type: "text",
				name: "id",
				value: data.id,
				required: true,
				disabled: Boolean(editing),
				pattern: "[a-z0-9\\-]+",
			}),
		),
		el("div", { class: "admin-form-grid" }, TEXT_FIELDS.map(([key, label, required]) => textField(key, label, data[key], { required }))),
		textField("services", "الخدمات (خدمة في كل سطر)", data.services.join("\n"), { multiline: true }),
		textField("notes", "ملاحظات", data.notes, { multiline: true }),
		el(
			"fieldset",
			{},
			el("legend", {}, "تظهر ضمن المسارات"),
			PATHS.map((path) =>
				el(
					"label",
					{},
					el("input", { type: "checkbox", name: "pathTags", value: path.key, checked: data.pathTags.includes(path.key) }),
					path.title,
				),
			),
		),
		el(
			"fieldset",
			{},
			el(
				"label",
				{},
				el("input", { type: "checkbox", name: "isPublished", checked: data.isPublished }),
				"منشورة في الموقع",
			),
			el(
				"label",
				{},
				el("input", { type: "checkbox", name: "isPlaceholder", checked: data.isPlaceholder }),
				"بيانات نموذجية (تظهر شارة «بيانات نموذجية»)",
			),
		),
		el("label", {}, "الترتيب", el("input", { type: "number", name: "sortOrder", value: data.sortOrder })),
	);
	dialog.showModal();
}

function readForm() {
	const fd = new FormData(form);
	const text = (key) => (fd.get(key) ?? "").toString().trim();
	const inst = {
		id: editing ? editing.id : text("id"),
		services: text("services").split("\n").map((s) => s.trim()).filter(Boolean),
		notes: text("notes"),
		pathTags: fd.getAll("pathTags"),
		isPublished: fd.has("isPublished"),
		isPlaceholder: fd.has("isPlaceholder"),
		sortOrder: Number.parseInt(text("sortOrder"), 10) || 0,
	};
	for (const [key] of TEXT_FIELDS) inst[key] = text(key);
	return inst;
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	showError(formError, "");
	const inst = readForm();
	saveBtn.disabled = true;
	const row = toRow(inst);
	const { error } = editing
		? await supabase.from("institutions").update(row).eq("id", editing.id)
		: await supabase.from("institutions").insert(row);
	saveBtn.disabled = false;
	if (error) {
		const duplicate = error.code === "23505";
		return showError(formError, duplicate ? "هذا المعرّف مستخدم لجهة أخرى." : `تعذّر الحفظ: ${error.message}`);
	}
	dialog.close();
	await loadInstitutionsList();
});

document.getElementById("cancelBtn").addEventListener("click", () => dialog.close());
document.getElementById("addInstitutionBtn").addEventListener("click", () => openForm({}));
