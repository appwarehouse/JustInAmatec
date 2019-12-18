import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReportingSchedulesPage } from './reporting-schedules.page';

import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MatDialog, MatDialogModule } from '@angular/material';



const routes: Routes = [
  {
    path: '',
    component: ReportingSchedulesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatDialogModule,
    NgxExtendedPdfViewerModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ReportingSchedulesPage]
})
export class ReportingSchedulesPageModule {}
