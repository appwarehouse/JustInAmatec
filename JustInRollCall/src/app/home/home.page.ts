import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { LoadingController, ToastController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';
import { InitialDataSaveService } from '../services/initial-data-save.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  formattedTodayDate;
  sitesList;
  siteDevices;
  constructor(public Toast: ToastController,public cd: ChangeDetectorRef,private nativeStorage: NativeStorage,private datasave: InitialDataSaveService,public loadingController: LoadingController, public router: Router) {}

  ngOnInit(){
    const loading = this.loadingController.create({
      translucent: true,
      spinner: "dots",
    }).then(loader =>{
      loader.present();
      firebase.auth().onAuthStateChanged((result) => {
        if (result) {
          this.datasave.saveUserData(result).then(()=>{
            let options = { year: 'numeric', month: 'short', day: 'numeric' }
            this.formattedTodayDate = new Date().toLocaleDateString('en-GB', options)
            this.getItems().then(()=>{
              loader.dismiss();
            })
          })
        }
      })
    })
    
    
  }

  getItems(){
    return new Promise((resolve, reject)=>{
      console.log('reached')
      if(this.allowedSites()){
        console.log('true')
        let list = this.allowedSites();
        console.log(JSON.parse(list));
        this.sitesList = JSON.parse(list)
        this.sitesList.sort(function(a, b){
          var x = a.display_name.toLowerCase();
          var y = b.display_name.toLowerCase();
          if (x < y) {return -1;}
          if (x > y) {return 1;}
          return 0;
        });
        this.cd.detectChanges();
        return resolve();
      }
      else{
        console.log('false')
        this.getItems();
      }
    })
  }

  allowedSites(){
    return localStorage.getItem('AllowedSites')
  }

  doRefresh(event){
    firebase.auth().onAuthStateChanged((result) => {
      if (result) {
        this.datasave.saveUserData(result).then(()=>{
          if(this.allowedSites()){
            let list = this.allowedSites();
            console.log(JSON.parse(list));
            this.sitesList = JSON.parse(list)
            this.sitesList.sort(function(a, b){
              var x = a.display_name.toLowerCase();
              var y = b.display_name.toLowerCase();
              if (x < y) {return -1;}
              if (x > y) {return 1;}
              return 0;
            });
            event.target.complete()
            this.cd.detectChanges();
            console.log(this.sitesList)
          }
          else{
            const toast = this.Toast.create({
              message: 'Refresh Error!',
              duration: 2500,
              position: "bottom"
            }).then((toaster) =>{
              toaster.present();
            })
            event.target.complete();
          }
        })
      }
      else{
        const toast = this.Toast.create({
          message: 'Refresh Error!',
          duration: 2500,
          position: "bottom"
        }).then((toaster) =>{
          toaster.present();
        })
        event.target.complete();
      }
    })
  }

  getSiteDevices(uid){
    return new Promise((resolve, reject) => {
    this.siteDevices = [];
    let ref = firebase
              .database()
              .ref('devices')
              .orderByChild('/site_summary/uid')
              .equalTo(uid);
      ref.once('value', (Snapshot)=>{
        Snapshot.forEach((child) =>{
          let item = child.val();
          item.key = child.key;
          this.siteDevices.push(item);
        })
      }).then(()=>{
        return resolve();
      })
    })
  }

 check2(){
    console.log("started")
    firebase.database().ref('events').orderByChild('/device/policy_summary/uid')
    .equalTo('-LQn9h0P-IAEKVyLs7Dx').once('value', (Snapshot) =>{
      console.log(Snapshot.val());
    })
  }

  performCheck(site){
    let tempList = [];
    let eventKeys = [];
    let selectedDevicesKeys = [];
    let selectedSiteUid = site.key
    const loading = this.loadingController.create({
      translucent: true,
      spinner: "dots",
    }).then(loader =>{
      loader.present();
      let currentDate = new Date();
      let currentDateYear = new Date(currentDate).getFullYear();
      let currentDateMonth = new Date(currentDate).getMonth() + 1;
      let currentDateDate = new Date(currentDate).getDate();
      this.getSiteDevices(site.key).then(()=>{
        if(this.siteDevices.length > 0){
          this.siteDevices.forEach((key, pos)=>{
            let ref = firebase
            .database()
            .ref('event_index/'+selectedSiteUid+'/'+key.key+'/'+currentDateYear+'/'+currentDateMonth+'/'+currentDateDate)
            ref.once('value', (Snapshot) =>{
              Snapshot.forEach((el) =>{
                let a = el.val();
                let item = el.key;
                eventKeys.push(item);
              })
            }).then((data)=>{
              if(pos === this.siteDevices.length - 1){
                if(eventKeys.length > 0){
                  console.log(eventKeys)
                  eventKeys.forEach((el, eventpos) =>{
                    let devRef = firebase
                    .database()
                    .ref('events/'+ el)
                    
                    devRef.once('value', (Snapshot) =>{
                        let item = Snapshot.val();
                        item.key = Snapshot.key;
                        if(item.evidence_items.custom_fields){
                          console.log(item);
                        }
                        let unixTime = new Date(item.created_at);
                        item.created_at_time = unixTime.toLocaleString('en-GB');
                        tempList.push(item);
                    }).then((promise) =>{
                      if(eventpos === eventKeys.length - 1){
                        this.nativeStorage.setItem('results',tempList).then(()=>{
                          this.nativeStorage.setItem('site',site.display_name).then(()=>{

                          })
                          loader.dismiss();
                          this.router.navigate(['generated-results'])
                        }).catch((err)=>{
        
                        })
                        loader.dismiss();
                      }
                    })
                    })
                }
                else{
                  this.nativeStorage.remove('results').then(()=>{
                    this.nativeStorage.setItem('site',site.display_name).then(()=>{

                    })
                    loader.dismiss();
                    this.router.navigate(['generated-results'])
                  })
                }
                
              }
              
            })
          })
        }
        else{
          this.nativeStorage.remove('results').then(()=>{
            loader.dismiss();
            this.router.navigate(['generated-results'])
          })
        }
        
        
      })
      
  })
}

}
