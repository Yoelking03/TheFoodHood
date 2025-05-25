import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryRegPageRoutingModule } from './delivery-reg-routing.module';

import { DeliveryRegPage } from './delivery-reg.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryRegPageRoutingModule
  ],
  declarations: [DeliveryRegPage]
})
export class DeliveryRegPageModule {}
