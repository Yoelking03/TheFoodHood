import { Component, OnInit } from '@angular/core';
import { ProductoService } from 'src/app/services/producto.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { ToastController } from '@ionic/angular';

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

  constructor(
    private productoService: ProductoService,
    private pedidoService: PedidoService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.tipoUsuario = usuario.tipo_usuario?.toLowerCase() || '';
      this.idUsuario = usuario.id;
      this.cargarProductos();
      
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

  cargarProductos() {
    this.productoService.obtenerProductos().then(({ data }) => {
      this.productos = data || [];
      this.filtrarProductos();
    });
  }



  filtrarCategoria(nombre: string) {
    this.categoriaSeleccionada = nombre;
    this.filtrarProductos();
  }

  filtrarProductos() {
    this.productosFiltrados = this.productos.filter(producto => {
      const coincideCategoria =
        this.categoriaSeleccionada === 'Todos' || producto.tipoProducto === this.categoriaSeleccionada;
      const coincideBusqueda = producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());
      return coincideCategoria && coincideBusqueda;
    });
  }

  onSearchTermChange() {
    this.filtrarProductos();
  }

  agregarAlCarrito(producto: any) {
    // Tu lógica de agregar al carrito
  }
}
