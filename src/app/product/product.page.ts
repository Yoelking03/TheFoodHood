import { Component, OnInit } from '@angular/core';
import { ProductoService } from 'src/app/services/producto.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
  standalone: false,
})
export class ProductPage implements OnInit {
  tipoUsuario: string = '';
  productos: any[] = [];
  productosFiltrados: any[] = [];
  searchTerm: string = '';
  cantidadPedidos: number = 0;
  cantidadAnterior: number = 0;
  badgeAnimar: boolean = false;



  constructor(private router: Router, private productoService: ProductoService,) { }

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.tipoUsuario = usuario.tipo_usuario?.toLowerCase() || '';
    }
    this.cargarProductos();
  
  
  }
  async ionViewDidEnter() {
    await this.cargarProductos();
    
  }
  async cargarProductos() {
    const { data: productosDB } = await this.productoService.obtenerProductos();
    this.productos = (productosDB || []).map(producto => ({
      ...producto,
      imagen: producto.imagen || 'assets/img/default.png'
    }));
    this.productosFiltrados = [...this.productos];
  }

  filtrarProductos() {
    const term = this.searchTerm.toLowerCase();
    this.productosFiltrados = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      p.descripcion.toLowerCase().includes(term)
    );
  }

  modificarProducto(producto: any) {
    this.router.navigate(['/new-product'], {
      state: { producto }
    });
  }

  async eliminarProducto(id: number) {
    const confirmacion = window.confirm('¿Estás seguro de eliminar este producto?');
    if (!confirmacion) return;

    const { error } = await this.productoService.eliminarProducto(id);

    if (!error) {
      this.productos = this.productos.filter(p => p.id !== id);
      this.productosFiltrados = this.productosFiltrados.filter(p => p.id !== id);
      console.log(`✅ Producto con ID ${id} eliminado`);
    } else {
      console.error('❌ Error al eliminar producto:', error);
      alert('No se pudo eliminar el producto. Intenta más tarde.');
    }
  }

}
