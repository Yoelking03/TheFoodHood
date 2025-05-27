import { Injectable } from '@angular/core';
import supabase from './supabaseClient';


@Injectable({ providedIn: 'root' })
export class ProductoService {

   async subirImagen(nombreArchivo: string, archivo: Blob) {
    return await supabase.storage
      .from('imgproductos')
      .upload(nombreArchivo, archivo, {
        cacheControl: '3600',
        upsert: false
      });
  }

  async obtenerProductos() {
    return await supabase.from('productos').select('*');
  }

  async agregarProductoConImagen(producto: any) {
    return await supabase.from('productos').insert([producto]);
  }

  async eliminarProducto(id: number) {
    return await supabase.from('productos').delete().eq('id', id);
  }

  async editarProductoConImagen(id: number, producto: any) {
    return await supabase.from('productos').update(producto).eq('id', id);
  }
}