import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { FirebaseServiceService } from './firebase-service.service';
import { ToastController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class InitialDataSaveService {

  constructor(private storage:NativeStorage, private FirebaseService: FirebaseServiceService, private Toast: ToastController) { }

  saveUserData(result){
    return new Promise((resolve, reject) => {
      console.log(result);
      //set the persistance of user login state. More info can be found on firebase documentation
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
          let name = result.displayName;
          let email = result.email;
          let uid = result.uid;
          //save some data to ionic storage
          this.storage.setItem('Name',name)
          this.storage.setItem('Email',email)
          this.storage.setItem('UID',uid)
          const toast = this.Toast.create({
            message: 'Success. Welcome to JustIn!',
            duration: 4000,
            color: "success",
            position: "top"
          }).then((toaster) =>{
            //check if super admin
            this.FirebaseService.isSuperAdmin(result.uid).then((promise)=>{
              if(this.FirebaseService.adminStatus){
                localStorage.setItem('loggedphotoURL', firebase.auth().currentUser.photoURL);
                localStorage.setItem('loggedDisplayName', firebase.auth().currentUser.displayName);
                return resolve();
              }
              else{
                //check if this is a new user
                this.FirebaseService.isNewUser(result.uid).then((promise)=>{
                  if(this.FirebaseService.newUser){
                    
                  }
                  else{
                    this.FirebaseService.nonAdminSetSites(result.uid).then((promise)=>{
                      this.FirebaseService.getAllowedSites().then(()=>{
                     
                        localStorage.setItem('loggedphotoURL', firebase.auth().currentUser.photoURL);
                        localStorage.setItem('loggedDisplayName', firebase.auth().currentUser.displayName);
                        return resolve();
                      }) 
                    })
                  }
                })
              }
            })
            
          }); 
    })
    
  }

  //get the version code for the application
  saveAppCode(code){
    this.storage.setItem('VCODE',code)
  }
}
