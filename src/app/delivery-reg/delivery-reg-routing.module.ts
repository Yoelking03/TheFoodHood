import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryRegPage } from './delivery-reg.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryRegPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryRegPageRoutingModule {}
