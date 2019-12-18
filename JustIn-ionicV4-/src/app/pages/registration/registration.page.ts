import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import * as firebase from 'firebase';
import  {AssignDevicePage} from '../../bottomSheets/assign-device/assign-device.page'
import { MatBottomSheet} from '@angular/material';
import { MenuLinksService } from 'src/app/services/menu-links.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  public announceList = [];
  public loggedPhoto;
  public loggedUsername;
  constructor(public cd: ChangeDetectorRef,public menu: MenuLinksService,public bottomSheet:MatBottomSheet,public loadingController: LoadingController, public modal: ModalController) {
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
      loader.present();
      let ref = firebase.database().ref('announces')
      //read once
      ref.on('child_added', (childSnapshot) => {
         let item = childSnapshot.val();
         item.key = childSnapshot.key;
         if(item.created_at){
          let unixTime = item.created_at;
          let tempTime = new Date(unixTime);
          let time = tempTime.toLocaleString('en-GB');
          item.created_at_time = time;
         }
         this.announceList.push(item);
        })
      // listen for data changes in firebase
  ref.on("child_removed", (snapshot) => {
    let item = snapshot.val();
    item.key = snapshot.key;
 
    this.announceList.forEach((element,pos) =>{
     
      if(item.display_name === element.display_name){
       
        this.announceList.splice(pos,1);
        
        this.cd.detectChanges();
      }
     })
  });
  loader.dismiss();
    })
  }

  assignDevice(Index){
    let item = this.announceList[Index];
    const modal = this.modal.create({
      component: AssignDevicePage,
      componentProps: {
        deviceItem: item
       }
    }).then(view =>{
      view.present();
    });
  }

}
