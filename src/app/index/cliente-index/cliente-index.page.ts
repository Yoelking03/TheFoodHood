import { Component, OnInit } from '@angular/core';
import { ProductoService } from 'src/app/services/producto.service';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { PedidoService } from 'src/app/services/pedido.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-cliente-index',
  templateUrl: './cliente-index.page.html',
  styleUrls: ['./cliente-index.page.scss'],
  standalone: false,
})
export class ClienteIndexPage implements OnInit {
  tipoUsuario: string = '';
  categorias: any[] = [];
  productosFiltrados: any[] = [];
  productos: any[] = [];
  idUsuario: number = 0;
  contadorCarrito: number = 0;
  searchTerm: string = '';
  categoriaSeleccionada: string = 'Todos';
  cantidadPedidos: number = 0;




  constructor(
    private productoService: ProductoService,
    private toastController: ToastController,
    private alertController: AlertController,
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.tipoUsuario = usuario.tipo_usuario?.toLowerCase() || '';
      this.idUsuario = usuario.id;
      this.cargarProductos();
      this.filtrarProductos1();
      this.actualizarContadorPedidos();
    }

    this.categorias = [
      { nombre: 'Hamburger', imagen: 'assets/img/hamburger.png' },
      { nombre: 'Hot Dogs', imagen: 'assets/img/Hotdog.png' },
      { nombre: 'Tacos', imagen: 'assets/img/tacos.png' },
      { nombre: 'Yaroas', imagen: 'assets/img/yaroa.png' },
      { nombre: 'Burritos', imagen: 'assets/img/Burrito.png' },
      { nombre: 'Pizzas', imagen: 'assets/img/Pizza.png' }
    ];
  }

  ionViewWillEnter() {
  this.actualizarContadorCarrito();
  }


  async cargarProductos() {
    const { data: productosDB, error } = await this.productoService.obtenerProductos();

    if (error) {
      console.error('Error al obtener productos:', error);
      return;
    }
    this.productos = productosDB || [];
    this.aplicarFiltros();
  }

  filtrarCategoria(nombre: string) {
    this.categoriaSeleccionada = nombre;
    this.aplicarFiltros();
  }


  filtrarProductos1() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    const categoria = this.categoriaSeleccionada.toLowerCase().replace(/\s+/g, '');
    const termino = this.searchTerm.toLowerCase();

    this.productosFiltrados = this.productos.filter(producto => {
      const tipo = producto.tipo?.toLowerCase().replace(/\s+/g, '');
      const coincideCategoria = categoria === 'todos' || tipo === categoria;
      const coincideBusqueda =
        producto.nombre?.toLowerCase().includes(termino) ||
        producto.descripcion?.toLowerCase().includes(termino);
      return coincideCategoria && coincideBusqueda;
    });

   
  }

  agregarAlCarrito(producto: any) {
    const claveCarrito = `carrito_${this.idUsuario}`;
    const carrito = JSON.parse(localStorage.getItem(claveCarrito) || '[]');

    // Buscar si ya está el producto en el carrito por su id_producto
    const index = carrito.findIndex((item: any) => item.id_producto === producto.id);

    if (index !== -1) {
      // Ya existe → aumentar cantidad
      carrito[index].cantidad += 1;
    } else {
      // Nuevo producto → agregar con campos adecuados
      carrito.push({
        ...producto,
        id_producto: producto.id,
        cantidad: 1,
        seleccionado: true
      });
    }

    // Guardar carrito actualizado
    localStorage.setItem(claveCarrito, JSON.stringify(carrito));

    // Actualizar contador global
    this.actualizarContadorCarrito();

    // Mostrar mensaje
    this.mostrarToast('Producto agregado al carrito');
  }


  actualizarContadorCarrito() {
    const claveCarrito = `carrito_${this.idUsuario}`;
    const carrito = JSON.parse(localStorage.getItem(claveCarrito) || '[]');
    this.contadorCarrito = carrito.reduce((total: number, item: any) => total + item.cantidad, 0);
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 1500,
      color: 'success',
    });
    await toast.present();
  }
  async mostrarAlertaRegistro() {
    const alert = await this.alertController.create({
      header: 'Atención',
      message: 'Para realizar pedidos debes registrarte.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'OK',
          handler: () => {
            this.router.navigate(['/register']); // Ajusta la ruta si es diferente
          }
        }
      ]
    });

    await alert.present();
  }

  async actualizarContadorPedidos() {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return;

    const usuario = JSON.parse(usuarioStr);
    this.idUsuario = usuario.id;

    const { data } = await this.pedidoService.obtenerPedidos();
    if (!data) return;

    const pedidosValidos = data.filter(p => p.estado !== 'entregado' && p.estado !== 'recogido');
    this.cantidadPedidos = pedidosValidos.length;
  }

}
