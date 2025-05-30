import { Component, OnInit } from '@angular/core';
import { ProductoService } from 'src/app/services/producto.service';
import { PedidoService } from 'src/app/services/pedido.service';


@Component({
  selector: 'app-admin-index',
  templateUrl: './admin-index.page.html',
  styleUrls: ['./admin-index.page.scss'],
  standalone: false,
})
export class AdminIndexPage implements OnInit {
  tipoUsuario: string = '';
  categorias: any[] = [];
  productosFiltrados: any[] = [];
  productos: any[] = [];
  idUsuario: number = 0;
  contadorCarrito: number = 0;
  searchTerm: string = '';
  categoriaSeleccionada: string = 'Todos';
  cantidadPedidos: number = 0;
  


  constructor(private productoService: ProductoService, private pedidoService: PedidoService) { }

  async ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.tipoUsuario = usuario.tipo_usuario?.toLowerCase() || '';
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
