import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';

@Component({
  selector: 'app-index',
  template: '',
  standalone: false
})
export class IndexPage implements OnInit {

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  async ngOnInit() {
    const userStr = localStorage.getItem('usuario');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.id) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const data = await this.usuarioService.obtenerUsuarioPorId(user.id);
      const tipo = data.tipo_usuario.toLowerCase();

      if (tipo === 'administrador') {
        this.router.navigate(['/index/admin-index']);
      } else if (tipo === 'cliente') {
        this.router.navigate(['/index/cliente-index']);
      } else if (tipo === 'repartidor') {
      this.router.navigate(['/ordenes']);
      } else {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      this.router.navigate(['/login']);
    }
  }

}
