import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { PedidoService } from 'src/app/services/pedido.service';
import { DetallePedidoService } from 'src/app/services/detalle-pedido.service';
import { UsuarioService } from '../services/usuario.service';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';



@Component({
  selector: 'app-compras',
  templateUrl: './compras.page.html',
  styleUrls: ['./compras.page.scss'],
  standalone: false,
})
export class ComprasPage implements OnInit {
  carrito: any[] = [];
  total: number = 0;
  contadorCarrito: number = 0;
  tipoUsuario: string = '';
  idUsuario: number = 0;

  constructor(
    private pedidoService: PedidoService,
    private detallePedidoService: DetallePedidoService,
    private alertCtrl: AlertController,
    private toastController: ToastController,
    private usuarioService: UsuarioService,
  ) {}
  

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.tipoUsuario = usuario.tipo_usuario?.toLowerCase() || '';
      this.idUsuario = usuario.id;
    }
    this.cargarCarrito();
  }

  ionViewWillEnter() {
  this.cargarCarrito();
  }

  cargarCarrito() {
    const claveCarrito = `carrito_${this.idUsuario}`;
    const carritoGuardado = localStorage.getItem(claveCarrito);
    this.carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];
    this.carrito.forEach((p: any) => {
      if (!p.cantidad) p.cantidad = 1;
      p.seleccionado = true;
    });
    this.actualizarTotales();
    this.actualizarContador();
  }

  actualizarTotales() {
    this.total = this.carrito
      .filter(p => p.seleccionado)
      .reduce((sum, p) => sum + p.precio * p.cantidad, 0);
  }

  actualizarContador() {
    this.contadorCarrito = this.carrito.reduce((total, item) => total + item.cantidad, 0);
  }

  aumentarCantidad(producto: any) {
    producto.cantidad++;
    this.guardarCarrito();
    this.actualizarTotales();
    this.actualizarContador();
  }

  disminuirCantidad(producto: any) {
    if (producto.cantidad > 1) {
      producto.cantidad--;
      this.guardarCarrito();
      this.actualizarTotales();
      this.actualizarContador();
    }
  }

  eliminarProducto(idProducto: number) {
    if (!idProducto) return;
    const carritoFiltrado = this.carrito.filter(p => p.id_producto !== idProducto);
    if (carritoFiltrado.length < this.carrito.length) {
      this.carrito = carritoFiltrado;
      this.guardarCarrito();
      this.actualizarTotales();
      this.actualizarContador();
    } else {
      console.warn(`No se encontró el producto con id_producto = ${idProducto} para eliminar`);
    }
  }

  guardarCarrito() {
    const claveCarrito = `carrito_${this.idUsuario}`;
    localStorage.setItem(claveCarrito, JSON.stringify(this.carrito));
  }

  haySeleccionados(): boolean {
    return this.carrito.some(p => p.seleccionado);
  }

  async confirmarMetodoEntrega() {
    const alert = await this.alertCtrl.create({
      header: 'Tipo de Entrega',
      message: '¿Deseas delivery o pasar a recoger?',
      buttons: [
        {
          text: 'Recoger',
          handler: () => this.realizarCompra('recoger')
        },
        {
          text: 'Delivery',
          handler: () => this.realizarCompra('delivery')
        }
      ]
    });
    await alert.present();
  }

  async realizarCompra(tipoEntrega: string) {
    if (tipoEntrega === 'delivery') {
      const alert = await this.alertCtrl.create({
        header: 'Ubicación para el delivery',
        message: '¿Deseas que usemos tu ubicación actual para la entrega del pedido?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: async () => {
              const aviso = await this.alertCtrl.create({
                header: 'Dirección registrada',
                message: 'Tu pedido será enviado a la dirección ya registrada.',
                buttons: [{
                  text: 'OK',
                  handler: () => {
                    this.continuarCompra(tipoEntrega);
                  }
                }],
              });
              await aviso.present();
            }
          },
          {
            text: 'Sí',
            handler: async () => {
                            if (Capacitor.getPlatform() === 'web') {
                // Estás en navegador (como Chrome en iOS vía Vercel)
                navigator.geolocation.getCurrentPosition(
                  async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const ubicacion = `${lat},${lon}`;

                    const confirm = await this.alertCtrl.create({
                      header: 'Ubicación detectada',
                      message: 'Se usará tu ubicación actual para el delivery.',
                      buttons: [{
                        text: 'OK',
                        handler: async () => {
                          await this.usuarioService.actualizarUbicacion(this.idUsuario.toString(), ubicacion);
                          this.continuarCompra(tipoEntrega);
                        }
                      }],
                    });
                    await confirm.present();
                  },
                  async (error) => {
                    const toast = await this.toastController.create({
                      message: 'No se pudo obtener tu ubicación en el navegador. Activa permisos en configuración.',
                      duration: 3000,
                      color: 'danger'
                    });
                    await toast.present();
                  }
                );
              } else {
                // App nativa con Capacitor
                try {
                  const perm = await Geolocation.requestPermissions();
                  const position = await Geolocation.getCurrentPosition();
                  const lat = position.coords.latitude;
                  const lon = position.coords.longitude;
                  const ubicacion = `${lat},${lon}`;

                  const confirm = await this.alertCtrl.create({
                    header: 'Ubicación detectada',
                    message: 'Se usará tu ubicación actual para el delivery.',
                    buttons: [{
                      text: 'OK',
                      handler: async () => {
                        await this.usuarioService.actualizarUbicacion(this.idUsuario.toString(), ubicacion);
                        this.continuarCompra(tipoEntrega);
                      }
                    }],
                  });
                  await confirm.present();
                } catch (error) {
                  const toast = await this.toastController.create({
                    message: 'Error al obtener la ubicación. Verifica permisos o activa el GPS.',
                    duration: 3000,
                    color: 'danger'
                  });
                  await toast.present();
                }
              }
                          

            }

          }
        ]
      });

      await alert.present();
    } else {
      this.continuarCompra(tipoEntrega);
    }
  }

  async continuarCompra(tipoEntrega: string) {
    const productosSeleccionados = this.carrito.filter(p => p.seleccionado);
    const totalCompra = productosSeleccionados.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

    try {
      const pedido = await this.pedidoService.crearPedidoGeneral({
        id_usuario: this.idUsuario,
        estado: 'pendiente',
        total: totalCompra,
        tipo_entrega: tipoEntrega
      });

      for (const producto of productosSeleccionados) {
        await this.detallePedidoService.crearDetallePedido({
          id_pedido: pedido.data.id,
          id_producto: producto.id_producto,
          cantidad: producto.cantidad
        });
      }

      this.carrito = this.carrito.filter(p => !p.seleccionado);
      this.guardarCarrito();
      this.actualizarTotales();
      this.actualizarContador();

      const toast = await this.toastController.create({
        message: 'Compra realizada exitosamente',
        duration: 2000,
        color: 'success'
      });
      toast.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Error al realizar la compra',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }
}
