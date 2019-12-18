import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AddSitePage } from './add-site.page';
import { MatSelectModule, MatOptionModule } from '@angular/material';

const routes: Routes = [
  {
    path: '',
    component: AddSitePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatSelectModule,
    MatOptionModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AddSitePage]
})
export class AddSitePageModule {}
