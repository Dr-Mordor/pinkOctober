// The publishable key is meant to ship in client code — it only grants what
// the row-level-security policies allow: anonymous visitors can read
// published institutions and insert analytics events, nothing else. Admin
// writes need a signed-in admin (see the `admins` table).
export const SUPABASE_URL = "https://otyyvuqpluycwwdayvzr.supabase.co";
export const SUPABASE_KEY = "sb_publishable_dXkFh1_MVEe6IiJCPVg4Aw_MkyA-a9r";
