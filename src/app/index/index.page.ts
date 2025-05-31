import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';

@Component({
  selector: 'app-index',
  template: '',
  standalone: false
})
export class IndexPage implements OnInit {
  tipoUsuario: string = "";
   idUsuario: number = 0;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  async ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');

    if (!usuarioStr) {
      this.router.navigate(['/login']);
      return;
    }

    const usuario = JSON.parse(usuarioStr);
    this.tipoUsuario = usuario.tipo_usuario?.toLowerCase() || '';
    this.idUsuario = usuario.id;

    // 👉 Si es invitado, redirige directamente a cliente-index
    if (this.tipoUsuario === 'invitado') {
      this.router.navigate(['/index/cliente-index']);
      return;
    }

    try {
      const data = await this.usuarioService.obtenerUsuarioPorId(usuario.id);
      const tipo = data.tipo_usuario.toLowerCase();

      if (tipo === 'administrador') {
        this.router.navigate(['/index/admin-index']);
      } else if (tipo === 'cliente') {
        this.router.navigate(['/index/cliente-index']);
      } else if (tipo === 'repartidor') {
        this.router.navigate(['/index/repartidor-index']);
      }
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
      this.router.navigate(['/login']);
    }
  }




}

