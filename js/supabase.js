// ============================================================
// GFS Website — Supabase Configuration
// ============================================================

// Replace these two values with your own Supabase details.

const SUPABASE_URL = "https://ljhgjteprgmtpmmcyolb.supabase.co";

const SUPABASE_KEY = "sb_publishable_r7TYO2cGn4ROC_EhGpU2HQ_7439efg4";

// Create the Supabase client
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
