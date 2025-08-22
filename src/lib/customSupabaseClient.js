import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzuwwfttnigeisicqyto.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dXd3ZnR0bmlnZWlzaWNxeXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODM2MjcsImV4cCI6MjA2ODA1OTYyN30.3_HHqf3NvYWQ3Lle94N8SHgpTSyqrjcavGcNeYsySas';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);