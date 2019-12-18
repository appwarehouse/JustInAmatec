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

  getAllowedSites() {
    return new Promise((resolve, reject) => {
      this.allowedSites = [];
      let ref = firebase
        .database()
        .ref('sites')
      ref.once("value", (Snapshot) => {
        Snapshot.forEach((el) => {
          let item = el.val();
          item.key = el.key;
          if (this.singleSiteKeys.includes(item.key)) {
            this.allowedSites.push(item);
          }
        })
      }).then(() => {
        localStorage.setItem('AllowedSites', JSON.stringify(this.allowedSites));
        return resolve();
      })
    })
  }

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
              ref.once("value", (Snapshot) => {
                Snapshot.forEach((el) => {
                  let item = el.val();
                  item.key = el.key;
                  this.allowedSites.push(item);
                })
              }).then(() => {
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
          localStorage.setItem('isAdmin', this.adminStatus);
          return resolve();
        }
      })
        .then((snap) => {
        }).catch(error => {
        })
    })
  }

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
        localStorage.setItem('AllowedPolicies', JSON.stringify(this.allowedPolicies));
        return resolve();
      }).catch((error) => {
        return reject();
      })
    })
  }

}
