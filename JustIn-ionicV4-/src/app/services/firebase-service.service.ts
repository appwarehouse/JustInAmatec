import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class FirebaseServiceService {
  public adminStatus;
  public allowedSites = [];
  public allowedPolicies = [];
  public newUser = false;
  singleSiteKeys = [];

  constructor() { }

// set a list of sites for a user that isnt and admin
  nonAdminSetSites(uid){
    this.singleSiteKeys = [];
    return new Promise((resolve, reject) => {
      let refAnswer = firebase
            .database()
            .ref('user_roles/sites/' + uid)
          //get site keys for a non super user
          //read once for each child and listen for any child added events in firebase
            refAnswer.once('value', (childSnapshot) => {
              childSnapshot.forEach((child)=>{
        
                let item = child.val();
                if(item === true){
                  //push site keys to a list for use elsewhere
                  this.singleSiteKeys.push(child.key);
                
                }
              })
            }).then((promise)=>{
              //when completed resolve the promise and move on to the next 
              return resolve()
            }).catch(error =>{
             //when an error occurs, reject the promise and catch
          return reject();
        })
  })
  }

  //get allowed sites for non-admin user
  getAllowedSites(){
    return new Promise((resolve, reject) => {
      this.allowedSites = [];
      let ref = firebase
      .database()
      .ref('sites')
      ref.once("value", (Snapshot) => {
        Snapshot.forEach((el)=>{
          let item = el.val();
          item.key = el.key;
          if(this.singleSiteKeys.includes(item.key)){
            this.allowedSites.push(item);
          }
        })
  }).then(()=>{
    localStorage.setItem('AllowedSites', JSON.stringify(this.allowedSites));
    return resolve();
  })
})
  }

  isSuperAdmin(uid){
    return new Promise((resolve, reject) => {
     
      firebase.database().ref('user_roles/super_administrators').once('value', (Snapshot) =>{
        if(Snapshot.hasChild(uid)){
        
          Snapshot.forEach((el)=>{
          
            if(el.key === uid){
              this.adminStatus = el.val();
             
              localStorage.setItem('isAdmin', el.val());
            }
          })
        }
        else{
          this.adminStatus = false;
          localStorage.setItem('isAdmin', this.adminStatus);
         
        }
      })
        .then((snap) => {
              return resolve();   
        }).catch(error =>{
          return reject();
        })
  })
  }

  isNewUser(uid){
    return new Promise((resolve, reject) => {
      if(this.adminStatus === false){
       
        firebase.database().ref('user_roles/sites/').once('value', (Snapshot) =>{
          if(Snapshot.hasChild(uid)){
            this.newUser = false;
          }
          else{
           this.newUser = true;
          }
        }).then((promise)=>{
          return resolve();
        })
      }
    })
    
  }

  getAllowedPolicies(uid){
    return new Promise((resolve, reject) => {
    this.allowedPolicies = [];
    let ref = firebase
    .database()
    .ref('sites/' + uid + '/allowed_policies');
    ref.once('value', (Snapshot) => {
      Snapshot.forEach(child =>{
        let item = child.val();
        item.key = child.key;
        this.allowedPolicies.push(item);
    }) 
    }).then((promise) =>{
      localStorage.removeItem('AllowedPolicies');
      localStorage.setItem('AllowedPolicies', JSON.stringify(this.allowedPolicies));
      return resolve();
    }).catch((error) =>{
      return reject();
    })
  })
  }

}
