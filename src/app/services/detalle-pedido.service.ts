import { Injectable } from '@angular/core';
import supabase from './supabaseClient';

@Injectable({
  providedIn: 'root'
})
export class DetallePedidoService {
  constructor() {}

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
    const { data, error } = await supabase
      .from('pedidos')
      .select('id_delivery')
      .eq('id', id_pedido)
      .single();

    if (error || data?.id_delivery) {
      return { error: true }; // Ya fue aceptado
    }

    const { error: updateError } = await supabase
      .from('pedidos')
      .update({ id_delivery })
      .eq('id', id_pedido);

    return { error: updateError };
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

  // ✅ Versión actual: trae todos los detalles (puede causar duplicados si no se filtra bien)
  async obtenerDetallesPedidos() {
    return await supabase
      .from('detalles_pedidos')
      .select('*');
  }

  // ✅ Versión nueva: agrupa por pedido (si usas múltiples productos por pedido)
  async obtenerDetallesAgrupados() {
    const { data, error } = await supabase
      .from('detalles_pedidos')
      .select('*');

    if (error || !data) return { data: [], error };

    const agrupados = data.reduce((map: any, detalle) => {
      if (!map[detalle.id_pedido]) {
        map[detalle.id_pedido] = [];
      }
      map[detalle.id_pedido].push(detalle);
      return map;
    }, {});

    return { data: agrupados, error: null };
  }

async obtenerPedidosRepartidor(usuarioId: number) {
  return await supabase
    .from('pedidos')
    .select('*')
    .eq('id_delivery', usuarioId)
    .not('estado', 'in', '("entregado", "retirado")');
}


  async finalizarCompra(id_usuario: number) {
    return await supabase
      .from('pedidos')
      .update({ estado: 'completado' })
      .eq('id_usuario', id_usuario)
      .neq('estado', 'entregado');
  }
}
