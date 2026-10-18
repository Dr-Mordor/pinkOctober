// Tiny DOM helpers. Admin-entered text goes through textContent / value,
// never innerHTML, so a stray "<" in a hospital name can't break the page.
export function el(tag, props = {}, ...children) {
	const node = document.createElement(tag);
	for (const [key, value] of Object.entries(props)) {
		if (key === "class") node.className = value;
		else if (key === "dataset") Object.assign(node.dataset, value);
		else if (key in node) node[key] = value;
		else node.setAttribute(key, value);
	}
	node.append(...children.flat().filter((c) => c != null && c !== false));
	return node;
}

export function showError(node, message) {
	node.textContent = message ?? "";
	node.hidden = !message;
}
