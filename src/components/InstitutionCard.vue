<template>
	<article class="institution-card" role="listitem">
		<span v-if="inst.isPlaceholder" class="institution-placeholder-badge">بيانات نموذجية</span>
		<h3>{{ inst.name }}</h3>
		<p class="institution-type">{{ typeLine }}</p>

		<ul v-if="inst.services?.length" class="institution-services">
			<li v-for="service in inst.services" :key="service">{{ service }}</li>
		</ul>

		<ul v-if="locationFields.length" class="institution-meta">
			<li v-for="field in locationFields" :key="field.label">{{ field.label }}: {{ field.value }}</li>
		</ul>

		<dl v-if="intakeFields.length" class="institution-details">
			<template v-for="field in intakeFields" :key="field.label">
				<dt>{{ field.label }}</dt>
				<dd>{{ field.value }}</dd>
			</template>
		</dl>

		<p v-if="inst.notes" class="institution-notes">{{ inst.notes }}</p>

		<!-- Each contact method is a differently-shaped link (tel:, wa.me/,
		     mailto:), so — unlike the field lists above — a lookup table
		     would need as much branching as it saves. Directions has no
		     v-if: every institution gets a maps link even with just a name. -->
		<div class="institution-actions">
			<a v-if="inst.phone" class="btn btn-call" :href="`tel:${inst.phone.replace(/[^\d+]/g, '')}`">اتصال</a>
			<a
				v-if="inst.whatsapp"
				class="btn btn-whatsapp"
				:href="`https://wa.me/${inst.whatsapp.replace(/[^\d]/g, '')}`"
				target="_blank"
				rel="noopener"
				>واتساب</a
			>
			<a v-if="inst.email" class="btn btn-email" :href="`mailto:${inst.email}`">بريد إلكتروني</a>
			<a class="btn btn-directions" :href="mapsUrl" target="_blank" rel="noopener">الاتجاهات</a>
		</div>

		<p v-if="verifiedOn" class="institution-verification">{{ verifiedOn }}</p>

		<div v-if="inst.pathTags?.length" class="institution-tags">
			<span v-for="key in inst.pathTags" :key="key" class="institution-tag">{{ findPath(key)?.title ?? key }}</span>
		</div>
	</article>
</template>

<script setup>
import { computed } from "vue";
import { findPath } from "../paths.js";

const { inst } = defineProps(["inst"]);

// Institution entries fill in gradually as each organization signs off on
// its own data (see README) — most start out with only a name and a list
// of services. These two tables map a JSON field to its Arabic label;
// pickFields() below silently skips whatever a given entry doesn't have
// yet, so a half-filled entry never shows a blank row. Everything renders
// through {{ }} / :href bindings, which Vue escapes automatically — no
// hand-rolled HTML-escaping helper needed, unlike the vanilla version.
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

function pickFields(table, record) {
	return table.filter(([key]) => record[key]).map(([key, label]) => ({ label, value: record[key] }));
}

const typeLine = computed(() => (inst.department ? `${inst.type} · ${inst.department}` : inst.type));
const locationFields = computed(() => pickFields(LOCATION_FIELDS, inst));
const intakeFields = computed(() => pickFields(INTAKE_FIELDS, inst));

// No institution has confirmed map coordinates (some share a building, some
// may never get a pin), so "directions" is always a Google Maps text
// search rather than an embedded map we'd have to geocode and maintain.
const mapsUrl = computed(() => {
	const query = inst.mapsQuery || inst.address || inst.name;
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
});

const verifiedOn = computed(() =>
	[inst.lastVerified && `آخر تحقق: ${inst.lastVerified}`, inst.nextUpdate && `التحديث القادم: ${inst.nextUpdate}`]
		.filter(Boolean)
		.join(" · "),
);
</script>
