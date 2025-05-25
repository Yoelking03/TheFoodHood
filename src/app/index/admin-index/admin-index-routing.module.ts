import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminIndexPage } from './admin-index.page';

const routes: Routes = [
  {
    path: '',
    component: AdminIndexPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminIndexPageRoutingModule {}
