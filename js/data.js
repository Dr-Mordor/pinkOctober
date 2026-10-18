import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";

// The database stores snake_case columns; the rest of the app (and the
// original institutions.json) uses camelCase. These two functions are the
// only place that knows about both spellings.
const FIELD_MAP = [
	["id", "id"],
	["name", "name"],
	["department", "department"],
	["type", "type"],
	["area", "area"],
	["address", "address"],
	["mapsQuery", "maps_query"],
	["phone", "phone"],
	["whatsapp", "whatsapp"],
	["email", "email"],
	["hours", "hours"],
	["services", "services"],
	["pricing", "pricing"],
	["freeService", "free_service"],
	["insurance", "insurance"],
	["referral", "referral"],
	["booking", "booking"],
	["requirements", "requirements"],
	["lastVerified", "last_verified"],
	["nextUpdate", "next_update"],
	["notes", "notes"],
	["pathTags", "path_tags"],
	["isPlaceholder", "is_placeholder"],
	["isPublished", "is_published"],
	["sortOrder", "sort_order"],
];

export function fromRow(row) {
	return Object.fromEntries(FIELD_MAP.map(([camel, snake]) => [camel, row[snake]]));
}

export function toRow(inst) {
	return Object.fromEntries(FIELD_MAP.map(([camel, snake]) => [snake, inst[camel]]));
}

async function loadFromDatabase() {
	const res = await fetch(
		`${SUPABASE_URL}/rest/v1/institutions?select=*&order=sort_order.asc,name.asc`,
		{ headers: { apikey: SUPABASE_KEY } },
	);
	if (!res.ok) throw new Error(`database responded ${res.status}`);
	return (await res.json()).map(fromRow);
}

async function loadFromJson() {
	const res = await fetch("data/institutions.json");
	if (!res.ok) {
		throw new Error(`failed to load institutions data: ${res.status}`);
	}
	return res.json();
}

// The database is the source of truth. The bundled JSON is only a safety
// net so the public guide still works if the database is unreachable.
export async function loadInstitutions() {
	try {
		return await loadFromDatabase();
	} catch (error) {
		console.warn("falling back to bundled institutions.json:", error);
		return loadFromJson();
	}
}
