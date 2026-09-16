<template>
	<section class="view view-home view-enter">
		<div class="container">
			<p class="eyebrow">حملة أكتوبر الوردي 2026 · نابلس</p>
			<h1>أين أنتِ الآن في رحلتك؟</h1>
			<p class="lead">اختاري الوصف الأقرب لحالتك لعرض الجهات والخدمات المناسبة لكِ.</p>
			<div class="journey-grid" role="list">
				<JourneyCard v-for="path in PATHS" :key="path.key" :path="path" @select="$emit('select', $event)" />
			</div>
		</div>
	</section>
</template>

<script setup>
import { PATHS } from "../paths.js";
import JourneyCard from "./JourneyCard.vue";

defineEmits(["select"]);
</script>
