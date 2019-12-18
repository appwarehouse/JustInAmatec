import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { FirebaseServiceService } from 'src/app/services/firebase-service.service';
import { DataBusService } from 'src/app/services/data-bus.service';
import { MenuLinksService } from 'src/app/services/menu-links.service';

@Component({
  selector: 'app-edit-policy',
  templateUrl: './edit-policy.page.html',
  styleUrls: ['./edit-policy.page.scss'],
})
export class EditPolicyPage implements OnInit {
  obj;
  public policyItem;
  public loggedPhoto;
  public loggedUsername;
  inputName: string;
  inputDescription:string;
  inputJsonString:string;
  constructor(public menu: MenuLinksService,public DataBus:DataBusService,public Toast:ToastController,public route: ActivatedRoute,public FirebaseService:FirebaseServiceService) { 
    if(localStorage.getItem('isAdmin')){
      this.menu.setAdminMenulist();
    }
    else{
      this.menu.setNormalMenuList();
    }
  }

  ngOnInit() {
    this.loggedPhoto = localStorage.getItem('loggedphotoURL');
    this.loggedUsername = localStorage.getItem('loggedDisplayName');
    this.policyItem = this.DataBus.getPolicyItem();
    this.inputDescription = this.policyItem.description;
    this.inputName = this.policyItem.display_name;
    this.inputJsonString = JSON.stringify(this.policyItem.state_policy, null, "\t");
  }

  editPolicy(){
 
   
    var statePolicyObj = JSON.parse(this.inputJsonString);
   
    let editPolicyObject = {
      description: this.inputDescription,
      display_name: this.inputName,
      state_policy: statePolicyObj,
      updated_at: firebase.database.ServerValue.TIMESTAMP,
    }
    firebase.database().ref('policies').child(this.policyItem.key).update(editPolicyObject).then((promise) =>{
      const toast = this.Toast.create({
        message: 'Success. Policy: **' + this.policyItem.display_name + '** Edited Successfully!',
        duration: 4000,
        color: "success"
      }).then((toaster) =>{
        toaster.present();
      });
    }).catch((error) =>{
      const toast = this.Toast.create({
        message: 'Error. Policy edit has not been saved',
        duration: 4000,
        color: "danger"
      }).then((toaster) =>{
        toaster.present();
      }); 
    })
    }

}
