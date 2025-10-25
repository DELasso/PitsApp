import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'SUPABASE_URL and SUPABASE_SERVICE_KEY must be defined in .env file',
  );
}

// Cliente de Supabase con Service Role Key (para operaciones del backend)
export const supabaseClient: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// Cliente con Anon Key (para operaciones que respetan RLS)
export const supabaseAnonClient: SupabaseClient = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
