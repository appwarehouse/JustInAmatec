import { Component, OnInit } from '@angular/core';
import { NavParams, AlertController, ToastController, ModalController } from '@ionic/angular';
import { database } from 'firebase';

@Component({
  selector: 'app-edit-schedule-page',
  templateUrl: './edit-schedule.page.html',
  styleUrls: ['./edit-schedule.page.scss'],
})
export class EditSchedulePage implements OnInit {
  scheduleItem;
  allSchedules;
  position;
  setFreqencyExpressions;
  time;
  Frequency;
  selectedreportLength;
  newRecipient;
  reportLengthOptions = ['Today','Previous Day','Weekly Report'];
  date = new Date().toISOString();
  recipientInput = false
  frequencies = [{display_name: "Every Monday", expression: "Mon"},
  {display_name: "Every Tuesday", expression: "Tue"},
  {display_name: "Every Wednesday", expression: "Wed"},
  {display_name: "Every Thursday", expression: "Thu"},
  {display_name: "Every Friday", expression: "Fri"},
  {display_name: "Everyday", expression: "*"},
  {display_name: "Monday To Friday", expression: "Mon-Fri"}]
  customFrequencyOptions: any = {
    header: 'Frequency',
    subHeader: 'Select Job Frequncy'
  };
  customLengthOptions: any = {
    header: 'Length',
    subHeader: 'Choose Report Length'
  };
  constructor(public modal:ModalController,public navParams: NavParams, public alertController: AlertController, public Toast: ToastController) { 
    this.scheduleItem = this.navParams.get('ScheduleItem');
    this.allSchedules = this.navParams.get('allItems');
    this.position = this.navParams.get('position');

  }

  ngOnInit() {
    this.time = this.scheduleItem.rate_time
    this.selectedreportLength = this.scheduleItem.report_length
    this.Frequency = this.scheduleItem.rate_expression
  }

  dismissModal(){
    this.modal.dismiss();
  }

  addEmail(){
    this.scheduleItem.recipients.push(this.newRecipient)
    this.newRecipient = "";
  }

  createSchedule(){
    this.allSchedules.splice(this.position, 1);
    let expression = "";
    let hours = new Date(this.time).getHours();
    let minutes = new Date(this.time).getMinutes();
    expression = expression.concat(""+minutes+" "+hours)
    expression = expression.concat(" * * ")
    expression = expression.concat(""+ this.Frequency)
    console.log(expression);

    let obj = {
      display_name: this.scheduleItem.display_name,
      interval: expression,
      rate_expression: this.Frequency,
      rate_time: new Date(this.time).toISOString(),
      report_length: this.selectedreportLength,
      siteUID: this.scheduleItem.siteUID,
      recipients: this.scheduleItem.recipients
    }

    this.allSchedules.push(obj);
    database().ref('schedule').set(this.allSchedules).then(()=>{
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

  showInput(){
    if(this.recipientInput){
      this.recipientInput = false;
    }
    else{
      this.recipientInput = true;
    }
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
    let index = this.scheduleItem.recipients.indexOf(item)
    this.scheduleItem.recipients.splice(index, 1);
    }

}
