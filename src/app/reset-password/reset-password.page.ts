import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import supabase from '../services/supabaseClient';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: false
})
export class ResetPasswordPage implements OnInit {
  correo: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';
  modoCambio: boolean = false;

  constructor(
    private toastCtrl: ToastController,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
   this.route.queryParams.subscribe(params => {
      const desde = params['desde'];
      if (desde === 'olvide') {

        this.modoCambio = false;
      } else {
        
        this.modoCambio = true;
      }
    });
  }

  async enviarRecuperacion() {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(this.correo, {
        redirectTo: 'https://the-food-hood.vercel.app/reset-password' 
      });

      if (error) throw error;

      await this.mostrarToast('Correo enviado. Revisa tu bandeja.', 'success');
    } catch (error: any) {
      await this.mostrarToast(`Error: ${error.message}`, 'danger');
    }
  }

  async cambiarContrasena() {
    if (!this.nuevaContrasena || !this.confirmarContrasena) {
      await this.mostrarToast('Todos los campos son obligatorios', 'danger');
      return;
    }

    if (this.nuevaContrasena.length < 6) {
      await this.mostrarToast('La contraseña debe tener al menos 6 caracteres', 'danger');
      return;
    }

    if (this.nuevaContrasena !== this.confirmarContrasena) {
      await this.mostrarToast('Las contraseñas no coinciden', 'danger');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: this.nuevaContrasena
      });

      if (error) throw error;

      await this.mostrarToast('Contraseña actualizada exitosamente', 'success');
      this.router.navigate(['/login']);

    } catch (error: any) {
      await this.mostrarToast(`Error: ${error.message}`, 'danger');
    }
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color
    });
    await toast.present();
  }
}
