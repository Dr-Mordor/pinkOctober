<script>
	import { findPath } from "../paths.js";

	let { inst } = $props();

	// Institution entries fill in gradually as each organization signs off
	// on its own data (see README) — most start out with only a name and a
	// list of services. These two tables map a JSON field to its Arabic
	// label; pickFields() below silently skips whatever a given entry
	// doesn't have yet, so a half-filled entry never shows a blank row.
	// Everything renders through {expression} / attribute bindings, which
	// Svelte escapes automatically — no hand-rolled HTML-escaping helper
	// needed, unlike the vanilla version.
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

	let typeLine = $derived(inst.department ? `${inst.type} · ${inst.department}` : inst.type);
	let locationFields = $derived(pickFields(LOCATION_FIELDS, inst));
	let intakeFields = $derived(pickFields(INTAKE_FIELDS, inst));

	// No institution has confirmed map coordinates (some share a building,
	// some may never get a pin), so "directions" is always a Google Maps
	// text search rather than an embedded map we'd have to geocode and
	// maintain.
	let mapsUrl = $derived(
		`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inst.mapsQuery || inst.address || inst.name)}`,
	);

	let verifiedOn = $derived(
		[inst.lastVerified && `آخر تحقق: ${inst.lastVerified}`, inst.nextUpdate && `التحديث القادم: ${inst.nextUpdate}`]
			.filter(Boolean)
			.join(" · "),
	);
</script>

<article class="institution-card" role="listitem">
	{#if inst.isPlaceholder}
		<span class="institution-placeholder-badge">بيانات نموذجية</span>
	{/if}
	<h3>{inst.name}</h3>
	<p class="institution-type">{typeLine}</p>

	{#if inst.services?.length}
		<ul class="institution-services">
			{#each inst.services as service}
				<li>{service}</li>
			{/each}
		</ul>
	{/if}

	{#if locationFields.length}
		<ul class="institution-meta">
			{#each locationFields as field (field.label)}
				<li>{field.label}: {field.value}</li>
			{/each}
		</ul>
	{/if}

	{#if intakeFields.length}
		<dl class="institution-details">
			{#each intakeFields as field (field.label)}
				<dt>{field.label}</dt>
				<dd>{field.value}</dd>
			{/each}
		</dl>
	{/if}

	{#if inst.notes}
		<p class="institution-notes">{inst.notes}</p>
	{/if}

	<!-- Each contact method is a differently-shaped link (tel:, wa.me/,
	     mailto:), so — unlike the field lists above — a lookup table would
	     need as much branching as it saves. Directions has no {#if}: every
	     institution gets a maps link even with nothing but a name. -->
	<div class="institution-actions">
		{#if inst.phone}
			<a class="btn btn-call" href="tel:{inst.phone.replace(/[^\d+]/g, '')}">اتصال</a>
		{/if}
		{#if inst.whatsapp}
			<a
				class="btn btn-whatsapp"
				href="https://wa.me/{inst.whatsapp.replace(/[^\d]/g, '')}"
				target="_blank"
				rel="noopener">واتساب</a
			>
		{/if}
		{#if inst.email}
			<a class="btn btn-email" href="mailto:{inst.email}">بريد إلكتروني</a>
		{/if}
		<a class="btn btn-directions" href={mapsUrl} target="_blank" rel="noopener">الاتجاهات</a>
	</div>

	{#if verifiedOn}
		<p class="institution-verification">{verifiedOn}</p>
	{/if}

	{#if inst.pathTags?.length}
		<div class="institution-tags">
			{#each inst.pathTags as key}
				<span class="institution-tag">{findPath(key)?.title ?? key}</span>
			{/each}
		</div>
	{/if}
</article>
