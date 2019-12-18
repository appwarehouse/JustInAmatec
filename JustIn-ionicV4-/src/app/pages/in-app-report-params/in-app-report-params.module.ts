import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InAppReportParamsPage } from './in-app-report-params.page';

const routes: Routes = [
  {
    path: '',
    component: InAppReportParamsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [InAppReportParamsPage]
})
export class InAppReportParamsPageModule {}
