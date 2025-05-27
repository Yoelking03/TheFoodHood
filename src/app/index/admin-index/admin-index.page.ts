import { Component, OnInit } from '@angular/core';
import { ProductoService } from 'src/app/services/producto.service';

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
  


  constructor(private productoService: ProductoService,) { }

  async ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.tipoUsuario = usuario.tipo_usuario?.toLowerCase() || '';
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

  
  async filtrarCategoria(nombre: string) {
    const { data: productos } = await this.productoService.obtenerProductos();
    this.productosFiltrados = (productos || []).filter(p =>
      p.tipo?.toLowerCase() === nombre.toLowerCase()
    );
  }

}
