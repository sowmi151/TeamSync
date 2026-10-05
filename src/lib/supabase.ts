import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Capture the OAuth return before the client consumes and clears its URL tokens.
export const isOAuthReturn = new URLSearchParams(window.location.hash.slice(1)).has("access_token");
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
