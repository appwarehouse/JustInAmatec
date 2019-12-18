import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FilterListService } from '../../services/filter-list.service';
import { FirebaseServiceService } from '../../services/firebase-service.service';
import { Storage } from '@ionic/storage';
import { LoadingController, ModalController, PopoverController } from '@ionic/angular';
import { AddSitePage } from '../../modals/add-site/add-site.page';
import { SitePopPage } from '../../popovers/site-pop/site-pop.page';
import { SplitterService } from '../../services/splitter.service';
import { saveAs } from 'file-saver';
import * as firebase from 'firebase';
import { MenuLinksService } from 'src/app/services/menu-links.service';

@Component({
  selector: 'app-sites',
  templateUrl: './sites.page.html',
  styleUrls: ['./sites.page.scss'],
})
export class SitesPage implements OnInit {
  tempSiteList = [];
  public siteList = [];
  public uid ;
  adminStatus:boolean;
  public name ;
  public searchTerm;
  public loggedPhoto;
  public loggedUsername;
  public constList = [];
  constructor(public menu: MenuLinksService,public splitter: SplitterService,public cd:ChangeDetectorRef,public modal: ModalController,public popoverCtrl: PopoverController, public loadingController: LoadingController,public FirebaseService:FirebaseServiceService, public filter:FilterListService,public storage:Storage) { 
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
 
    this.splitter.setSplit();
    const loading = this.loadingController.create({
      translucent: true,
      spinner: "dots",
    }).then(loader =>{
      loader.present();
      this.storage.get('UID').then((val) => {

        localStorage.setItem('AllowedSites', JSON.stringify(this.siteList));
        this.FirebaseService.isSuperAdmin(val).then((promise) =>{
          this.FirebaseService.allowedSites = [];
          this.adminStatus = this.FirebaseService.adminStatus
          if(this.adminStatus === true){
            this.siteList = [];
            let ref = firebase.database().ref('sites')
            //read once
            ref.on('child_added', (childSnapshot) => {
               let item = childSnapshot.val();
               item.key = childSnapshot.key;
               let tempList = JSON.parse(localStorage.getItem('AllowedSites'))
               tempList.push(item);
               localStorage.setItem('AllowedSites', JSON.stringify(tempList));
               this.FirebaseService.allowedSites.push(item);
               this.siteList.push(item);
               this.siteList.sort(function(a, b){
                var x = a.display_name.toLowerCase();
                var y = b.display_name.toLowerCase();
                if (x < y) {return -1;}
                if (x > y) {return 1;}
                return 0;
              });
              })
            // listen for data changes in firebase
            ref.on("child_changed", (snapshot) => {
              var item = snapshot.val();
              item.key = snapshot.key;
              this.siteList.forEach((element,pos) =>{
               if(item.key === element.key){
                 element = item;
                 let storedList = JSON.parse(localStorage.getItem('AllowedSites'))
                 storedList[pos] = item;
                 localStorage.setItem('AllowedSites', JSON.stringify(storedList));
                 this.siteList[pos] = item;
                 this.siteList.sort(function(a, b){
                  var x = a.display_name.toLowerCase();
                  var y = b.display_name.toLowerCase();
                  if (x < y) {return -1;}
                  if (x > y) {return 1;}
                  return 0;
                });
               }
              })
            });
          }
          else{
            /* let refAnswer = firebase
            .database()
            .ref('user_roles/sites/' + val)
  //get site keys for a non super user
          let singleSiteKeys = [];
          //read once for each child and listen for any child added events in firebase
            refAnswer.on('child_added', (childSnapshot) => {
            let item;
            item.answer = childSnapshot.val();
            item.key = childSnapshot.key;
            if(item.answer === true){
              singleSiteKeys.push(item.key);
            }
            })
  
            singleSiteKeys.forEach(element =>{
              let ref = firebase
              .database()
              .ref('sites/' + element)
              ref.on("child_added", (Snapshot) => {
                
                  let item = Snapshot.val();
                  item.key = Snapshot.key;
                  this.FirebaseService.allowedSites.push(item);
                  this.siteList.push(item);
                  
              });
              ref.on("child_changed", (snapshot) => {
                var item = snapshot.val();
                item.key = snapshot.key;
                this.siteList.forEach((element,pos) =>{
                if(item.key === element.key){
                  element = item;
                  this.siteList[pos] = item;
                }
                })
              });
            }) */
          }
          this.constList = this.siteList;
          loader.dismiss();
        }).catch((error) =>{
       
          loader.dismiss();
        })
          });
    });
    
  }
  
  splitView(){
    this.splitter.setSplit();
  }

  addSite(){
 
    const modal = this.modal.create({
      component: AddSitePage,
    }).then(view =>{
      view.present();
    });
  }

  setFilteredSites(){
    this.tempSiteList = this.filter.filterSites(this.constList,this.searchTerm);
    if(this.tempSiteList){
      this.siteList = this.tempSiteList;
    }
    else{
      this.siteList = this.constList;
    }
    }

    presentPop(myEvent: Event, index) {
     const popover = this.popoverCtrl.create({
       component: SitePopPage,
       event: myEvent,
       translucent: true,
       componentProps:{
        position:index, 
        popSiteList:this.siteList
       },
     }).then((pop) =>{
       pop.present();
     })
    } 

}
