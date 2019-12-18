import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReportViewerPage } from './report-viewer.page';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

const routes: Routes = [
  {
    path: '',
    component: ReportViewerPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxExtendedPdfViewerModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ReportViewerPage]
})
export class ReportViewerPageModule {}
