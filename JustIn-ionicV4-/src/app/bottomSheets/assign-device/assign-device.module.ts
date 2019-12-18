import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AssignDevicePage } from './assign-device.page';
import { MatProgressBarModule } from '@angular/material';

const routes: Routes = [
  {
    path: '',
    component: AssignDevicePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatProgressBarModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AssignDevicePage]
})
export class AssignDevicePageModule {}
