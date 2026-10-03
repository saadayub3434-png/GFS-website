// ============================================================
// GFS Website — Supabase Configuration
// ============================================================

const SUPABASE_URL = "https://ljhgjteprgmtpmmcyolb.supabase.co";

const SUPABASE_KEY = "sb_publishable_r7TYO2cGn4ROC_EhGpU2HQ_7439efg4";

window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
