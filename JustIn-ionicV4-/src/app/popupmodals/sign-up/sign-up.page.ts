import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { MatSnackBar, MatDialog } from '@angular/material';
import {SignInPage} from '../sign-in/sign-in.page'
import { trigger } from '@angular/animations';
import { passwordMatchValidator } from './validator';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
  email;
  password;
  cancel;
  confirmpassword;
  loader = false;
  hide = true;
  type:string = "password";
  registerForm: FormGroup;
  constructor(public dialog:MatDialog,public formBuilder:FormBuilder, public Toast:ToastController,public snackBar: MatSnackBar) { }

  ngOnInit() {
    //initialize the validatio for forms on page
    this.registerForm = this.formBuilder.group({
      'email': [this.email,[
        Validators.required,
        Validators.email
      ]],
      'password': [this.password,[
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(30)
      ]],
      'confirmpassword': ['',[
        Validators.required
      ]],
    }, 
    //custom validator for confirm password
    {validator: passwordMatchValidator})
  }

  onPasswordInput() {
    //on each password input the validation is fired
    console.log('fired')
    if (this.registerForm.hasError('passwordMismatch'))
      this.registerForm.get('confirmpassword').setErrors([{'passwordMismatch': true}]);
    else
      this.registerForm.get('confirmpassword').setErrors(null);
  }

  setVisible(){
    //used to show/hide the password...and to show relevant icon
    if(this.type === "password"){
      this.type = "text";
      this.hide = !this.hide;
    }
    else{
      this.type = "password";
      this.hide = !this.hide;
    }
  }

  //sign up method for email authentication
  emailSignUp(){
    this.loader = true;
    firebase.auth().createUserWithEmailAndPassword(this.email,this.password).then((data) => {
      this.loader = false;
      this.dialog.closeAll();
      const dialogRef = this.dialog.open(SignInPage, {
        width: '400px',
        height: '400px',
        data:{show:"true"}
      });
      }).catch((error) => {
        this.loader = false;
        if(error.code){
          this.snackBar.open("Error. Sign Up Unsuccessful. Error: "+error.message+" .", "Cancel", {
            duration: 8000,
            panelClass: ['danger-snackbar']
          });
        }
        
       console.log(error);
      })
  }

}