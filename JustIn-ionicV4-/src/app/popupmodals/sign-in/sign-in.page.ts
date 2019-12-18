import { Component, OnInit, Inject } from '@angular/core';
import * as firebase from 'firebase';
import {FormGroup, FormBuilder, Validators} from '@angular/forms'
import { ToastController } from '@ionic/angular';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Storage } from '@ionic/storage';
import { MenuLinksService } from 'src/app/services/menu-links.service';
import { FirebaseServiceService } from 'src/app/services/firebase-service.service';
import { Router } from '@angular/router';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {
  email;
  password;
  cancel;
  hide = true;
  type:string = "password";
  loader = false;
  signInForm: FormGroup;
  constructor(@Inject(MAT_DIALOG_DATA) public fromSignUp: any, public dialog:MatDialog,public router:Router,public MenuList: MenuLinksService,public FirebaseService:FirebaseServiceService,public storage:Storage, public formBuilder:FormBuilder,public Toast:ToastController, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.signInForm = this.formBuilder.group({
      'email': [this.email,[
        Validators.required,
        Validators.email
      ]],
      'password': [this.password,[
        Validators.required,
      ]],
    })
    if(this.fromSignUp){
      this.snackBar.open("Sign Up Successful! Please log into your Just In Account.", "Cancel", {
        duration: 12000,
        panelClass: ['primary-snackbar']
      });
    }
  }

  setVisible(){
    if(this.type === "password"){
      this.type = "text";
      this.hide = !this.hide;
    }
    else{
      this.type = "password";
      this.hide = !this.hide;
    }
  }

  emailSignIn(){
    
    this.loader = true;
    firebase.auth().signInWithEmailAndPassword(this.email,this.password).then(data => {
     console.log(data);
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
      let name = data.user.displayName;
      let email = data.user.email;
      let uid = data.user.uid;
      this.storage.set('Name',name)
      this.storage.set('Email',email)
      this.storage.set('UID',uid)
      this.FirebaseService.isSuperAdmin(data.user.uid).then((promise)=>{
        if(this.FirebaseService.adminStatus){
          if(firebase.auth().currentUser.photoURL && firebase.auth().currentUser.displayName){
            localStorage.setItem('loggedphotoURL', firebase.auth().currentUser.photoURL);
            localStorage.setItem('loggedDisplayName', firebase.auth().currentUser.displayName);
          }
          else{
            let initial = data.user.email.charAt(0);
            let URL = "https://ui-avatars.com/api/?rounded=true&name="+initial;
            localStorage.setItem('loggedphotoURL', URL);
            localStorage.setItem('loggedDisplayName', data.user.email);
          }
          this.MenuList.setAdminMenulist();
          this.loader = false;
          this.snackBar.open("Sign In Successful. Welcome to Just IN!", "Cancel", {
            duration: 5000,
            panelClass: ['primary-snackbar']
          });
          this.dialog.closeAll();
          this.router.navigate(['sites']);
        }
        else{
          this.FirebaseService.isNewUser(data.user.uid).then((promise)=>{
            if(this.FirebaseService.newUser){
              this.snackBar.open("Welcome to Just In. As you are a new user, please contact Admin to complete registration.", "Cancel", {
                duration: 15000,
                panelClass: ['danger-snackbar']
              });
              this.loader = false;
            }
            else{
              this.FirebaseService.nonAdminSetSites(data.user.uid).then((promise)=>{
                this.FirebaseService.getAllowedSites().then(()=>{
               
                  localStorage.setItem('loggedphotoURL', firebase.auth().currentUser.photoURL);
                  localStorage.setItem('loggedDisplayName', firebase.auth().currentUser.displayName);
                  this.MenuList.setNormalMenuList();
                  this.loader = false;
                  this.snackBar.open("Sign In Successful. Welcome to Just IN!", "Cancel", {
                    duration: 5000,
                    panelClass: ['primary-snackbar']
                  });
                  this.dialog.closeAll();
                  this.router.navigate(['reporting']);
                  
                }) 
              })
            }
          })
        }
      })
    }).catch((error) => {
      let messege;
      console.log(error)
      if(error.code === "auth/user-not-found"){
        messege = "User Not Found"
        
      }
      if(error.code === "auth/wrong-password"){
        messege = "Incorrect Password"
        
      }
      this.loader = false;
      this.snackBar.open("Error. Sign In Failed! "+messege+" .", "Cancel", {
        duration: 8000,
        panelClass: ['danger-snackbar']
      });
    })
  }
  
  

}
