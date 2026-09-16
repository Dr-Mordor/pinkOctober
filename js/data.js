// Kept as its own module so the rest of the app doesn't care where
// institution data comes from — swapping this fetch for a real backend
// later touches one function, not every place that reads `institutions`.
export async function loadInstitutions() {
	const res = await fetch("data/institutions.json");
	if (!res.ok) {
		throw new Error(`failed to load institutions data: ${res.status}`);
	}
	return res.json();
}
