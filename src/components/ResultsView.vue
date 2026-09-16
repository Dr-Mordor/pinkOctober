<template>
	<section class="view view-results view-enter">
		<div class="container">
			<div class="results-heading">
				<h2>{{ path.title }}</h2>
				<p>{{ path.desc }}</p>
			</div>

			<div class="directory-list" role="list">
				<p v-if="matches.length === 0" class="directory-empty">لا تتوفر جهات مرتبطة بهذا المسار حالياً.</p>
				<InstitutionCard v-for="inst in matches" :key="inst.id" :inst="inst" />
			</div>

			<button type="button" class="btn browse-other" @click="$emit('home')">اختيار مسار آخر</button>
		</div>
	</section>
</template>

<script setup>
import { computed } from "vue";
import InstitutionCard from "./InstitutionCard.vue";

const { path, institutions } = defineProps(["path", "institutions"]);
defineEmits(["home"]);

const matches = computed(() => institutions.filter((inst) => inst.pathTags?.includes(path.key)));
</script>
