import { Component, OnInit } from '@angular/core';
import { ProductoService } from 'src/app/services/producto.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { DetallePedidoService } from 'src/app/services/detalle-pedido.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: false,
})
export class PedidosPage implements OnInit {
  tipoUsuario: string = "";
  contadorCarrito: number = 0;
  pedidos: any[] = [];
  nombreUsuario: string = '';
  idUsuario: number = 0;
  productos: any[] = [];
  cantidadPedidos: number = 0;
  cantidadAnterior: number = 0;
  badgeAnimar: boolean = false;

  constructor(
    private productoService: ProductoService,
    private pedidoService: PedidoService,
    private detallepedidoService: DetallePedidoService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.tipoUsuario = usuario.tipo_usuario?.toLowerCase() || '';
      this.idUsuario = usuario.id;
      this.nombreUsuario = usuario.nombre;
      this.actualizarContadorCarrito();
      await this.cargarPedidos();
      await this.obtenerCantidadPedidos();
    }
  }

  async ionViewWillEnter() {
    await this.cargarPedidos();
    await this.obtenerCantidadPedidos();
  }

  async cargarPedidos() {
    try {
      const { data: productos } = await this.productoService.obtenerProductos();
      this.productos = productos || [];

      let res;
      if (this.tipoUsuario === 'cliente') {
        res = await this.pedidoService.obtenerPedidosPorUsuario(this.idUsuario);
      } else {
        res = await this.pedidoService.obtenerPedidos();
      }

      const pedidos = res.data || [];

      let pedidosFiltrados = pedidos;

      if (this.tipoUsuario === 'administrador') {
        pedidosFiltrados = pedidos.filter(p =>
          ['pendiente', 'preparando'].includes(p.estado) ||
          (p.estado === 'para entrega' && !p.id_delivery)
        );
      } else if (this.tipoUsuario === 'repartidor') {
        pedidosFiltrados = pedidos.filter(p =>
          p.estado === 'para entrega' && !p.id_delivery
        );
      } else if (this.tipoUsuario === 'cliente') {
        pedidosFiltrados = pedidos.filter(p =>
          p.id_usuario === this.idUsuario &&
          !['carrito', 'completado', 'entregado', 'recogido'].includes(p.estado)
        );
      }

      this.pedidos = pedidosFiltrados.map(p => {
        const producto = this.productos.find(prod => prod.id === p.id_producto);
        return {
          ...p,
          nombre: producto?.nombre || 'Producto',
          descripcion: producto?.descripcion || 'Sin descripción',
          imagen: producto?.imagen || 'assets/img/default.png',
          codigoIngresado: ''
        };
      });

    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  }

  async cambiarEstado(pedido: any) {
    await this.pedidoService.actualizarEstadoPedido(pedido.id_pedido, pedido.estado);
    const toast = await this.toastCtrl.create({
      message: 'Estado actualizado',
      duration: 1500,
      color: 'success',
    });
    toast.present();
    await this.cargarPedidos();
    await this.obtenerCantidadPedidos();
  }

  cambiarEstadoRepartidor(pedido: any) {
    if (pedido.id_delivery === this.idUsuario) {
      this.cambiarEstado(pedido);
    }
  }

  async verificarCodigoEntrega(pedido: any) {
    if (
      this.tipoUsuario === 'cliente' &&
      pedido.tipo_entrega === 'delivery' &&
      pedido.estado === 'en camino'
    ) {
      const { error } = await this.detallepedidoService.confirmarEntregaConCodigo(pedido.id_pedido, pedido.codigoIngresado);
      const toast = await this.toastCtrl.create({
        message: error ? 'Código incorrecto' : 'Entrega confirmada',
        duration: 2000,
        color: error ? 'danger' : 'success',
      });
      toast.present();

      if (!error) {
        await this.cargarPedidos();
        await this.obtenerCantidadPedidos();
      }
    }
  }

  async aceptarPedido(pedido: any) {
    const { error } = await this.detallepedidoService.aceptarPedido(pedido.id_pedido, this.idUsuario);
    const toast = await this.toastCtrl.create({
      message: error ? 'Este pedido ya fue tomado por otro repartidor' : 'Pedido aceptado correctamente',
      duration: 2000,
      color: error ? 'danger' : 'success',
    });
    toast.present();
    await this.cargarPedidos();
    await this.obtenerCantidadPedidos();
  }

  async marcarComoRecogido(pedido: any) {
    await this.detallepedidoService.marcarPedidoComoRetirado(pedido.id_pedido);
    const toast = await this.toastCtrl.create({
      message: 'Pedido marcado como recogido',
      duration: 1500,
      color: 'success',
    });
    toast.present();
    await this.cargarPedidos();
    await this.obtenerCantidadPedidos();
  }

  async obtenerCantidadPedidos() {
    const { data } = await this.pedidoService.obtenerPedidos();
    if (!data) return;

    let pedidosValidos = [];

    if (this.tipoUsuario === 'repartidor') {
      pedidosValidos = data.filter(p =>
        p.estado === 'para entrega' && !p.id_delivery
      );
    } else {
      pedidosValidos = data.filter(p =>
        !['carrito', 'completado', 'entregado', 'recogido'].includes(p.estado)
      );
    }

    const nuevaCantidad = pedidosValidos.length;

    if (nuevaCantidad !== this.cantidadPedidos) {
      this.badgeAnimar = true;
      setTimeout(() => this.badgeAnimar = false, 1000);
    }

    this.cantidadAnterior = this.cantidadPedidos;
    this.cantidadPedidos = nuevaCantidad;
  }

  actualizarContadorCarrito() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      const claveCarrito = `carrito_${usuario.id}`;
      const carrito = JSON.parse(localStorage.getItem(claveCarrito) || '[]');
      this.contadorCarrito = carrito.reduce((total: number, item: any) => total + item.cantidad, 0);
    } else {
      this.contadorCarrito = 0;
    }
  }
}
