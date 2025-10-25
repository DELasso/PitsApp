import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseClient, supabaseAnonClient } from '../../config/supabase.config';

@Injectable()
export class SupabaseService {
  // Cliente con Service Role (bypass RLS)
  private readonly client: SupabaseClient;
  
  // Cliente con Anon Key (respeta RLS)
  private readonly anonClient: SupabaseClient;

  constructor() {
    this.client = supabaseClient;
    this.anonClient = supabaseAnonClient;
  }

  /**
   * Obtiene el cliente de Supabase con Service Role Key
   * Usa este cliente para operaciones administrativas que necesitan bypass RLS
   */
  getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Obtiene el cliente de Supabase con Anon Key
   * Usa este cliente para operaciones que deben respetar Row Level Security
   */
  getAnonClient(): SupabaseClient {
    return this.anonClient;
  }

  /**
   * Ejecuta una query y retorna los datos o lanza una excepción
   */
  async executeQuery<T>(
    queryBuilder: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
  ): Promise<T> {
    const { data, error } = await queryBuilder(this.client);
    
    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No data returned from Supabase query');
    }
    
    return data;
  }

  /**
   * Ejecuta una query que puede retornar null sin lanzar excepción
   */
  async executeQueryNullable<T>(
    queryBuilder: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
  ): Promise<T | null> {
    const { data, error } = await queryBuilder(this.client);
    
    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }
    
    return data;
  }
}
