import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexPage } from './index.page';

const routes: Routes = [
  {
    path: '',
    component: IndexPage
  },  {
    path: 'admin-index',
    loadChildren: () => import('./admin-index/admin-index.module').then( m => m.AdminIndexPageModule)
  },
  {
    path: 'cliente-index',
    loadChildren: () => import('./cliente-index/cliente-index.module').then( m => m.ClienteIndexPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IndexPageRoutingModule {}
