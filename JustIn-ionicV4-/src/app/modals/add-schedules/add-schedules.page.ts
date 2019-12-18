import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavParams, AlertController, ToastController, ModalController } from '@ionic/angular';
import {database} from 'firebase'
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-schedules',
  templateUrl: './add-schedules.page.html',
  styleUrls: ['./add-schedules.page.scss'],
})
export class AddSchedulesPage implements OnInit {
  scheduleList;
  siteslist = [];
  selectedSite;
  Frequency;
  newRecipient;
  time = new Date().toISOString();
  selectedreportLength;
  reportLengthOptions = ['Today','Previous Day','Weekly Report'];
  frequencies = [{display_name: "Every Monday", expression: "Mon"},
  {display_name: "Every Tuesday", expression: "Tue"},
  {display_name: "Every Wednesday", expression: "Wed"},
  {display_name: "Every Thursday", expression: "Thu"},
  {display_name: "Every Friday", expression: "Fri"},
  {display_name: "Everyday", expression: "*"},
  {display_name: "Monday To Friday", expression: "Mon-Fri"}];
  recipients = [];
  recipientInput = false;
  customFrequencyOptions: any = {
    header: 'Frequency',
    subHeader: 'Select Job Frequncy'
  };
  customSiteOptions: any = {
    header: 'Site',
    subHeader: 'Select A Site'
  };
  customLengthOptions: any = {
    header: 'Length',
    subHeader: 'Choose Report Length'
  };
  emailForm:FormGroup
  constructor(public modal:ModalController, public formBuilder:FormBuilder, public Toast: ToastController,public navParams: NavParams, public alertController: AlertController, public cd: ChangeDetectorRef) {
    this.scheduleList = this.navParams.get('allItems');
   }

  ngOnInit() {
    this.emailForm = this.formBuilder.group({
      'newRecipient': [this.newRecipient,[
        Validators.required,
        Validators.email
      ]],
    })
    database().ref('sites').once('value', ((Snapshot)=>{
      this.siteslist = [];
      Snapshot.forEach((item)=>{
        console.log(item.val())
        let obj = item.val();
        obj.key = item.key;
        this.siteslist.push(obj)
        this.cd.detectChanges();
        this.siteslist.sort(function(a, b){
          var x = a.display_name.toLowerCase();
          var y = b.display_name.toLowerCase();
          if (x < y) {return -1;}
          if (x > y) {return 1;}
          return 0;
        });
      })
    }))
  }

  dismissModal(){
    this.modal.dismiss();
  }

  showInput(){
    if(this.recipientInput){
      this.recipientInput = false;
    }
    else{
      this.recipientInput = true;
    }
  }

  addEmail(){
    this.recipients.push(this.newRecipient)
    this.newRecipient = "";
  }

  presentAlert(event, item){
    const alert = this.alertController.create({
      header: 'Removing Recipient',
      message: 'Are You Sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {

          }
        }, {
          text: 'Okay',
          handler: () => {
            this.removeRecipient(item)
          }
        }
      ]
    });

    alert.then((data)=>{
      data.present();
    })
  }

  removeRecipient(item){
    let index = this.recipients.indexOf(item)
    this.recipients.splice(index, 1);
    }

    createSchedule(){
      if(!this.selectedSite){
        const toast = this.Toast.create({
          message: 'Please select a site',
          duration: 2500,
        }).then((toaster) => {
          toaster.present();
        });
        return;
      }
      if(!this.Frequency){
        const toast = this.Toast.create({
          message: 'Please set report frequency',
          duration: 2500,
        }).then((toaster) => {
          toaster.present();
        });
        return;
      }
      if(this.recipients.length === 0){
        const toast = this.Toast.create({
          message: 'Please add recipients for this report schedule!',
          duration: 2500,
        }).then((toaster) => {
          toaster.present();
        });
        return;
      }
      let expression = "";
      let hours = new Date(this.time).getHours();
      let minutes = new Date(this.time).getMinutes();
      expression = expression.concat(""+minutes+" "+hours)
      expression = expression.concat(" * * ")
      expression = expression.concat(""+ this.Frequency)
      console.log(expression);
  
      let obj = {
        display_name: this.selectedSite.display_name,
        interval: expression,
        rate_expression: this.Frequency,
        rate_time: new Date(this.time).toISOString(),
        report_length: this.selectedreportLength,
        siteUID: this.selectedSite.key,
        recipients: this.recipients
      }
  
      this.scheduleList.push(obj);

      database().ref('schedule').set(this.scheduleList).then(()=>{
        const toast = this.Toast.create({
          message: 'Schedule Updated!',
          duration: 2500,
          color: "success"
        }).then((toaster) => {
          toaster.present();
          this.modal.dismiss();
        });
      }).catch((err)=>{
        const toast = this.Toast.create({
          message: 'Schedule Update Failed!',
          duration: 2500,
          color: "danger"
        }).then((toaster) => {
          toaster.present();
        });
      })
    }

}
