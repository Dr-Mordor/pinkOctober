<script>
	import InstitutionCard from "./InstitutionCard.svelte";

	let { path, institutions, onhome } = $props();

	let matches = $derived(institutions.filter((inst) => inst.pathTags?.includes(path.key)));
</script>

<section class="view view-results view-enter">
	<div class="container">
		<div class="results-heading">
			<h2>{path.title}</h2>
			<p>{path.desc}</p>
		</div>

		<div class="directory-list" role="list">
			{#if matches.length === 0}
				<p class="directory-empty">لا تتوفر جهات مرتبطة بهذا المسار حالياً.</p>
			{/if}
			{#each matches as inst (inst.id)}
				<InstitutionCard {inst} />
			{/each}
		</div>

		<button type="button" class="btn browse-other" onclick={onhome}>اختيار مسار آخر</button>
	</div>
</section>
