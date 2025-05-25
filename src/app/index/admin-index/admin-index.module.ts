import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminIndexPageRoutingModule } from './admin-index-routing.module';

import { AdminIndexPage } from './admin-index.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminIndexPageRoutingModule
  ],
  declarations: [AdminIndexPage]
})
export class AdminIndexPageModule {}
