import { Injectable } from '@angular/core';
import supabase from './supabaseClient';

@Injectable({ providedIn: 'root' })
export class ProductoService {

  // ✅ Subir imagen al bucket 'imgproductos'
  async subirImagen(nombreArchivo: string, archivo: Blob) {
    return await supabase.storage
      .from('imgproductos')
      .upload(nombreArchivo, archivo, {
        cacheControl: '3600',
        upsert: false // evita sobrescribir imágenes con mismo nombre
      });
  }

  // ✅ Obtener todos los productos
  async obtenerProductos() {
    return await supabase.from('productos').select('*');
  }

  // ✅ Insertar nuevo producto (con o sin imagen)
  async agregarProductoConImagen(producto: any) {
    return await supabase.from('productos').insert([producto]);
  }

  // ✅ Eliminar producto por ID
  async eliminarProducto(id: number) {
    return await supabase.from('productos').delete().eq('id', id);
  }

  // ✅ Editar producto existente
  async editarProductoConImagen(id: number, producto: any) {
    return await supabase.from('productos').update(producto).eq('id', id);
  }
}
