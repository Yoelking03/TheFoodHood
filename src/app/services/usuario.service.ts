import { Injectable } from '@angular/core';
import supabase from './supabaseClient';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor() {}

// REGISTRAR USUARIO EN TABLA PERSONALIZADA
async registrarUsuario(data: any) {
  // Asegura que el teléfono se guarde como texto
  if (typeof data.telefono !== 'string') {
    data.telefono = String(data.telefono);
  }

  const { data: resultado, error } = await supabase
    .from('usuarios')
    .insert([data])
    .select();

  return { data: resultado, error }; // ← Retorna ambos
}

  // LOGIN DIRECTO
  async login(correo: string, contrasena: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', correo)
      .eq('contrasena', contrasena)
      .single();

    return { data, error };
  }

  // OBTENER USUARIO POR ID
  async obtenerUsuarioPorId(id: number | string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }


  async actualizarUsuario(id: string, datos: any) {
  const { data, error } = await supabase
    .from('usuarios')
    .update(datos)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
  }


  async recuperarContrasena(correo: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(correo, {
    redirectTo: 'http://localhost:8100/reset-password'
  });

  if (error) throw error;
  return data;
  }
 
  async actualizarUbicacion(id: string, ubicacion: string) {
  const { error } = await supabase
    .from('usuarios')
    .update({ ubicacion_actual: ubicacion })
    .eq('id', id);

    return { error };
  }

}
