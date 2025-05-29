import { Injectable } from '@angular/core';
import supabase from './supabaseClient';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor() {}

  // ✅ REGISTRAR NUEVO USUARIO
  async registrarUsuario(data: any) {
    if (typeof data.telefono !== 'string') {
      data.telefono = String(data.telefono);
    }

    const { data: resultado, error } = await supabase
      .from('usuarios')
      .insert([data])
      .select();

    return { data: resultado, error };
  }

  // ✅ LOGIN MANUAL CON CORREO Y CONTRASEÑA
  async login(correo: string, contrasena: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', correo)
      .eq('contrasena', contrasena)
      .single();

    return { data, error };
  }

  async obtenerUsuarioPorId(id: number | string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.warn('No se encontró el usuario con ID:', id);
      return null;
    }

    return data;
  }


  // ✅ ACTUALIZAR DATOS DEL USUARIO (nombre, correo, etc.)
  async actualizarUsuario(id: string, datos: any) {
    const { data, error } = await supabase
      .from('usuarios')
      .update(datos)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  // ✅ ACTUALIZAR UBICACIÓN ACTUAL DEL USUARIO
  async actualizarUbicacion(id: string, ubicacion: string) {
    const { error } = await supabase
      .from('usuarios')
      .update({ ubicacion_actual: ubicacion })
      .eq('id', id);

    return { error };
  }

  // ✅ ENVIAR CORREO PARA RECUPERACIÓN DE CONTRASEÑA
  async recuperarContrasena(correo: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: 'http://localhost:8100/reset-password' // cambia esto si usas hosting real
    });

    if (error) throw error;
    return data;
  }
}
