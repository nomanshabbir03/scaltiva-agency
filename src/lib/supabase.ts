import { createClient } from "@supabase/supabase-js";

// Browser client: uses the public publishable key. Row Level Security in the
// database decides what each signed-in user can read or write.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
