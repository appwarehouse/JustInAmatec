import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';
import { ToastController } from '@ionic/angular';
import { FirebaseServiceService } from 'src/app/services/firebase-service.service';
import { MenuLinksService } from 'src/app/services/menu-links.service';

@Component({
  selector: 'app-edit-device',
  templateUrl: './edit-device.page.html',
  styleUrls: ['./edit-device.page.scss'],
})
export class EditDevicePage implements OnInit {
  obj;
  public allowedPolicies = [];
  public sitesList = [];
  displayNameString: string;
  isActive;
  public selectedItem;
  public defaultSite;
  public defaultPolicy;
  public prevDeviceCount;
  public nextDeviceCount;
  public loggedPhoto;
  public loggedUsername;
  selectedSite: string;
  selectedPolicy: any;
  public mapsRef;
  constructor(public menu:MenuLinksService,public FirebaseService:FirebaseServiceService,public Toast:ToastController,public route: ActivatedRoute) {
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
    this.obj = JSON.parse(this.route.snapshot.paramMap.get('passedObject'));
    this.selectedItem = this.obj.item;
    console.log(this.obj);
    if(this.selectedItem.status === "OK"){
      this.isActive = false;
    }
    else{
      this.isActive = true;
    }
    this.FirebaseService.getAllowedPolicies(this.selectedItem.site_summary.uid).then((promise) =>{
      this.sitesList = JSON.parse(localStorage.getItem('AllowedSites'));
      this.allowedPolicies = JSON.parse(localStorage.getItem('AllowedPolicies'));
      console.log(this.allowedPolicies)
      this.defaultSite = this.obj.site;
      this.defaultPolicy = this.obj.policy;
      this.selectedSite = this.defaultSite;
      this.sitesList.forEach(element =>{
        if(element.display_name === this.selectedSite){
          this.prevDeviceCount = element.stats.device_count;
        }
      })
      this.selectedPolicy = this.defaultPolicy;
      this.displayNameString = this.selectedItem.display_name;
       this.mapsRef = "http://www.google.com/maps/place/"+this.selectedItem.last_location.latitude+","+ this.selectedItem.last_location.latitude +"/"
      /* this.mapsRef = "http://www.google.com/maps/place/49.46800006494457,17.11514008755796/"; */
    }) 
  }

  changeAllowedSites(event){
    this.allowedPolicies = [];
    let key;
    this.sitesList.forEach((element, pos) =>{
      if(element.display_name === this.selectedSite){
        key = element.key
      }

      if(pos === this.sitesList.length - 1){
        this.FirebaseService.getAllowedPolicies(key).then((promise) =>{
          this.allowedPolicies = JSON.parse(localStorage.getItem('AllowedPolicies'));
        })
      }
    })
    
  }

  saveChanges(){
    let siteItem;
    let policyItem;
    this.sitesList.forEach(element =>{
      if(element.display_name === this.selectedSite){
        let temp = element;
        let display_name = temp.display_name;
        let key= temp.key;
        this.nextDeviceCount = element.stats.device_count;
        let siteSummaryObject = {
          "display_name": display_name,
          "uid": key
        }
        siteItem = siteSummaryObject;
      }
    })
    this.allowedPolicies.forEach(element =>{
      if(element.display_name === this.selectedPolicy){
        let temp = element;
        let display_name = temp.display_name;
        let key= temp.key;
        let policySummaryObject = {
          "display_name": display_name,
          "uid": key
        }
        policyItem = policySummaryObject;
      }
      })
      let statusObj;
      if(this.isActive){
        statusObj = "Disabled"
      }
      else{
        statusObj = "OK"
      }
    let deviceUpdateObject = {
                            display_name: this.displayNameString,
                            site_summary: siteItem,
                            policy_summary: policyItem,
                            status: statusObj,
                            updated_at: firebase.database.ServerValue.TIMESTAMP,
  };

  let siteUpdateObjectAdd = {
    stats: {
      device_count: this.nextDeviceCount + 1
    }
  }

  let siteUpdateObjectNegate = {
    stats: {
      device_count: this.prevDeviceCount - 1
    }
  }
  firebase.database().ref('devices').child(this.selectedItem.key).update(deviceUpdateObject).then((promise) =>{
    firebase.database().ref('sites').child(deviceUpdateObject.site_summary.uid).update(siteUpdateObjectAdd).then((promise)=>{
      firebase.database().ref('sites').child(this.selectedItem.site_summary.uid).update(siteUpdateObjectNegate).then((promise)=>{
        const toast = this.Toast.create({
          message: 'Success. Device: **' + this.selectedItem.display_name + '** Edited Successfully!',
          duration: 4000,
          color: "success"
        }).then((toaster) =>{
          toaster.present();
        });
      }).catch((error) =>{
        const toast = this.Toast.create({
          message: 'Error. Previous Site Device Count Not Updated.',
          duration: 4000,
          color: "danger"
        }).then((toaster) =>{
          toaster.present();
        }); 
    }).catch((error) =>{
      const toast = this.Toast.create({
        message: 'Error. New Site Device Count Not Updated.',
        duration: 4000,
        color: "danger"
      }).then((toaster) =>{
        toaster.present();
      }); 
  }).catch((error) =>{
    const toast = this.Toast.create({
      message: 'Error. Device edit has not been saved.',
      duration: 4000,
      color: "danger"
    }).then((toaster) =>{
      toaster.present();
    }); 
  })
    })
  })
}
}

