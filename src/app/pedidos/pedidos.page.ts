import { Component, OnInit } from '@angular/core';
import { ProductoService } from 'src/app/services/producto.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { DetallePedidoService } from 'src/app/services/detalle-pedido.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: false,
})
export class PedidosPage implements OnInit {
  tipoUsuario: string = '';
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
    private usuarioService: UsuarioService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.tipoUsuario = usuario.tipo_usuario?.toLowerCase() || '';
      this.idUsuario = usuario.id;
      this.nombreUsuario = usuario.nombre;
      this.actualizarContadorCarrito();
      this.actualizarContadorPedidos();
    }
  }

  async ionViewWillEnter() {
  await this.cargarPedidos();
  this.actualizarContadorPedidos();
  }

  async cargarPedidos() {
    // 🚫 Si es invitado, no debe cargar pedidos
    if (this.tipoUsuario === 'invitado') {
      this.pedidos = [];
      return;
    }

    try {
      const { data: productos } = await this.productoService.obtenerProductos();
      this.productos = productos || [];

      const { data: pedidosRaw } = await this.pedidoService.obtenerPedidos();
      const pedidos = pedidosRaw || [];

      const detallesRes = await this.detallepedidoService.obtenerDetallesPedidos();
      const detalles = detallesRes.data || [];

      // Filtra los pedidos que aún no se han entregado o recogido
      let pedidosFiltrados = pedidos.filter(p => p.estado !== 'entregado' && p.estado !== 'recogido');

      if (this.tipoUsuario === 'cliente') {
        pedidosFiltrados = pedidosFiltrados.filter(p => p.id_usuario === this.idUsuario);
      } else if (this.tipoUsuario === 'repartidor') {
        pedidosFiltrados = pedidosFiltrados.filter(p =>
          (!p.id_delivery && p.estado === 'para entrega')
        );
      } // Administrador ve todos los pedidos activos

      this.pedidos = [];

      for (const p of pedidosFiltrados) {
        const detalle = detalles.find(
          (d, i, arr) => d.id_pedido === p.id && arr.findIndex(x => x.id_pedido === d.id_pedido) === i
        );

        const producto = this.productos.find(prod => prod.id === detalle?.id_producto);
        const usuario = await this.usuarioService.obtenerUsuarioPorId(p.id_usuario);

        this.pedidos.push({
          ...p,
          nombre: producto?.nombre || 'Producto',
          descripcion: producto?.descripcion || 'Sin descripción',
          imagen: producto?.imagen || 'assets/img/default.png',
          precio: producto?.precio || 0,
          cantidad: detalle?.cantidad || 1,
          codigoIngresado: '',
          nombre_usuario: usuario?.nombre || '',
          telefono_usuario: usuario?.telefono || '',
          direccion: p.direccion_entrega || 'No disponible',
        });
      }

      if (this.tipoUsuario === 'cliente') {
        console.log('📦 Pedidos del cliente:', this.pedidos);
      }

    } catch (error) {
      console.error('❌ Error al cargar pedidos:', error);
    }
  }



  async cambiarEstado(pedido: any) {
    // Validar que el administrador no pueda cambiar estado si ya fue aceptado
    if (this.tipoUsuario === 'administrador' && pedido.id_delivery) {
      const toast = await this.toastCtrl.create({
        message: 'No puedes cambiar el estado. Pedido ya fue tomado por un repartidor.',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }

    await this.detallepedidoService.actualizarEstadoPedido(pedido.id, pedido.estado);

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
    if (this.tipoUsuario === 'cliente' && pedido.tipo_entrega === 'delivery' && pedido.estado === 'en camino') {
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
    if (!pedido.id) {
      const toast = await this.toastCtrl.create({
        message: 'Error: ID del pedido no válido.',
        duration: 2000,
        color: 'danger',
      });
      toast.present();
      return;
    }

    const { error } = await this.detallepedidoService.aceptarPedido(pedido.id, this.idUsuario);

    const toast = await this.toastCtrl.create({
      message: error
        ? 'Este pedido ya fue tomado por otro repartidor'
        : 'Pedido aceptado correctamente',
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

    let pedidosValidos = data.filter(p => p.estado !== 'entregado' && p.estado !== 'recogido');

    if (this.tipoUsuario === 'repartidor') {
      pedidosValidos = pedidosValidos.filter(p =>
        (!p.id_delivery && p.estado === 'para entrega') ||
        (p.id_delivery === this.idUsuario && p.estado !== 'entregado')
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
  
  async copiarDireccion(direccion: string) {
    try {
      await navigator.clipboard.writeText(direccion);
      const toast = await this.toastCtrl.create({
        message: 'Dirección copiada al portapapeles',
        duration: 1500,
        color: 'success',
      });
      toast.present();
    } catch (err) {
      const toast = await this.toastCtrl.create({
        message: 'No se pudo copiar la dirección',
        duration: 1500,
        color: 'danger',
      });
      toast.present();
    }
  }

actualizarContadorPedidos() {
  const nuevaCantidad = this.pedidos.length;

  if (nuevaCantidad !== this.cantidadPedidos) {
    this.badgeAnimar = true;
    setTimeout(() => this.badgeAnimar = false, 1000);
  }

  this.cantidadAnterior = this.cantidadPedidos;
  this.cantidadPedidos = nuevaCantidad;
}






}
