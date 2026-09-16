<script>
	import { PATHS } from "../paths.js";
	import JourneyCard from "./JourneyCard.svelte";

	let { onselect } = $props();
</script>

<section class="view view-home view-enter">
	<div class="container">
		<p class="eyebrow">حملة أكتوبر الوردي 2026 · نابلس</p>
		<h1>أين أنتِ الآن في رحلتك؟</h1>
		<p class="lead">اختاري الوصف الأقرب لحالتك لعرض الجهات والخدمات المناسبة لكِ.</p>
		<div class="journey-grid" role="list">
			{#each PATHS as path (path.key)}
				<JourneyCard {path} {onselect} />
			{/each}
		</div>
	</div>
</section>
