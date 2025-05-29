import { Injectable } from '@angular/core';
import supabase from './supabaseClient';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  constructor() {}

  // ✅ Crear pedido general (sin producto individual, solo estado, total y tipo_entrega)
  crearPedidoGeneral(data: {
    id_usuario: number;
    estado: string;
    total: number;
    tipo_entrega: string;
    direccion_entrega: string;
  }) {
    return supabase
      .from('pedidos')
      .insert([data])
      .select()
      .single();
  }

  // ✅ Obtener todos los pedidos (para administrador)
  obtenerPedidos() {
    return supabase.from('pedidos').select('*');
  }

  // ✅ Obtener pedidos por usuario
  obtenerPedidosPorUsuario(id_usuario: number) {
    return supabase
      .from('pedidos')
      .select('*')
      .eq('id_usuario', id_usuario);
  }

  // ✅ Obtener pedidos por usuario y estado
  obtenerPedidosPorUsuarioEstado(id_usuario: number, estado: string) {
    return supabase
      .from('pedidos')
      .select('*')
      .eq('id_usuario', id_usuario)
      .eq('estado', estado);
  }

  // ✅ Obtener un pedido por su ID
  obtenerPedidoPorId(id: number) {
    return supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single();
  }

  // ✅ Actualizar estado de un pedido por ID
  actualizarEstadoPedido(id: number, estado: string) {
    return supabase
      .from('pedidos')
      .update({ estado })
      .eq('id', id);
  }

  // ✅ Eliminar un pedido del carrito por usuario y producto (solo aplica si tienes pedidos no confirmados con productos directos)
  eliminarProductoDelCarrito(id_usuario: number, id_producto: number) {
    return supabase
      .from('pedidos')
      .delete()
      .eq('id_usuario', id_usuario)
      .eq('id_producto', id_producto); // ⚠️ Solo si sigues usando id_producto aquí
  }

  // ⚠️ Eliminar todos los pedidos excepto uno
  eliminarTodosLosPedidos() {
    return supabase
      .from('pedidos')
      .delete()
      .neq('id', 0);
  }

  // ✅ Obtener cantidad total de pedidos para mostrar en badge
  async obtenerCantidadPedidos(id_usuario: number) {
    const { count, error } = await supabase
      .from('pedidos')
      .select('id', { count: 'exact', head: true })
      .eq('id_usuario', id_usuario);

    if (error) {
      console.error('Error al obtener cantidad de pedidos:', error);
      return 0;
    }

    return count || 0;
  }
}
