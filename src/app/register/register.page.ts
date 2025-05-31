import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import supabase from '../services/supabaseClient';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {
  nombre: string = '';
  correo: string = '';
  contrasena: string = '';
  telefono: string = '';
  direccion: string = '';
  tipo_usuario: string = 'cliente';

  constructor(
    private usuarioService: UsuarioService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async registrar() {
    if (!this.nombre || !this.correo || !this.contrasena || !this.tipo_usuario) {
      await this.mostrarToast('Todos los campos obligatorios deben ser completados.', 'danger');
      return;
    }

    const tipoUsuarioNormalizado = this.tipo_usuario.trim().toLowerCase();
    if (!['cliente', 'administrador', 'repartidor'].includes(tipoUsuarioNormalizado)) {
      await this.mostrarToast('Tipo de usuario inválido.', 'danger');
      return;
    }

    // 📦 Mostrar datos antes de enviar
    console.log('📤 Datos a registrar:', {
      nombre: this.nombre,
      correo: this.correo,
      contrasena: this.contrasena,
      telefono: this.telefono,
      direccion: this.direccion,
      tipo_usuario: tipoUsuarioNormalizado
    });

    try {
      // 1. Registrar en Supabase Auth (sin metadatos)
      const { data, error } = await supabase.auth.signUp({
        email: this.correo,
        password: this.contrasena
      });

      if (error) {
        await this.mostrarToast(`Error en Supabase: ${error.message}`, 'danger');
        return;
      }

      const userId = data?.user?.id;
      if (!userId) {
        await this.mostrarToast('No se pudo obtener el ID del usuario.', 'danger');
        return;
      }

      // 2. Insertar en tabla usuarios personalizada
      try {
        await this.usuarioService.registrarUsuario({
          id: userId,
          nombre: this.nombre,
          correo: this.correo,
          contrasena: this.contrasena,
          telefono: this.telefono,
          direccion: this.direccion,
          tipo_usuario: tipoUsuarioNormalizado
        });
      } catch (e: any) {
        await this.mostrarToast(`Error al guardar datos extra: ${e.message}`, 'danger');
        return;
      }

      await this.mostrarToast('Registro exitoso. Revisa tu correo.', 'success');
      this.limpiarCampos();
      this.router.navigate(['/login']);

    } catch (error: any) {
      console.error('❌ Error inesperado:', error);
      await this.mostrarToast(`Error: ${error.message || 'No se pudo registrar el usuario.'}`, 'danger');
    }
  }

  private limpiarCampos() {
    this.nombre = '';
    this.correo = '';
    this.contrasena = '';
    this.telefono = '';
    this.direccion = '';
    this.tipo_usuario = '';
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
