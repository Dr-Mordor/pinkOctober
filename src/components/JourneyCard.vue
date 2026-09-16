<template>
	<button type="button" class="journey-card" role="listitem" @click="$emit('select', path.key)">
		<h3>{{ path.title }}</h3>
		<p>{{ path.desc }}</p>
	</button>
</template>

<script setup>
defineProps(["path"]);
defineEmits(["select"]);
</script>
