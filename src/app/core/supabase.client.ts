import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://rpblqmqzqmrdyrfgojpd.supabase.co',   // 👈 paste your URL
  'sb_publishable_NE3BZDeOpJxje4FGHphTBg_TVoFeU6n'               // 👈 paste your anon key
);