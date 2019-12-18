import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SplitterService } from 'src/app/services/splitter.service';
import { ModalController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { FirebaseServiceService } from 'src/app/services/firebase-service.service';
import { FilterListService } from 'src/app/services/filter-list.service';
import { AddListPage } from '../../modals/add-list/add-list.page';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase';
import { MenuLinksService } from 'src/app/services/menu-links.service';
import { Dialogs } from '@ionic-native/dialogs/ngx';


@Component({
  selector: 'app-lists',
  templateUrl: './lists.page.html',
  styleUrls: ['./lists.page.scss'],
})
export class ListsPage implements OnInit {
  public lists = [];
  public tempSearchList = [];
  public constList = [];
  public name;
  public searchTerm;
  public loggedPhoto;
  public loggedUsername;
  public displayItem: boolean;
  public listItem ;
  public adminStatus;
  constructor(private dialogs: Dialogs,public menu:MenuLinksService,public Toast:ToastController,public splitter: SplitterService, public ionNavCtrl:NavController,public cd:ChangeDetectorRef,public loadingController: LoadingController,public modal: ModalController,public FirebaseService:FirebaseServiceService, public filter:FilterListService,public storage:Storage) { 
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
      this.adminStatus = localStorage.getItem('isAdmin')
      if(this.adminStatus){
        let ref = firebase
                .database()
                .ref('lists')
                //read children
       ref.on('child_added', (Snapshot) =>{
          var item = Snapshot.val();
          item.key = Snapshot.key;
          if(item.updated_at){
            let unixTime = item.updated_at;
            let tempTime = new Date(unixTime);
            let time = tempTime.toLocaleString('en-GB');
            item.updated_at_time = time;
          }
          else{
            item.updated_at_time = "Not Modified";
          }
          this.lists.push(item);
      
        })
        // listen for data changes in firebase
        ref.on("child_changed", (snapshot) => {
      let item = snapshot.val();
      item.key = snapshot.key;
      if(item.updated_at){
        let unixTime = item.updated_at;
        let tempTime = new Date(unixTime);
        let time = tempTime.toLocaleString('en-GB');
        item.updated_at_time = time;
      }
      else{
        item.updated_at_time = "Not Modified";
      }
      this.lists.forEach((element,pos) =>{
        if(item.key === element.key){
          this.lists[pos] = item;
        }
       })

        });
        ref.on("child_removed", (snapshot) => {
          let item = snapshot.val();
          item.key = snapshot.key;
          this.lists.forEach((element,pos) =>{
            if(item.key === element.key){
              this.lists.splice(pos,1);
            }
           })
        });
      }
      else{
        /* this.FirebaseService.allowedSites.forEach(res =>{
          let ref = firebase
        .database()
        .ref('lists')
        .orderByChild('site_summary/uid')
        .equalTo(res.key);
        //read once
         ref.on('child_added', (Snapshot) => {
            var item = Snapshot.val();
            item.key = Snapshot.key;
            if(item.updated_at){
              let unixTime = item.updated_at;
              let tempTime = new Date(unixTime);
              let time = tempTime.toLocaleString('en-GB');
              item.updated_at_time = time;
            }
            else{
              item.updated_at_time = "Not Modified";
            }
            this.lists.push(item);
          })
          // listen for data changes in firebase
          ref.on("child_changed", (snapshot) => {
            let item = snapshot.val();
            item.key = snapshot.key;
           
            if(item.updated_at){
              let unixTime = item.updated_at;
              let tempTime = new Date(unixTime);
              let time = tempTime.toLocaleString('en-GB');
              item.updated_at_time = time;
            }
            else{
              item.updated_at_time = "Not Modified";
            }
            this.lists.forEach((element,pos) =>{
              if(item.key === element.key){
                this.lists[pos] = item;
              }
             })
      
              });
        }) */
      }
      this.constList = this.lists;
      loader.dismiss();
    })
  }

  setFilteredLists(){
    this.tempSearchList = this.filter.filterLists(this.constList,this.searchTerm);
    this.lists = this.tempSearchList;
    this.cd.detectChanges();
  }

  listItemDetail(index){
    const loading = this.loadingController.create({
      translucent: true,
      spinner: "dots",
    }).then(loader =>{
      loader.present();
      this.listItem = this.lists[index];
      let passedObj = 
        {
          listItem:this.listItem
        }
        let passedObject = JSON.stringify(passedObj)
     
      loader.dismiss();
      loader.onDidDismiss().then(dismissed =>{
        this.ionNavCtrl.navigateForward(['edit-list', passedObject/* , JSON.stringify(passedObject) */]);
    })
  })
}

 deleteList(listIndex){
    let delKey = this.lists[listIndex].key;
    firebase.database().ref('lists').child(delKey).remove().then((promise) =>{
      const toast = this.Toast.create({
        message: 'Success. List Key: ' + delKey + ' Deleted Successfully!',
        duration: 4000,
        color: "success"
      }).then((toaster) =>{
        toaster.present();
      });
    }).catch((error) =>{
      const toast = this.Toast.create({
        message: 'Error. List not deleted',
        duration: 4000,
        color: "danger"
      }).then((toaster) =>{
        toaster.present();
      }); 
    })
}

addList(){
  const modal = this.modal.create({
    component: AddListPage,
    componentProps: {
      sites:JSON.parse(localStorage.getItem('AllowedSites')),
     }
  }).then(view =>{
    view.present();
  });
}

}
