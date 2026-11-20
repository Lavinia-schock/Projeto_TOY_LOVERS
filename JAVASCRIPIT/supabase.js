import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://jmypzzlmizktaxjrbagu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_JwuFe_uRXBhXb9HSEjEcdA_Z6unBb25';

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
