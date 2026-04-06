import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY?.trim();
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim() || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'SUPABASE_URL and SUPABASE_SERVICE_KEY must be defined in .env file',
  );
}

try {
  new URL(supabaseUrl);
} catch {
  throw new Error('SUPABASE_URL is not a valid URL');
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
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
