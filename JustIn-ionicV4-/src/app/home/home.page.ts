import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ToastController, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { FirebaseServiceService } from '../services/firebase-service.service';
import { MenuLinksService } from '../services/menu-links.service';
import { DataBusService } from '../services/data-bus.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {SignInPage} from '../popupmodals/sign-in/sign-in.page'
import {SignUpPage} from '../popupmodals/sign-up/sign-up.page'
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
declare var particlesJS: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
   particlesJS: any;
   loader;
   email;
   password;
   hide = true;
   type:string = "password";
   signInForm: FormGroup;
  constructor(public formBuilder:FormBuilder, public snackBar: MatSnackBar,public dialog:MatDialog,public Databus: DataBusService,public MenuList: MenuLinksService,public FirebaseService:FirebaseServiceService,public menu: MenuController,public router:Router, public Toast:ToastController, public storage:Storage) {
    
  }

  ngOnInit(){
    //initialize particleJS and the validation for email login form
    particlesJS.load('particles-js', 'assets/particle/particle.json', function() {
     
    });
    this.signInForm = this.formBuilder.group({
      'email': [this.email,[
        Validators.required,
        Validators.email
      ]],
      'password': [this.password,[
        Validators.required,
      ]],
    })
  }

  //view/hide password control
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

  forgotPassword(){
    firebase.auth().sendPasswordResetEmail('tawiemadavo@hotmail.com').then((data) =>{
      console.log(data);
      console.log("success");
    }).catch((error) =>{
      console.log(error);
      if(error.message === 'There is no user record corresponding to this identifier. The user may have been deleted.'){
        this.snackBar.open("Error. Cannot send password reset email. User does not exist.", "Cancel", {
          duration: 8000,
          panelClass: ['danger-snackbar']
        });
      }
      
    });
  }

  //login with email method
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
        //check if user is regular user or super admin and assign username and photoURL to local storage accordingly
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
          //set nav list
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
          //if user is signed up but UID has not been placed in database for data access
          this.FirebaseService.isNewUser(data.user.uid).then((promise)=>{
            if(this.FirebaseService.newUser){
              this.snackBar.open("Welcome to Just In. As you are a new user, please contact Admin to complete registration.", "Cancel", {
                duration: 15000,
                panelClass: ['danger-snackbar']
              });
              this.loader = false;
            }
            else{
              //ordinary user only gets to see the reporting page
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

  signInDialog(){
    const dialogRef = this.dialog.open(SignInPage, {
      width: '400px',
      height: '400px'
    });
  }

  //brings up sign up dialog screen
    signUpDialog(){
      const dialogRef = this.dialog.open(SignUpPage, {
        width: '400px',
      height: '500px'
      });
    }

  ionViewWillEnter() {
    this.menu.enable(false);
    this.menu.swipeEnable(false);
}
  ionViewDidLeave() {
    this.menu.enable(true);
    this.menu.swipeEnable(true);
}

 //login with google method
  googleLoginClick(){
    this.loader = true;
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then((result) => {
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
      let name = result.user.displayName;
      let email = result.user.email;
      let uid = result.user.uid;
      //save some data to ionic storage
      this.storage.set('Name',name)
      this.storage.set('Email',email)
      this.storage.set('UID',uid)
      const toast = this.Toast.create({
        message: 'Success. Welcome to JustIn!',
        duration: 4000,
        color: "success",
        position: "top"
      }).then((toaster) =>{
        //check if super admin
        this.FirebaseService.isSuperAdmin(result.user.uid).then((promise)=>{
          if(this.FirebaseService.adminStatus){
            localStorage.setItem('loggedphotoURL', firebase.auth().currentUser.photoURL);
            localStorage.setItem('loggedDisplayName', firebase.auth().currentUser.displayName);
            this.MenuList.setAdminMenulist();
            toaster.present();
            this.loader = false;
            this.router.navigate(['sites']);
          }
          else{
             //if user is signed up but UID has not been placed in database for data access
            this.FirebaseService.isNewUser(result.user.uid).then((promise)=>{
              if(this.FirebaseService.newUser){
                const toasty = this.Toast.create({
                  message: 'Welcome to Just In. As you are a new user, please contact Admin to complete registration.',
                  duration: 15000,
                  color: "danger",
                  position: "top"
                }).then((toast) =>{
                  this.loader = false;
                  toast.present();
                })
              }
              else{
                //ordinary user only gets to see the reporting page
                this.FirebaseService.nonAdminSetSites(result.user.uid).then((promise)=>{
                  this.FirebaseService.getAllowedSites().then(()=>{
                 
                    localStorage.setItem('loggedphotoURL', firebase.auth().currentUser.photoURL);
                    localStorage.setItem('loggedDisplayName', firebase.auth().currentUser.displayName);
                    this.MenuList.setNormalMenuList();
                    this.loader = false;
                    this.router.navigate(['reporting']);
                    toaster.present();
                  }) 
                })
              }
            })
          }
        })
        
      }); 
    }).catch((error) => {
      
      const toast = this.Toast.create({
        message: 'Error Occured. Login Failed',
        duration: 4000,
        color: "danger",
        position: "top"
      }).then((toaster) =>{
        this.loader = false;
        toaster.present();
      });
    })
  }

}
