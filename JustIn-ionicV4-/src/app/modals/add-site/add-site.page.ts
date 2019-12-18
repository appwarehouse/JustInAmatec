import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { LoadingController, ToastController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-site',
  templateUrl: './add-site.page.html',
  styleUrls: ['./add-site.page.scss'],
})
export class AddSitePage implements OnInit {
  nameString:string;
  descString: string;
  contactPersonString:string;
  contactNumberString:string;
  selectedPolices: string;
  setAllowedPoliciesString = [];
  public defaultPolicy;
  public defaultPolicyUID;
  public allPolicies = [];
  public setAllowedPoliciesList;
  constructor(public Modal:ModalController,public loadingController: LoadingController,public Toast:ToastController) { 

  }

  ngOnInit() {
    const loading = this.loadingController.create({
      translucent: true,
      spinner: "dots",
    }).then(loader =>{
      loader.present();
      let ref = firebase
    .database()
    .ref('policies');
    ref.on('child_added', (Snapshot) => {
        let item = Snapshot.val();
        item.key = Snapshot.key;
      
        this.allPolicies.push(item);
    })/* .then((promise)=>{
      console.log(this.allPolicies)
      loader.dismiss();
    }).catch((error) =>{
      loader.dismiss();
    }) */
    loader.dismiss();
    })
  }

  closeModal(){
    this.Modal.dismiss();
  }

  saveSite(){
    let nestedObj;
    let selectedDefaultPolicyObject;
    this.allPolicies.forEach(element =>{
        if(this.defaultPolicy === element.display_name){
          let key = element.key;
          let objItemDisplayName = element.display_name;
           selectedDefaultPolicyObject = {
            "display_name": objItemDisplayName,
            "uid": key
          }
        }
    })
    this.allPolicies.forEach(element =>{
      for (let i = 0; i < this.setAllowedPoliciesString.length; i++) { 
        if(this.setAllowedPoliciesString[i] === element.display_name){
          let key = element.key;
          let objItemDisplayName = element.display_name;
          let allowedPoliciesObject = {
            "display_name": objItemDisplayName,
            "uid": key
          }
          let policyObj = {
          [key]: allowedPoliciesObject
          };
          if(i === 0){
            nestedObj = Object.assign({}, policyObj);
          }
          else{
            Object.assign(nestedObj,policyObj);
          }
        }
      }
    })
    let contactPersonObj = {
      "name": this.contactPersonString,
      "number": this.contactNumberString
    }
    let statsObj = {
      "device_count": 0
    }
    let locationObj = {
      "latitude": 0,
      "longitude": 0,
      "time": firebase.database.ServerValue.TIMESTAMP
    }
    this.setAllowedPoliciesList = nestedObj;
    let newSiteObject = {
      allowed_policies: this.setAllowedPoliciesList,
      contact_person: contactPersonObj,
      created_at: firebase.database.ServerValue.TIMESTAMP,
      default_policy: selectedDefaultPolicyObject,
      description: this.descString,
      display_name: this.nameString,
      location: {
        "latitude": 0,
        "longitude": 0,
        "time": firebase.database.ServerValue.TIMESTAMP
      },
      stats: {
        "device_count": 0
      },
      updated_at: firebase.database.ServerValue.TIMESTAMP
    }
    let json = JSON.stringify(newSiteObject);
    firebase.database().ref('sites').push(newSiteObject).then((promise) =>{
      const toast = this.Toast.create({
        message: 'Success. Site: ' +this.nameString+ ' Added Successfully!',
        duration: 4000,
        color: "success"
      }).then((toaster) =>{
        toaster.present();
      });
    }).catch((error) =>{
      const toast = this.Toast.create({
        message: 'Error. Site has not been saved',
        duration: 4000,
        color: "danger"
      }).then((toaster) =>{
        toaster.present();
      }); 
    })
  }

}
