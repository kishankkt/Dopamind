import { createClient } from '@supabase/supabase-js';
try {
  createClient(undefined, undefined);
  console.log("SUCCESS");
} catch(e) {
  console.log("ERROR:", e.message);
}
