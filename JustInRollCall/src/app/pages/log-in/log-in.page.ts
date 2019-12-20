import { Component, OnInit } from '@angular/core';
import { FirebaseServiceService } from 'src/app/services/firebase-service.service';
import * as firebase from 'firebase/app';
import { NativeStorage  } from '@ionic-native/native-storage/ngx';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { InitialDataSaveService } from 'src/app/services/initial-data-save.service';
import { ɵINTERNAL_BROWSER_PLATFORM_PROVIDERS } from '@angular/platform-browser';
import { isNgTemplate } from '@angular/compiler';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.page.html',
  styleUrls: ['./log-in.page.scss'],
})
export class LogInPage implements OnInit {
  email;
  password;
  vcode;
  constructor(public loadingController: LoadingController,public Toast: ToastController, public router: Router, public FirebaseService:FirebaseServiceService, public storage: NativeStorage, public dataSave: InitialDataSaveService) { }

  ngOnInit() {
    this.storage.getItem('VCODE').then((data)=>{
      this.vcode = data
    })
  }

  //log in with auth provider
  /* when using signinwithredirect in cordova based applications, ul web hooks must be used to allow
  the application to leave itself, open a webpage to sign into google, and then subsequently return to the application.
  Unfortunately this hook does not return to the point where signinwithredirect is called so the landingpage guard
  was used to check if the user has been logged in successfully when the application restarts after coming from the ul hook */
  logIn(){
    let provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
   });
    firebase.auth().signInWithRedirect(provider).then(()=>{
      return firebase.auth().getRedirectResult().then((data)=>{
        console.log(data);
      });
    }).then((result)=>{
      }).catch((error) => {
        const toast = this.Toast.create({
          message: 'Error Occured. Login Failed',
          duration: 4000,
          color: "danger",
          position: "top"
        }).then((toaster) =>{
          toaster.present();
        });
    }).catch((err)=>{
      console.log(err)
    })
    
  }

  //sign in with email works as documented by firebase
  emaillogIn(){
    if(!this.email){
      const toast = this.Toast.create({
        message: 'Please enter an email address',
        duration: 1500,
        position: "bottom"
      }).then((toaster) =>{
        toaster.present();
      });
      return;
    }
    if(!this.password){
      const toast = this.Toast.create({
        message: 'Please enter password',
        duration: 1500,
        position: "bottom"
      }).then((toaster) =>{
        toaster.present();
      });
      return;
    }
    const loading = this.loadingController.create({
    });
    loading.then((loader)=>{
      loader.present();
      firebase.auth().signInWithEmailAndPassword(this.email,this.password).then(data => {
        //calls the initial data save service to save the user data and fire off the firebase service
        this.dataSave.saveUserData(data);
        loader.dismiss();
       console.log(data);
      }).catch((error) => {
        let messege;
        console.log(error)
        if(error.code === "auth/user-not-found"){
          loader.dismiss();
          const toast = this.Toast.create({
            message: 'User Not Found',
            duration: 2500,
            color: "danger",
            position: "bottom"
          }).then((toaster) =>{
            toaster.present();
          });
          
        }
        if(error.code === "auth/wrong-password"){
          loader.dismiss();
          const toast = this.Toast.create({
            message: 'Incorrect Password',
            duration: 2500,
            color: "danger",
            position: "bottom"
          }).then((toaster) =>{
            toaster.present();
          });
        }
        //if too many requests are invalid this toast appears. Depending on requirements, Re-Captcha can be implemented to overcome this issue immedietaly.
        if(error.code === "auth/too-many-requests"){
          loader.dismiss();
          const toast = this.Toast.create({
            message: 'Too many unsuccessful attempts. Please try again later',
            duration: 4000,
            color: "danger",
            position: "bottom"
          }).then((toaster) =>{
            toaster.present();
          });
        }
      })
    })
  }

}
