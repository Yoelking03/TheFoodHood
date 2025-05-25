import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClienteIndexPageRoutingModule } from './cliente-index-routing.module';

import { ClienteIndexPage } from './cliente-index.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClienteIndexPageRoutingModule
  ],
  declarations: [ClienteIndexPage]
})
export class ClienteIndexPageModule {}
