import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';
import { ToastController } from '@ionic/angular';
import { FirebaseServiceService } from 'src/app/services/firebase-service.service';
import { MenuLinksService } from 'src/app/services/menu-links.service';

@Component({
  selector: 'app-edit-list',
  templateUrl: './edit-list.page.html',
  styleUrls: ['./edit-list.page.scss'],
})
export class EditListPage implements OnInit {
  obj;
  public typeLists = [];
  public sitesList = [];
  public listItem;
  public loggedPhoto;
  public loggedUsername;
  inputTitleString:string;
  inputDescriptionString:string;
  selectedType:string;
  selectedSite:string;
  defaultType:string;
  defaultSite:string;
  constructor(public menu:MenuLinksService,public Toast:ToastController,public route: ActivatedRoute,public FirebaseService:FirebaseServiceService) { 
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
    this.sitesList = JSON.parse(localStorage.getItem('AllowedSites'));
    this.listItem = this.obj.listItem;
    this.defaultSite = this.listItem.site_summary.display_name;
    this.defaultType = this.listItem.type;
    this.inputDescriptionString = this.listItem.description;
    this.inputTitleString = this.listItem.display_name;
    let typeObj1 = {
      type:"vehicle"
       };
 
       let typeObj2 = {
         type:"driver"
          };
 
          this.typeLists.push(typeObj1);
          this.typeLists.push(typeObj2);
          this.selectedType = this.defaultType;
          this.selectedSite = this.defaultSite;
        }    

  saveEditedList(){
    let siteItem;
    this.sitesList.forEach(element =>{
      if(element.display_name === this.selectedSite){
        let temp = element;
        let display_name = temp.display_name;
        let key= temp.key;
        let siteSummaryObject = {
          "display_name": display_name,
          "uid": key
        }
        siteItem = siteSummaryObject;
      }
    })
    if(!siteItem){
      siteItem = {
        "display_name": "All",
        "uid": "null"
      }
    }
    let listEditObject = {
      display_name: this.inputTitleString,
      description: this.inputDescriptionString,
      site_summary: siteItem,
      status: "Active",
      type: this.selectedType,
      updated_at: firebase.database.ServerValue.TIMESTAMP,
    }
    
    let json = JSON.stringify(listEditObject);
   
    firebase.database().ref('lists').child(this.listItem.key).update(listEditObject).then((promise) =>{
      const toast = this.Toast.create({
        message: 'Success. List: **' + this.listItem.display_name + '** Edited Successfully!',
        duration: 4000,
        color: "success"
      }).then((toaster) =>{
        toaster.present();
      });
    }).catch((error) =>{
      const toast = this.Toast.create({
        message: 'Error. List edit has not been saved',
        duration: 4000,
        color: "danger"
      }).then((toaster) =>{
        toaster.present();
      }); 
    })
    
  }
}
