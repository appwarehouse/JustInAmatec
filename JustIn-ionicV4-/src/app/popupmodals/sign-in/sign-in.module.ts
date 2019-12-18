import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms'
import { SignInPage } from './sign-in.page';
import { MatProgressBarModule, MatInputModule, MatButtonModule, MatFormFieldModule, MatToolbarModule, MatDialogModule, MatSnackBarModule, MatIconModule } from '@angular/material';

const routes: Routes = [
  {
    path: '',
    component: SignInPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatProgressBarModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatIconModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SignInPage]
})
export class SignInPageModule {}
