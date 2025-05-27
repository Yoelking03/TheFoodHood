import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { UsuarioService } from '../services/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
  standalone: false,
})
export class AjustesPage implements OnInit {
    tipoUsuario: string = '';
    mostrarModal = false;
    modoEdicion: boolean = false;
    ubicacionActual: string = '';
    userId: string = '';
    usuario = {
    id: '',
    nombre: '',
    telefono: '',
    direccion: '' };

  constructor(
    private toastCtrl: ToastController, private usuarioService: UsuarioService,   private router: Router) {

   }

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.tipoUsuario = usuario.tipo_usuario?.toLowerCase() || '';
      this.userId = usuario.id;
      this.ubicacionActual = usuario.ubicacion_actual || '';
      this.usuario = {
        id: usuario.id,
        nombre: usuario.nombre || '',
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || ''
      };
    }
  }

  
  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
  obtenerUbicacion() {
    if (!navigator.geolocation) {
      this.mostrarToast('La geolocalización no está disponible.', 'danger');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.ubicacionActual = `${lat}, ${lng}`;

        const { error } = await this.usuarioService.actualizarUbicacion(
          this.userId,
          this.ubicacionActual
        );

        if (error) {
          this.mostrarToast('Error al guardar la ubicación.', 'danger');
        } else {
          this.mostrarToast('Ubicación actualizada correctamente.', 'success');

          const userStr = localStorage.getItem('usuario');
          if (userStr) {
            const user = JSON.parse(userStr);
            user.ubicacion_actual = this.ubicacionActual;
            localStorage.setItem('usuario', JSON.stringify(user));
          }
        }
      },
      error => {
        this.mostrarToast('No se pudo obtener la ubicación.', 'danger');
        console.error(error);
      }
    );
  }
  
  abrirModal() {
  this.mostrarModal = true;
  }
  activarEdicion() {
    this.modoEdicion = true;
  }

  borrarCampo(campo: 'nombre' | 'telefono' | 'direccion') {
    if (!this.usuario[campo]) return;
    this.usuario[campo] = '';
  }




  cerrarModal() {
    this.mostrarModal = false;
  }

  async guardarCambios() {
    const { error } = await this.usuarioService.actualizarUsuario(this.usuario.id, {
      nombre: this.usuario.nombre,
      telefono: this.usuario.telefono,
      direccion: this.usuario.direccion
    });

    if (!error) {
      
      const stored = localStorage.getItem('usuario');
      let prevData = stored ? JSON.parse(stored) : {};


      const updatedUser = {
        ...prevData,
        nombre: this.usuario.nombre,
        telefono: this.usuario.telefono,
        direccion: this.usuario.direccion
      };

      localStorage.setItem('usuario', JSON.stringify(updatedUser));
      this.modoEdicion = false;
      this.mostrarToast('Cambios guardados correctamente.', 'success');
      this.tipoUsuario = (updatedUser.tipo_usuario || '').toLowerCase().trim();
    } else {
      this.mostrarToast('Error al guardar los cambios.', 'danger');
    }
  }
  cerrarSesion() {
  localStorage.clear();

  this.toastCtrl.create({
    message: 'Sesión cerrada.',
    duration: 1500,
    color: 'dark'
  }).then(toast => toast.present());

  this.router.navigate(['/login']);
  }
}
