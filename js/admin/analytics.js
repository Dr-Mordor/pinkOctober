import { supabase } from "./client.js";
import { el, showError } from "./dom.js";
import { PATHS } from "../paths.js";
import { SURVEY } from "./survey.js";

const body = document.getElementById("analyticsBody");
const errorEl = document.getElementById("analyticsError");
const rangeSelect = document.getElementById("rangeSelect");

const ACTIONS = [
	["call", "اتصال"],
	["whatsapp", "واتساب"],
	["email", "بريد"],
	["directions", "اتجاهات"],
];

const nf = new Intl.NumberFormat("ar-EG-u-nu-latn");

function statCard(value, label) {
	return el("div", { class: "stat-card" }, el("strong", {}, nf.format(value)), el("span", {}, label));
}

function barList(rows) {
	if (rows.length === 0) return el("p", { class: "analytics-empty" }, "لا توجد بيانات بعد.");
	const max = Math.max(...rows.map((r) => r.value), 1);
	return rows.map((r) =>
		el(
			"div",
			{ class: "bar-row" },
			el("span", {}, r.label),
			el("div", { class: "bar-track" }, el("div", { class: "bar-fill", style: `width:${(r.value / max) * 100}%` })),
			el("span", { class: "bar-value" }, nf.format(r.value)),
		),
	);
}

function panel(title, ...content) {
	return el("section", { class: "panel" }, el("h2", {}, title), ...content);
}

export async function loadAnalytics() {
	showError(errorEl, "");
	body.replaceChildren(el("p", { class: "analytics-empty" }, "جارٍ التحميل..."));

	const [summary, names] = await Promise.all([
		supabase.rpc("analytics_summary", { days: Number(rangeSelect.value) }),
		supabase.from("institutions").select("id,name"),
	]);
	if (summary.error) {
		body.replaceChildren();
		return showError(errorEl, `تعذّر تحميل الإحصائيات: ${summary.error.message}`);
	}
	const data = summary.data;
	const nameOf = new Map((names.data ?? []).map((i) => [i.id, i.name]));

	// Every path appears, even with zero selections, so a path nobody opens is visible.
	const selectsByPath = new Map(data.by_path.map((p) => [p.path_key, p.count]));
	const pathRows = PATHS.map((p) => ({ label: p.title, value: selectsByPath.get(p.key) ?? 0 })).sort(
		(a, b) => b.value - a.value,
	);

	const perInstitution = new Map();
	for (const row of data.by_institution) {
		const entry = perInstitution.get(row.institution_id) ?? { total: 0 };
		entry[row.action] = row.count;
		entry.total += row.count;
		perInstitution.set(row.institution_id, entry);
	}
	const institutionRows = [...perInstitution].sort((a, b) => b[1].total - a[1].total);

	// One panel per question; every option is listed, even with zero answers.
	const answerCount = new Map(data.survey.answers.map((r) => [`${r.q}:${r.a}`, r.count]));
	const surveyPanels = SURVEY.map((question, qi) =>
		panel(
			`الاستبيان · ${question.title}`,
			barList(
				question.options.map((label, ai) => ({ label, value: answerCount.get(`${qi + 1}:${ai}`) ?? 0 })),
			),
		),
	);

	body.replaceChildren(
		el(
			"div",
			{ class: "stat-grid" },
			statCard(data.sessions, "زيارات (جلسات)"),
			statCard(data.page_views, "مشاهدات الصفحة الرئيسية"),
			statCard(data.path_selects, "اختيارات المسارات"),
			statCard(data.institution_actions, "نقرات على اتصال/اتجاهات"),
			statCard(data.survey.total, "استبيانات مكتملة"),
		),
		panel("اختيارات المسارات (ما تختاره الزائرات في النموذج)", barList(pathRows)),
		...surveyPanels,
		panel(
			"الزيارات اليومية",
			barList(data.by_day.map((d) => ({ label: d.day, value: d.sessions }))),
		),
		panel(
			"النقرات على الجهات",
			institutionRows.length === 0
				? el("p", { class: "analytics-empty" }, "لا توجد نقرات بعد.")
				: el(
						"div",
						{ class: "admin-table-wrap" },
						el(
							"table",
							{ class: "admin-table" },
							el("thead", {}, el("tr", {}, el("th", {}, "الجهة"), ACTIONS.map(([, label]) => el("th", {}, label)), el("th", {}, "المجموع"))),
							el(
								"tbody",
								{},
								institutionRows.map(([id, counts]) =>
									el(
										"tr",
										{},
										el("td", {}, nameOf.get(id) ?? id),
										ACTIONS.map(([key]) => el("td", {}, nf.format(counts[key] ?? 0))),
										el("td", {}, nf.format(counts.total)),
									),
								),
							),
						),
					),
		),
	);
}

rangeSelect.addEventListener("change", loadAnalytics);
