import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material';
import * as firebase from 'firebase';
import { Storage } from '@ionic/storage';
import { FirebaseServiceService } from 'src/app/services/firebase-service.service';
import { ToastController, LoadingController, NavController, NavParams, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-assign-device',
  templateUrl: './assign-device.page.html',
  styleUrls: ['./assign-device.page.scss'],
})
export class AssignDevicePage implements OnInit {
  public deviceItem;
  public sites = [];
  public policies = [];
  public delKey;
  public deviceCount;
  currentUser = firebase.auth().currentUser.uid;
  selectedPolicy: string;
  siteSelected;
  loader = false;
  constructor(public cd: ChangeDetectorRef,public storage: Storage, public Modal: ModalController, public FirebaseService: FirebaseServiceService, public navParams: NavParams, public loadingController: LoadingController, public Toast: ToastController) {
    this.deviceItem = this.navParams.get('deviceItem');

  }

  ngOnInit() {
    const loading = this.loadingController.create({
      translucent: true,
      spinner: "dots",
    }).then(loader => {
      loader.present();
      let tempItem = JSON.parse(localStorage.getItem('AllowedSites'));
      this.sites = tempItem;
      this.siteSelected;
      /* let ref = firebase
        .database()
        .ref('policies');
      ref.once('value', (Snapshot) => {
        Snapshot.forEach(child => {

          let item = child.val();
          item.key = child.key;
          this.policies.push(item);
        })
      })*/
      loader.dismiss(); 
    })

  }

  popPolicies(){
    this.policies = [];
    console.log(this.policies);
    this.cd.detectChanges();
    console.log(this.siteSelected)
     this.FirebaseService.getAllowedPolicies(this.siteSelected.key).then((promise) =>{
      this.policies = JSON.parse(localStorage.getItem('AllowedPolicies'));
      console.log(this.policies)
    }) 
  }

  assignAnnounce2() {
    this.loader = true;
    let siteItem;
    let policyItem;
    
    JSON.parse(localStorage.getItem('AllowedSites')).forEach(element => {
      if (element.display_name === this.siteSelected.display_name) {
        this.deviceCount = element.stats.device_count;
        let temp = element;
        let display_name = temp.display_name;
        let key = temp.key;
        let siteSummaryObject = {
          "display_name": display_name,
          "uid": key
        }
        siteItem = siteSummaryObject;
      }
    })

    this.policies.forEach(element => {
      if (element.display_name === this.selectedPolicy) {
        let temp = element;
        let display_name = temp.display_name;
        let key = temp.key;
        let policySummaryObject = {
          "display_name": display_name,
          "uid": key
        }
        policyItem = policySummaryObject;
      }
    })


    firebase.database().ref('devices/' + this.deviceItem.android_id).once('value', (Snapshot) => {
      if(Snapshot.val()){
        let deviceDetails = {
          display_name: Snapshot.val().display_name,
          android_id: Snapshot.val().android_id,
          api_key: this.deviceItem.api_key,
          last_location: this.deviceItem.last_location,
          last_seen: this.deviceItem.created_at,
          status: 'OK',
          site_summary: siteItem,
          policy_summary: policyItem,
          created_at: Snapshot.val().created_at,
          updated_at: firebase.database.ServerValue.TIMESTAMP,
      }

      firebase.database().ref('devices/'+ this.deviceItem.android_id).update(deviceDetails).then(()=>{
        
      }).catch((err)=>{
        
      })
      }

      this.delKey = this.deviceItem.key;
      console.log(this.delKey);
      let acceptedAnnounceObject = {
        accepting_admin_uid: this.currentUser,
        created_at: firebase.database.ServerValue.TIMESTAMP,
        device_uid: this.deviceItem.android_id,
        policy_summary: policyItem,
        site_summary: siteItem,
        updated_at: firebase.database.ServerValue.TIMESTAMP
      }

      let newDeviceObject = {
        display_name: this.deviceItem.display_name,
        android_id: this.deviceItem.android_id,
        api_key: this.deviceItem.api_key,
        last_location: this.deviceItem.last_location,
        status: 'OK',
        site_summary: siteItem,
        policy_summary: policyItem,
        created_at: firebase.database.ServerValue.TIMESTAMP,
        updated_at: firebase.database.ServerValue.TIMESTAMP,
      }

      let siteUpdateObject = {
        stats: {
          device_count: this.deviceCount + 1
        }
      }

      let announce = this.delKey

      let announce_obj = {
        android_id: this.deviceItem.android_id,
        api_key: this.deviceItem.api_key,
        created_at: this.deviceItem.created_at,
        display_name: this.deviceItem.display_name,
        human_ref: this.deviceItem.human_ref,
        last_location: this.deviceItem.last_location,
        status: this.deviceItem.status,
        updated_at: firebase.database.ServerValue.TIMESTAMP
      }
      console.log(JSON.stringify(acceptedAnnounceObject))
      console.log(JSON.stringify(announce))
      firebase.database().ref('announces_accepted/' + announce).set(acceptedAnnounceObject).then((promise) => {
        firebase.database().ref('announces_accepted/' + announce + '/announce').set(announce_obj).then((promise) => {
          firebase.database().ref('devices').child(this.deviceItem.android_id).set(newDeviceObject).then((promise) => {
            firebase.database().ref('announces').child(this.delKey).remove().then((promise) => {
              firebase.database().ref('sites').child(newDeviceObject.site_summary.uid).update(siteUpdateObject).then((promise) => {
                this.loader = false;
                const toast = this.Toast.create({
                  message: 'Success. Device: **' + this.deviceItem.display_name + '** Registered Successfully!',
                  duration: 6000,
                  color: "success"
                }).then((toaster) => {
                  toaster.present();
                });
              }).catch((error) => {
                this.loader = false;
                const toast = this.Toast.create({
                  message: 'Error. Site Device Count not updated.',
                  duration: 6000,
                  color: "danger"
                }).then((toaster) => {
                  toaster.present();
                });
              })
            }).catch((error) => {
              this.loader = false;
              const toast = this.Toast.create({
                message: 'Error. Announce not deleted.',
                duration: 6000,
                color: "danger"
              }).then((toaster) => {
                toaster.present();
              });
            })
          }).catch((error) => {
            this.loader = false;
            const toast = this.Toast.create({
              message: 'Error. Device Not Saved.',
              duration: 6000,
              color: "danger"
            }).then((toaster) => {
              toaster.present();
            });
          })
        }).catch((err) => {
          console.log(err)
        })
      }).catch((error) => {
        this.loader = false;
        const toast = this.Toast.create({
          message: 'Error. Announce not accepted.',
          duration: 6000,
          color: "danger"
        }).then((toaster) => {
          toaster.present();
        });
      })
    })
  }

  closeModal() {
    this.Modal.dismiss();
  }



}
