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


  nonAdminSetSites(uid) {
    this.singleSiteKeys = [];
    return new Promise((resolve, reject) => {
      let refAnswer = firebase
        .database()
        .ref('user_roles/sites/' + uid)
      //get site keys for a non super user
      //read once for each child and listen for any child added events in firebase
      refAnswer.once('value', (childSnapshot) => {
        childSnapshot.forEach((child) => {

          let item = child.val();
          if (item === true) {
            this.singleSiteKeys.push(child.key);

          }
        })
      }).then((promise) => {
        return resolve()
      }).catch(error => {
        return reject();
      })
    })
  }


  //gets the actual site object from the sites nodes for the non admin user
  getAllowedSites() {
    return new Promise((resolve, reject) => {
      this.allowedSites = [];
      let ref = firebase
        .database()
        .ref('sites')
        //read once from sites node
      ref.once("value", (Snapshot) => {
        Snapshot.forEach((el) => {
          let item = el.val();
          item.key = el.key;
          if (this.singleSiteKeys.includes(item.key)) {
            this.allowedSites.push(item);
          }
        })
      }).then(() => {
        //set allowed sites in localstorage for use later, in stringified format
        localStorage.setItem('AllowedSites', JSON.stringify(this.allowedSites));
        return resolve();
      })
    })
  }

  //checks if a user is a super admin or not from the user roles node
  isSuperAdmin(uid) {
    return new Promise((resolve, reject) => {

      firebase.database().ref('user_roles/super_administrators').once('value', (Snapshot) => {
        if (Snapshot.hasChild(uid)) {

          Snapshot.forEach((el) => {

            if (el.key === uid) {
              this.adminStatus = el.val();
              this.allowedSites = [];
              let ref = firebase
                .database()
                .ref('sites')
                        //read once from sites node
              ref.once("value", (Snapshot) => {
                Snapshot.forEach((el) => {
                  let item = el.val();
                  item.key = el.key;
                  this.allowedSites.push(item);
                })
              }).then(() => {
                //set admin boolean and the allowed sites in localstorage for later use
                localStorage.setItem('isAdmin', el.val());
                localStorage.setItem('AllowedSites', JSON.stringify(this.allowedSites));
                return resolve();
              }).catch(()=>{
                return reject();
              })

            }
          })
        }
        else {
          this.adminStatus = false;
          //set admin boolean
          localStorage.setItem('isAdmin', this.adminStatus);
          return resolve();
        }
      })
        .then((snap) => {
        }).catch(error => {
        })
    })
  }


  //checks if this user is a new user on login
  isNewUser(uid) {
    return new Promise((resolve, reject) => {
      if (this.adminStatus === false) {

        firebase.database().ref('user_roles/sites/').once('value', (Snapshot) => {
          if (Snapshot.hasChild(uid)) {
            this.newUser = false;
          }
          else {
            this.newUser = true;
          }
        }).then((promise) => {
          return resolve();
        })
      }
    })

  }

  //get the allowed policies for each site
  getAllowedPolicies(uid) {
    return new Promise((resolve, reject) => {
      let ref = firebase
        .database()
        .ref('sites/' + uid + '/allowed_policies');
      ref.once('value', (Snapshot) => {
        Snapshot.forEach(child => {
          let item = child.val();
          item.key = child.key;
          this.allowedPolicies.push(item);
        })
      }).then((promise) => {
        //set allowed policies
        localStorage.setItem('AllowedPolicies', JSON.stringify(this.allowedPolicies));
        return resolve();
      }).catch((error) => {
        return reject();
      })
    })
  }

}
