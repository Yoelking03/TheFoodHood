import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ProductoService } from 'src/app/services/producto.service';


@Component({
  selector: 'app-new-product',
  templateUrl: './new-product.page.html',
  styleUrls: ['./new-product.page.scss'],
  standalone: false,
})
export class NewProductPage implements OnInit {
  tipoUsuario: string = '';
  productoId: number | null = null;
  nombre: string = '';
  descripcion: string = '';
  precio: number | null = null;
  tipoProducto: string = '';
  imagenPreview: string = 'assets/img/hamburger.png';
  
  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private productoService: ProductoService
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { producto?: any };

    if (state?.producto) {
      const p = state.producto;
      this.productoId = p.id;
      this.nombre = p.nombre;
      this.descripcion = p.descripcion;
      this.precio = p.precio;
      this.tipoProducto = p.tipo;
      this.imagenPreview = p.imagen;
    }
  }
  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.tipoUsuario = usuario.tipo_usuario?.toLowerCase() || '';
    }
  }

  volver() {
    this.router.navigate(['/product']);
  }

  cargarImagen(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(archivo);
    }
  }

 async guardar() {
  if (!this.nombre || !this.precio || !this.descripcion || !this.tipoProducto) {
    const toast = await this.toastCtrl.create({
      message: 'Todos los campos son obligatorios',
      duration: 2000,
      color: 'danger',
    });
    await toast.present();
    return;
  }

  let urlImagen = this.imagenPreview;

  try {
    // Solo subir si la imagen es nueva (base64)
    if (this.imagenPreview.startsWith('data:image')) {
      const nombreArchivo = `producto_${Date.now()}.png`;
      const imagenBlob = await (await fetch(this.imagenPreview)).blob();

      console.log('📤 Subiendo imagen:', nombreArchivo);

      const { data: uploadData, error: uploadError } = await this.productoService.subirImagen(nombreArchivo, imagenBlob);
      if (uploadError) throw new Error(`❌ Error al subir imagen: ${uploadError.message}`);

      urlImagen = `https://yumqxcvxaulatpttaohx.supabase.co/storage/v1/object/public/imgproductos/${nombreArchivo}`;
    }

    const producto = {
      nombre: this.nombre,
      descripcion: this.descripcion,
      precio: this.precio,
      tipo: this.tipoProducto,
      imagen: urlImagen
    };

    console.log('📦 Producto a guardar:', producto);

    let resultado;
    if (this.productoId) {
      resultado = await this.productoService.editarProductoConImagen(this.productoId, producto);
    } else {
      resultado = await this.productoService.agregarProductoConImagen(producto);
    }

    if (resultado.error) throw new Error(`❌ Error al guardar producto: ${resultado.error.message}`);

    const toast = await this.toastCtrl.create({
      message: this.productoId ? 'Producto actualizado' : 'Producto guardado correctamente',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
    this.router.navigate(['/product']);
  } catch (err: any) {
    const toast = await this.toastCtrl.create({
      message: `Error inesperado: ${err.message || err}`,
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
    console.error('🧨 Error al guardar producto:', err);
  }
}

}
