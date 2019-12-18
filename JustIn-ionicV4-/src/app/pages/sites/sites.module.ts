import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material';
import { IonicModule } from '@ionic/angular';
import {NgbTimepickerModule} from '@ng-bootstrap/ng-bootstrap';
import { SitesPage } from './sites.page';

const routes: Routes = [
  {
    path: '',
    component: SitesPage
  }
];

@NgModule({
  imports: [
    NgbTimepickerModule,
    CommonModule,
    FormsModule,
    IonicModule,
    MatCardModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SitesPage]
})
export class SitesPageModule {}
