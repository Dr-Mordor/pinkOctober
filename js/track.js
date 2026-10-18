import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";

// Anonymous usage counts only: a random per-tab id, which screen/path was
// opened, and which contact button was pressed. No names, no IPs stored by
// us, no medical details — the guide has no forms that collect any.
function sessionId() {
	try {
		let id = sessionStorage.getItem("po_sid");
		if (!id) {
			id = crypto.randomUUID();
			sessionStorage.setItem("po_sid", id);
		}
		return id;
	} catch {
		return (fallbackId ??= Math.random().toString(36).slice(2).padEnd(12, "0"));
	}
}
let fallbackId;

// Fire-and-forget: analytics must never slow down or break the guide.
export function track(eventType, { pathKey, institutionId, action } = {}) {
	fetch(`${SUPABASE_URL}/rest/v1/events`, {
		method: "POST",
		keepalive: true,
		headers: {
			apikey: SUPABASE_KEY,
			"Content-Type": "application/json",
			Prefer: "return=minimal",
		},
		body: JSON.stringify({
			session_id: sessionId(),
			event_type: eventType,
			path_key: pathKey ?? null,
			institution_id: institutionId ?? null,
			action: action ?? null,
		}),
	}).catch(() => {});
}
