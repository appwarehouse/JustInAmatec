import { Component, OnInit } from '@angular/core';
import { NavParams, ToastController, ModalController } from '@ionic/angular';
import * as firebase from 'firebase';

@Component({
  selector: 'app-add-list',
  templateUrl: './add-list.page.html',
  styleUrls: ['./add-list.page.scss'],
})
export class AddListPage implements OnInit {
  public siteList = [];
  public listTypes = [];
  inputTitleString:string;
  inputDescriptionString:string;
  selectedType:string;
  selectedSite:string;
  constructor(public Modal:ModalController,public Toast:ToastController,public navParams: NavParams) { 
    this.siteList = this.navParams.get('sites');
    let typeObj1 = {
      type:"vehicle"
       };
 
       let typeObj2 = {
         type:"driver"
          };
 
          this.listTypes.push(typeObj1);
          this.listTypes.push(typeObj2);
  }

  ngOnInit() {
  }

  closeModal(){
    this.Modal.dismiss();
  }

  saveList(){
    let siteItem;
    this.siteList.forEach(element =>{
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

    let listAddObject = {
      created_at: firebase.database.ServerValue.TIMESTAMP,
      display_name: this.inputTitleString,
      description: this.inputDescriptionString,
      site_summary: siteItem,
      status: "Active",
      type: this.selectedType,
      updated_at: firebase.database.ServerValue.TIMESTAMP
    }
   
    let json = JSON.stringify(listAddObject);
   
    firebase.database().ref('lists').push(listAddObject).then((promise) =>{
      const toast = this.Toast.create({
        message: 'Success. List: **' + this.inputTitleString + '** Added Successfully!',
        duration: 4000,
        color: "success"
      }).then((toaster) =>{
        toaster.present();
      });
    }).catch((error) =>{
      const toast = this.Toast.create({
        message: 'Error. List has not been saved',
        duration: 4000,
        color: "danger"
      }).then((toaster) =>{
        toaster.present();
      }); 
    })
  }

}
