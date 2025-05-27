import { Injectable } from '@angular/core';
import supabase from './supabaseClient';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  constructor() {}

  // ✅ Crear nuevo pedido
  crearPedido(data: {
    id_usuario: number;
    id_producto: number;
    cantidad: number;
    total?: number;
    estado: string;
  }) {
    return supabase
      .from('pedidos')
      .insert([data])
      .select()
      .single(); // Devuelve un objeto único con su ID
  }

  // ✅ Obtener todos los pedidos (admin)
  obtenerPedidos() {
    return supabase.from('pedidos').select('*');
  }

  // ✅ Actualizar estado por ID
  actualizarEstadoPedido(id: number, estado: string) {
    return supabase.from('pedidos').update({ estado }).eq('id', id);
  }

  // ✅ Obtener pedidos por usuario
  obtenerPedidosPorUsuario(id_usuario: number) {
    return supabase.from('pedidos').select('*').eq('id_usuario', id_usuario);
  }

  // ✅ Obtener pedidos por usuario y estado
  obtenerPedidosPorUsuarioEstado(id_usuario: number, estado: string) {
    return supabase
      .from('pedidos')
      .select('*')
      .eq('id_usuario', id_usuario)
      .eq('estado', estado);
  }

  // ✅ Obtener un pedido por ID
  obtenerPedidoPorId(id: number) {
    return supabase.from('pedidos').select('*').eq('id', id).single();
  }

  // ✅ Actualizar pedido desde carrito (por usuario + producto)
  actualizarPedido(data: {
    id_usuario: number;
    id_producto: number;
    cantidad: number;
    total?: number;
    estado: string;
  }) {
    return supabase
      .from('pedidos')
      .update({
        cantidad: data.cantidad,
        total: data.total,
        estado: data.estado
      })
      .eq('id_usuario', data.id_usuario)
      .eq('id_producto', data.id_producto);
  }

  // ✅ Eliminar producto del carrito
  eliminarProductoDelCarrito(id_usuario: number, id_producto: number) {
    return supabase
      .from('pedidos')
      .delete()
      .eq('id_usuario', id_usuario)
      .eq('id_producto', id_producto);
  }

  // ⚠️ Borrar todos los pedidos (excepto ID 0)
  eliminarTodosLosPedidos() {
    return supabase.from('pedidos').delete().neq('id', 0);
  }
  // ✅ Obtener cantidad de productos en el carrito del usuario
obtenerCantidadPedidos(id_usuario: number) {
  return supabase
    .from('pedidos')
    .select('id', { count: 'exact', head: true })
    .eq('id_usuario', id_usuario)
    .then(res => res.count); // retorna solo el número
}

}
