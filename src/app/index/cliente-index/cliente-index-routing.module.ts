import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClienteIndexPage } from './cliente-index.page';

const routes: Routes = [
  {
    path: '',
    component: ClienteIndexPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClienteIndexPageRoutingModule {}
