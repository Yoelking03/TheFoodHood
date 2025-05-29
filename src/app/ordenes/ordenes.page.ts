import { Component, OnInit } from '@angular/core';
import { PedidoService } from 'src/app/services/pedido.service';
import { DetallePedidoService } from 'src/app/services/detalle-pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-ordenes',
  templateUrl: './ordenes.page.html',
  styleUrls: ['./ordenes.page.scss'],
  standalone: false
})
export class OrdenesPage implements OnInit {
  pedidos: any[] = [];
  idUsuario: number = 0;
  tipoUsuario: string = '';

  constructor(
    private pedidoService: PedidoService,
    private detallePedidoService: DetallePedidoService,
    private productoService: ProductoService,
    private usuarioService: UsuarioService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.idUsuario = usuario.id;
      this.tipoUsuario = usuario.tipo_usuario?.toLowerCase() || '';
    }

    this.cargarOrdenes();
  }

  async cargarOrdenes() {
    try {
      const { data: pedidosRaw } = await this.pedidoService.obtenerPedidos();
      const { data: detallesData } = await this.detallePedidoService.obtenerDetallesPedidos();
      const { data: productosData } = await this.productoService.obtenerProductos();

      // Validación contra null
      const detalles = detallesData || [];
      const productos = productosData || [];

      const pedidosAsignados = (pedidosRaw || []).filter(p =>
        p.id_delivery === this.idUsuario &&
        p.estado !== 'entregado' &&
        p.estado !== 'recogido'
      );

      this.pedidos = [];

      for (const p of pedidosAsignados) {
        const detalle = detalles.find(d => d.id_pedido === p.id);
        const producto = productos.find(prod => prod.id === detalle?.id_producto);
        const usuario = await this.usuarioService.obtenerUsuarioPorId(p.id_usuario).catch(() => null);

        this.pedidos.push({
          ...p,
          nombre: producto?.nombre || '',
          descripcion: producto?.descripcion || '',
          imagen: producto?.imagen || '',
          precio: producto?.precio || 0,
          cantidad: detalle?.cantidad || 1,
          nombre_usuario: usuario?.nombre || '',
          telefono_usuario: usuario?.telefono || '',
          direccion: p.direccion_entrega || 'No disponible',
        });
      }

    } catch (error) {
      console.error('❌ Error cargando órdenes:', error);
    }
  }


  async cambiarEstadoRepartidor(pedido: any) {
    try {
      await this.detallePedidoService.actualizarEstadoPedido(pedido.id, pedido.estado);

      const toast = await this.toastCtrl.create({
        message: 'Estado actualizado correctamente',
        duration: 2000,
        color: 'success'
      });
      toast.present();

      if (pedido.estado === 'entregado') {
        this.pedidos = this.pedidos.filter(p => p.id !== pedido.id);
      }

    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      const toast = await this.toastCtrl.create({
        message: 'Error al actualizar estado',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }
}
