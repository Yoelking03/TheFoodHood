import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import supabase from '../services/supabaseClient';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  correo: string = '';
  contrasena: string = '';
  mostrarModal = false;

  constructor(
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async iniciarSesion() {
    if (!this.correo || !this.contrasena) {
      this.mostrarToast('Por favor, completa todos los campos.', 'danger');
      return;
    }

    // 1. Iniciar sesión con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: this.correo,
      password: this.contrasena,
    });

    if (error || !data.user) {
      this.mostrarToast('Credenciales incorrectas.', 'danger');
      return;
    }

    const userId = data.user.id;

    // 2. Buscar en la tabla "usuarios" el resto de los datos
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (errorUsuario || !usuario) {
      this.mostrarToast('No se encontró el usuario en la base de datos.', 'danger');
      return;
    }

    // 3. Guardar en localStorage
    localStorage.removeItem('usuario');
    localStorage.setItem('usuario', JSON.stringify(usuario));

    // 4. Redirigir según el tipo de usuario
    const tipo = usuario.tipo_usuario?.toLowerCase();

    if (tipo === 'repartidor') {
      this.router.navigate(['/ordenes']);
    } else if (tipo === 'cliente' || tipo === 'administrador') {
      this.router.navigate(['/index']);
    } else {
      this.mostrarToast('Tipo de usuario desconocido.', 'warning');
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
  abrirModal() {
  this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }
}
