import { Injectable } from '@angular/core';
import supabase from './supabaseClient';

@Injectable({
  providedIn: 'root'
})
export class DetallePedidoService {
  constructor() {}

  // Aquí irán funciones como agregarDetalle(), obtenerDetallesPorPedido(), etc.

    async actualizarDetallesPedido(
    id_pedido: number,
    cantidad: number,
    total: number,
    tipo_entrega: string,
    estado: string
  ) {
    return await supabase
      .from('detalles_pedidos')
      .update({ cantidad, total, tipo_entrega, estado })
      .eq('id_pedido', id_pedido);
  }

  async actualizarEstadoPedido(id: number, estado: string) {
    return await supabase.from('pedidos').update({ estado }).eq('id', id);
  }

  async aceptarPedido(id_pedido: number, id_delivery: number) {
    return await supabase.from('pedidos').update({ id_delivery }).eq('id', id_pedido);
  }

  async marcarPedidoComoRetirado(id_pedido: number) {
    return await supabase.from('pedidos').update({ estado: 'retirado' }).eq('id', id_pedido);
  }

  async confirmarEntregaConCodigo(id_pedido: number, codigo: string) {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', id_pedido)
      .eq('codigo', codigo)
      .single();

    if (data) {
      await supabase.from('pedidos').update({ estado: 'entregado' }).eq('id', id_pedido);
    }

    return { data, error };
  }
  
  async crearDetallePedido(data: {
  id_pedido: number,
  id_producto: number,
  cantidad: number
}) {
  return await supabase.from('detalles_pedidos').insert([data]);
}


  async obtenerPedidosRepartidor(usuarioId: number) {
    return await supabase
      .from('pedidos')
      .select('*')
      .eq('id_delivery', usuarioId)
      .not('estado', 'in', '("entregado","retirado")');
  }

  async obtenerOrdenesRepartidor(usuarioId: number) {
    return await supabase
      .from('pedidos')
      .select('*')
      .eq('id_delivery', usuarioId)
      .eq('estado', 'en camino');
  }

  async obtenerPedidosPorUsuarioEstado(id_usuario: number, estado: string) {
    return await supabase
      .from('pedidos')
      .select('*')
      .eq('id_usuario', id_usuario)
      .eq('estado', estado);
  }

  async finalizarCompra(id_usuario: number) {
    return await supabase
      .from('pedidos')
      .update({ estado: 'completado' })
      .eq('id_usuario', id_usuario)
      .neq('estado', 'entregado');
  }
}


