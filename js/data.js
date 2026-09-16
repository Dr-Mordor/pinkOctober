export async function loadInstitutions() {
	const res = await fetch("data/institutions.json");
	if (!res.ok) {
		throw new Error(`failed to load institutions data: ${res.status}`);
	}
	return res.json();
}
