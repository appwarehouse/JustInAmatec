import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ChartsModule } from 'ng2-charts';

import { IonicModule } from '@ionic/angular';

import { ReportingPage } from './reporting.page';
import {MatButtonModule, MatDatepickerModule,
   MatCheckboxModule, MatOptionModule, 
   MatSelectModule, MatFormFieldModule, 
   MatTableModule, MatPaginatorModule,
   MatNativeDateModule, MatInputModule, 
   MatExpansionModule,
   MatBottomSheetModule,
   MatToolbarModule, MatToolbar, MatChipsModule, MatTooltipModule, MatProgressBar, MatProgressBarModule, MatIconModule, MatRadioModule} from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

const routes: Routes = [
  {
    path: '',
    component: ReportingPage
  }
];

@NgModule({
  imports: [
    NgbModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    MatButtonModule, 
    MatCheckboxModule, 
    MatOptionModule,
    MatSelectModule, 
    MatFormFieldModule,
    MatTableModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    ChartsModule,
    MatInputModule,
    MatExpansionModule,
    MatBottomSheetModule,
    MatChipsModule,
    MatTooltipModule,
    MatIconModule,
    MatRadioModule,
    MatProgressBarModule
    ],
  declarations: [ReportingPage]
})
export class ReportingPageModule {}
