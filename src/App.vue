<template>
	<div class="app">
		<header class="app-bar">
			<button v-if="activePath" type="button" class="btn back-btn" @click="goHome">رجوع</button>
			<span class="app-bar-title">{{ activePath ? activePath.title : HOME_TITLE }}</span>
		</header>

		<!-- v-if/v-else (not a v-show toggle) means switching views always
		     creates a brand-new DOM node, and :key does the same across two
		     different results paths. A freshly created node just plays its
		     CSS animation on mount — the vanilla version needed a manual
		     remove-class/force-reflow/add-class dance to get the same replay
		     on a node that already existed. -->
		<main class="app-views">
			<HomeView v-if="!activePath" key="home" @select="goTo" />
			<ResultsView v-else :key="activePath.key" :path="activePath" :institutions="institutions" @home="goHome" />
		</main>
	</div>
</template>

<script setup>
import { computed } from "vue";
import HomeView from "./components/HomeView.vue";
import ResultsView from "./components/ResultsView.vue";
import { findPath } from "./paths.js";
import { useHashRoute } from "./composables/useHashRoute.js";
import { useInstitutions } from "./composables/useInstitutions.js";

const HOME_TITLE = "أكتوبر الوردي · نابلس";

const { pathKey, goTo, goHome } = useHashRoute();
const institutions = useInstitutions();

// An unrecognized hash (typo, stale link) resolves to undefined here, which
// the template above already treats as "show home" — same fallback the
// vanilla version had, just expressed as a computed instead of an if/return.
const activePath = computed(() => (pathKey.value ? findPath(pathKey.value) : undefined));
</script>
