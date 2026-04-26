import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ijfdhrmgoxlpvyojddob.supabase.co';
const supabaseKey = 'sb_publishable_ztezC0J_calBk54NJCmgjA_Mv7oLedY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('logs').select('*');
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
