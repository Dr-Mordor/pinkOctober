<script>
	import HomeView from "./components/HomeView.svelte";
	import ResultsView from "./components/ResultsView.svelte";
	import { findPath } from "./paths.js";
	import { hashRoute } from "./lib/hashRoute.svelte.js";
	import { institutions } from "./lib/institutions.svelte.js";

	const HOME_TITLE = "أكتوبر الوردي · نابلس";

	// An unrecognized hash (typo, stale link) resolves to undefined here,
	// which the markup below already treats as "show home" — same fallback
	// the vanilla version had, just expressed as a derived value.
	let activePath = $derived(hashRoute.key ? findPath(hashRoute.key) : undefined);
</script>

<div class="app">
	<header class="app-bar">
		{#if activePath}
			<button type="button" class="btn back-btn" onclick={() => hashRoute.goHome()}>رجوع</button>
		{/if}
		<span class="app-bar-title">{activePath ? activePath.title : HOME_TITLE}</span>
	</header>

	<!-- {#if}/{:else} (not a hidden-attribute toggle) means switching views
	     always creates a brand-new DOM node, and the {#key} block does the
	     same across two different results paths. A freshly created node
	     just plays its CSS animation on mount — the vanilla version needed
	     a manual remove-class/force-reflow/add-class dance to get the same
	     replay on a node that already existed. -->
	<main class="app-views">
		{#if !activePath}
			<HomeView onselect={(key) => hashRoute.goTo(key)} />
		{:else}
			{#key activePath.key}
				<ResultsView path={activePath} institutions={institutions.list} onhome={() => hashRoute.goHome()} />
			{/key}
		{/if}
	</main>
</div>
