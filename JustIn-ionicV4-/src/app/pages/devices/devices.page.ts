import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FilterListService } from 'src/app/services/filter-list.service';
import * as firebase from 'firebase';
import { FirebaseServiceService } from 'src/app/services/firebase-service.service';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { EditDevicePage } from '../../ForwardPages/edit-device/edit-device.page';
import { Storage } from '@ionic/storage';
import { SplitterService } from 'src/app/services/splitter.service';
import { MenuLinksService } from 'src/app/services/menu-links.service';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss'],
})
export class DevicesPage implements OnInit {
  public devices = [];
 public constList = [];
 public tempSiteList = [];
 public tempDevList = [];
 public sites = [];
 public siteSearchTerm: string;
 public deviceSearchTerm: string;
 public displayItem;
 public loggedPhoto;
  public loggedUsername;
 public name;
 public uid ;
  constructor(public Toast:ToastController,public menu: MenuLinksService,public splitter: SplitterService,public filter:FilterListService, public loadingController: LoadingController, public cd: ChangeDetectorRef, public FirebaseService:FirebaseServiceService, public Storage:Storage, public ionNavCtrl:NavController) { 
    this.Storage.get('UID').then((val) => {
      this.uid = val;
    });
    this.Storage.get('Name').then((val) => {
      this.name = val;
    })
    this.displayItem = false;

    let answer = localStorage.getItem('isAdmin')
    if(answer === 'true'){
      this.menu.setAdminMenulist();
    }
    else{
      this.menu.setNormalMenuList();
    } 
  }

  ngOnInit() {
    this.loggedPhoto = localStorage.getItem('loggedphotoURL');
    this.loggedUsername = localStorage.getItem('loggedDisplayName');
    const loading = this.loadingController.create({
      translucent: true,
      spinner: "dots",
    }).then(loader =>{
    this.Storage.get('UID').then((val) => {
      loader.present();
      JSON.parse(localStorage.getItem('AllowedSites')).forEach(element =>{
        let ref = firebase
                .database()
                .ref('/devices')
                .orderByChild('/site_summary/uid')
                .equalTo(element.key);
                //read once
    ref.on('child_added', (Snapshot) => {
        //convert to array
        let item = Snapshot.val();
        item.key = Snapshot.key;
        // convert firebase timestamps to datetime
        if(item.last_seen){
          let unixTime = item.last_seen;
          let tempTime = new Date(unixTime);
          let time = tempTime.toLocaleString('en-GB');
          item.last_seen_time = time;
        }
        else{
          item.last_seen_time = "Has not logged in."
        }
        if(item.created_at){
        let unixTime = item.created_at;
        let tempTime = new Date(unixTime);
        let time = tempTime.toLocaleString('en-GB');
        item.created_at_time = time
        }
        else{
          item.created_at_time = "No Creation Date Available"
        }
        if(item.updated_at){
        let unixTime = item.updated_at;
        let tempTime = new Date(unixTime);
        let time = tempTime.toLocaleString('en-GB');
        item.updated_at_time = time
        }
        else{
          item.updated_at_time = "No Update Date Available"
        }
        this.devices.push(item)
      
      })
      // listen for data changes in firebase
      ref.on("child_changed", (snapshot) => {
        //declare a list of positions to delete duplicates, since in this instance both 'child_added' and 'child_changed' will fire
        let delList = [];
        let item = snapshot.val();
        item.key = snapshot.key;
        if(item.last_seen){
          let unixTime = item.last_seen;
          let tempTime = new Date(unixTime);
          let time = tempTime.toLocaleString('en-GB');
          item.last_seen_time = time;
        }
        else{
          item.last_seen_time = "Has not logged in."
        }
        if(item.created_at){
        let unixTime = item.created_at;
        let tempTime = new Date(unixTime);
        let time = tempTime.toLocaleString('en-GB');
        item.created_at_time = time
        }
        else{
          item.created_at_time = "No Creation Date Available"
        }
        if(item.updated_at){
        let unixTime = item.updated_at;
        let tempTime = new Date(unixTime);
        let time = tempTime.toLocaleString('en-GB');
        item.updated_at_time = time
        }
        else{
          item.updated_at_time = "No Update Date Available"
        }
        this.devices.forEach((element,pos) =>{
          if(element.key === item.key){
            this.devices[pos] = item;
          }
        })

        //loop thorugh the external device list after both events have taken place, collect duplicate positions, leave one position in the list, and delete the rest.
        for(let i = 1; i<=this.devices.length;i++){
          if(this.devices[i] === this.devices[i-1]){
            delList.push(i);
          }
        }
        delList.forEach(element =>{
          this.devices.splice(element, 1);
      })
      });
      })
      this.constList = this.devices;
      loader.dismiss();

  })
})
}

splitView(){
  this.splitter.setSplit();
}

deviceDetail(index){
  let itemAllowedPolicyList = [];
  let sites = [];
  let selected_site;
  let selected_policy;
  let itemdevice;
  const loading = this.loadingController.create({
    translucent: true,
    spinner: "dots",
  }).then(loader =>{
    loader.present();
      itemdevice = this.devices[index];
      selected_policy = itemdevice.policy_summary.display_name;
      selected_site = itemdevice.site_summary.display_name;
      sites = JSON.parse(localStorage.getItem('AllowedSites'));
      let passedObj = 
        {
          item:itemdevice,
          site:selected_site,
          policy:selected_policy
        }
        let passedObject = JSON.stringify(passedObj)
     
      loader.dismiss();
      loader.onDidDismiss().then(dismissed =>{
        this.ionNavCtrl.navigateForward(['edit-device', passedObject/* , JSON.stringify(passedObject) */]);
    })
  })
    
  }

  setFilteredDevicesByName(){
    this.tempDevList = this.filter.filternameDevices(this.constList,this.deviceSearchTerm);
    this.devices = this.tempDevList;
  }

  setFilteredDevicesBySite(){
    this.tempSiteList = this.filter.filtersiteDevices(this.constList,this.siteSearchTerm);
    this.devices = this.tempSiteList;
  }

}
