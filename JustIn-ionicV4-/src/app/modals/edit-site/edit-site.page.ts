import { Component, OnInit, Input } from '@angular/core';
import * as firebase from 'firebase';
import { LoadingController, NavParams, ToastController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-edit-site',
  templateUrl: './edit-site.page.html',
  styleUrls: ['./edit-site.page.scss'],
})
export class EditSitePage implements OnInit {
  nameString:string;
  descString: string;
  contactPersonString:string;
  contactNumberString:string;
  selectedPolices: string;
  public setAllowedPoliciesString = [];
  public siteItem;
  public defaultPolicy;
  public defaultPolicyUID;
  allowedPolicies = [];
  public allPolicies = [];
  public setAllowedPoliciesList;
  customPoliciesOptions : any = {
    header: 'Policies',
    subHeader: 'Select Allowed Policies'
  };
  customDefaultOptions : any = {
    header: 'Default Policy',
    subHeader: 'Select Default Policy'
  };

  constructor(public Modal:ModalController,public loadingController: LoadingController,public Toast:ToastController, public navParams: NavParams) {
    this.siteItem = this.navParams.get('siteItem');
    this.nameString = this.siteItem.display_name;
    this.descString = this.siteItem.description;
    this.contactPersonString = this.siteItem.contact_person.name;
    this.contactNumberString = this.siteItem.contact_person.number;
    this.allowedPolicies = this.navParams.get('allowedPolicies');
    this.setAllowedPoliciesList = this.siteItem.allowed_policies;
    this.defaultPolicy = this.siteItem.default_policy.display_name;
    let policySelectedString = [];
    this.allowedPolicies.forEach(element =>{
      if(policySelectedString){
        policySelectedString.push(element.display_name);
      }
      else{
        policySelectedString.push(element.display_name);    
      }
      this.setAllowedPoliciesString = policySelectedString;
    })
   }

   closeModal(){
     this.Modal.dismiss();
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
    ref.once('value', (Snapshot) => {
        Snapshot.forEach((child)=>{
          let item = child.val();
          item.key = child.key;
   
          this.allPolicies.push(item);
          this.allPolicies.sort(function(a, b){
            var x = a.display_name.toLowerCase();
            var y = b.display_name.toLowerCase();
            if (x < y) {return -1;}
            if (x > y) {return 1;}
            return 0;
          });
        })
        
    })
    loader.dismiss();
  })
  }

  saveSite(){
    let nestedObj;
    this.setAllowedPoliciesString;
    let item = this.setAllowedPoliciesString
    this.allPolicies.forEach(element =>{
      for (let i = 0; i < item.length; i++) { 
        if(item[i] === element.display_name){
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
    this.allPolicies.forEach(element =>{
      if(element.display_name === this.defaultPolicy){
        this.defaultPolicyUID = element.key;
      }
    })
    this.setAllowedPoliciesList = nestedObj;
     let siteUpdateObject = {
      allowed_policies: this.setAllowedPoliciesList,
      created_at:  this.siteItem.created_at,
      display_name: this.nameString,
      description: this.descString,
      contact_person: {
          name: this.contactPersonString,
          number: this.contactNumberString
      },
      default_policy: {
          display_name: this.defaultPolicy,
          uid: this.defaultPolicyUID
      },
      location:this.siteItem.location,
      stats:this.siteItem.stats,
      updated_at: firebase.database.ServerValue.TIMESTAMP
  };
  firebase.database().ref('sites').child(this.siteItem.key).update(siteUpdateObject).then((promise) =>{
    const toast = this.Toast.create({
      message: 'Success. Site: ' +this.nameString+ ' Edited Successfully!',
      duration: 5000,
      color: "success"
    }).then((toaster) =>{
      toaster.present();
    });
  }).catch((error) =>{
    const toast = this.Toast.create({
      message: 'Error. Site changes not been saved',
      duration: 4000,
      color: "danger"
    }).then((toaster) =>{
      toaster.present();
    }); 
  })
  }
}
