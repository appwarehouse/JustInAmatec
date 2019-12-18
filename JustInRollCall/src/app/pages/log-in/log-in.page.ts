import { Component, OnInit } from '@angular/core';
import { FirebaseServiceService } from 'src/app/services/firebase-service.service';
import * as firebase from 'firebase/app';
import { NativeStorage  } from '@ionic-native/native-storage/ngx';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { InitialDataSaveService } from 'src/app/services/initial-data-save.service';

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
    /* firebase.auth().getRedirectResult().then((result) => {
      if(result){
        console.log(result);
        this.loginLogic(result)
      }
    }).catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
    }); */
  }

  /* loginLogic(result){
    console.log("reached")
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        let name = result.user.displayName;
        let email = result.user.email;
        let uid = result.user.uid;
        this.storage.setItem('Name',name)
        this.storage.setItem('Email',email)
        this.storage.setItem('UID',uid)
        const toast = this.Toast.create({
          message: 'Success. Welcome to JustIn!',
          duration: 4000,
          color: "success",
          position: "top"
        }).then((toaster) =>{
          
          this.FirebaseService.isSuperAdmin(result.user.uid).then((promise)=>{
            if(this.FirebaseService.adminStatus){
              localStorage.setItem('loggedphotoURL', firebase.auth().currentUser.photoURL);
              localStorage.setItem('loggedDisplayName', firebase.auth().currentUser.displayName);
              
              this.router.navigate(['home']);
            }
            else{
 
              this.FirebaseService.isNewUser(result.user.uid).then((promise)=>{
                if(this.FirebaseService.newUser){
                  const toast = this.Toast.create({
                    message: 'Welcome to Just In. As you are a new user, please contact Admin to complete registration.',
                    duration: 15000,
                    color: "danger",
                    position: "top"
                  }).then((toast) =>{
                    toast.present();
                  })
                }
                else{
                  this.FirebaseService.nonAdminSetSites(result.user.uid).then((promise)=>{
                    this.FirebaseService.getAllowedSites().then(()=>{
                   
                      localStorage.setItem('loggedphotoURL', firebase.auth().currentUser.photoURL);
                      localStorage.setItem('loggedDisplayName', firebase.auth().currentUser.displayName);
                      this.router.navigate(['home']);
                      toaster.present();
                    }) 
                  })
                }
              })
            }
          })
          
        }); 
  } */

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
