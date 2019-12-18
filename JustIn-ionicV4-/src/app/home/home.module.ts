import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { HomePage } from './home.page';
import { ReactiveFormsModule } from '@angular/forms'
import { MatProgressBarModule,MatButtonModule,  MatFormFieldModule, 
  MatInputModule, 
  MatToolbarModule,MatSnackBarModule, 
  MatIconModule} from '@angular/material';

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
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSnackBarModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ])
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
