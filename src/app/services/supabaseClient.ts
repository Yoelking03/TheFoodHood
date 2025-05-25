import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 🔐 Reemplaza con tus credenciales reales de Supabase
const SUPABASE_URL = 'https://yumqxcvxaulatpttaohx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1bXF4Y3Z4YXVsYXRwdHRhb2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTExODAsImV4cCI6MjA2MzY4NzE4MH0.ftSTCxTxvq51Y0-TtEOyUyjTFEoJw3GIvgwrlN92PR8';

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;

//
// ✅ Funciones genéricas reutilizables para tu app
//

// Obtener todos los registros de una tabla
export async function getAll(table: string) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return data;
}

// Insertar datos en una tabla
export async function insert(table: string, values: any) {
  if (table === 'usuarios' && typeof values.telefono === 'string') {
    values.telefono = Number(values.telefono);
  }

  const { data, error } = await supabase.from(table).insert(values).select();
  if (error) throw error;
  return data;
}


// Actualizar un registro por ID (usa campo `id`)
export async function update(table: string, id: number, values: any) {
  const { data, error } = await supabase.from(table).update(values).eq('id', id).select();
  if (error) throw error;
  return data;
}

// Eliminar un registro por ID
export async function remove(table: string, id: number) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
  return true;
}

// Buscar registros por cualquier campo
export async function findByField(table: string, field: string, value: any) {
  const { data, error } = await supabase.from(table).select('*').eq(field, value);
  if (error) throw error;
  return data;
}
