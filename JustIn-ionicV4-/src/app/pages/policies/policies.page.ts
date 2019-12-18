import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SplitterService } from 'src/app/services/splitter.service';
import { NavController, ToastController, LoadingController, ModalController } from '@ionic/angular';
import { FirebaseServiceService } from 'src/app/services/firebase-service.service';
import { FilterListService } from 'src/app/services/filter-list.service';
import { AddPolicyPage } from '../../modals/add-policy/add-policy.page';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase';
import { DataBusService } from 'src/app/services/data-bus.service';
import { MenuLinksService } from 'src/app/services/menu-links.service';

@Component({
  selector: 'app-policies',
  templateUrl: './policies.page.html',
  styleUrls: ['./policies.page.scss'],
})
export class PoliciesPage implements OnInit {
  public policiesList = [];
  public constList = [];
  public tempPolicyList = [];
  public searchTerm;
  public loggedPhoto;
  public loggedUsername;
  public displayItem = false;
  public policyItem;
  constructor(public menu:MenuLinksService,public DataBus:DataBusService,public cd:ChangeDetectorRef,public Toast:ToastController,public ionNavCtrl:NavController,public splitter: SplitterService,public loadingController: LoadingController,public modal: ModalController,public FirebaseService:FirebaseServiceService, public filter:FilterListService,public storage:Storage) {
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
      let ref = firebase
    .database()
    .ref('policies')
    .orderByChild('status')
    .equalTo('Active');
    ref.on('child_added', (Snapshot) => {
        let item = Snapshot.val();
        item.key = Snapshot.key;
    // convert firebase timestamps to datetime
    if(item.updated_at){
      let unixTime = item.updated_at;
      let tempTime = new Date(unixTime);
      let time = tempTime.toLocaleString('en-GB');
      item.updated_at_time = time
      
    }
    else{
      item.updated_at_time = "Not Modified"
    }
    this.policiesList.push(item);
    this.policiesList.sort(function(a, b){
      var x = a.display_name.toLowerCase();
      var y = b.display_name.toLowerCase();
      if (x < y) {return -1;}
      if (x > y) {return 1;}
      return 0;
    });
    })
    ref.on("child_removed", (snapshot) => {
      let item = snapshot.val();
      item.key = snapshot.key;
      this.policiesList.forEach((element,pos) =>{
        if(item.key === element.key){
          this.policiesList.splice(pos,1);
        }
       })
    });
    // listen for data changes in firebase
    ref.on("child_changed", (snapshot) => {
    let item = snapshot.val();
    item.key = snapshot.key;
    if(item.updated_at){
      let unixTime = item.updated_at;
      let tempTime = new Date(unixTime);
      let time = tempTime.toLocaleString('en-GB');
      item.updated_at_time = time
      
    }
    else{
      item.updated_at_time = "Not Modified"
    }
    this.policiesList.forEach((element,pos) =>{
        if(item.key === element.key){
          this.policiesList[pos] = item;
        }
       })

});
  this.constList = this.policiesList;
  loader.dismiss()
    })
}

splitView(){
  this.splitter.setSplit();
}

  policyDetail(index){
    const loading = this.loadingController.create({
      translucent: true,
      spinner: "dots",
    }).then(loader =>{
      loader.present();
      this.policyItem = this.policiesList[index];
      this.DataBus.setPolicyItem(this.policyItem)
      loader.dismiss();
      loader.onDidDismiss().then(dismissed =>{
        this.ionNavCtrl.navigateForward('edit-policy');
    })
  })
  }

 deletePolicy(index){
    let delKey = this.policiesList[index].key;
    firebase.database().ref('policies').child(delKey).remove().then((promise) =>{
      const toast = this.Toast.create({
        message: 'Success. Policy: ' + delKey + ' Deleted Successfully!',
        duration: 4000,
        color: "success",
        position: "bottom"
      }).then((toaster) =>{
        toaster.present();
      });
    }).catch((error) =>{
      const toast = this.Toast.create({
        message: 'Error. Policy has not been deleted',
        duration: 4000,
        color: "danger",
        position: "bottom"
      }).then((toaster) =>{
        toaster.present();
      }); 
    })
    this.cd.detectChanges();
  }

  addPolicy(){
    const modal = this.modal.create({
    component: AddPolicyPage
  }).then(view =>{
    view.present();
  });
  }

  setFilteredPolicy(){
    this.tempPolicyList = this.filter.filterPolicies(this.constList,this.searchTerm);
    this.policiesList = this.tempPolicyList;
  }

}
