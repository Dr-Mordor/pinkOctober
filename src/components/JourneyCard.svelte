<script>
	let { path, onselect } = $props();
</script>

<!-- Svelte's compiler (unlike a plain <script>) flags an interactive
     element carrying a non-interactive ARIA role, which is what the
     vanilla version actually does (role="listitem" directly on the
     <button>). Wrapping it here is the correct fix either way: the list
     semantics belong on a plain container, not on the button itself. -->
<div class="journey-card-item" role="listitem">
	<button type="button" class="journey-card" onclick={() => onselect(path.key)}>
		<h3>{path.title}</h3>
		<p>{path.desc}</p>
	</button>
</div>
