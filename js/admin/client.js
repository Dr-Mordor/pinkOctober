import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";
import { SUPABASE_URL, SUPABASE_KEY } from "../config.js";

// Only the admin page pulls in supabase-js (for sign-in and session
// handling); the public guide talks to the database with plain fetch().
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
