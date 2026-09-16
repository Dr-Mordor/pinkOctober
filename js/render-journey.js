export function renderJourney(container, paths, onSelect) {
	container.innerHTML = "";

	for (const path of paths) {
		const card = document.createElement("button");
		card.type = "button";
		card.className = "journey-card";
		card.setAttribute("role", "listitem");

		card.innerHTML = `
			<h3>${path.title}</h3>
			<p>${path.desc}</p>
		`;

		card.addEventListener("click", () => onSelect(path.key));
		container.appendChild(card);
	}
}
