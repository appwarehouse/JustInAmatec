import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, ToastController, PopoverController, AlertController } from '@ionic/angular';
import { EditSchedulePage } from 'src/app/modals/edit-schedule/edit-schedule.page';
import { database } from 'firebase'

@Component({
  selector: 'app-schedule-pop',
  templateUrl: './schedules-pop.page.html',
  styleUrls: ['./schedules-pop.page.scss'],
})
export class SchedulePopPage implements OnInit {
  position;
  popScheduleList;
  obj;
  constructor(public alertController: AlertController,public modal: ModalController,public navParams: NavParams, public Toast: ToastController, public pop: PopoverController) { 
    this.position = this.navParams.get('position');
    this.popScheduleList = this.navParams.get('popScheduleList');
    console.log(this.position)
    console.log(this.popScheduleList)

  }

  ngOnInit() {
    this.obj = this.popScheduleList[this.position];
  }

  deleteSchedule(){
    database().ref('schedule').child(this.position).remove((err)=>{
      if(err){
        console.log(err)
      }
      else{
        const toast = this.Toast.create({
          message: 'Schedule Deleted',
          duration: 2500,
        }).then((toaster) => {
          toaster.present();
          this.pop.dismiss();
        });
      }
    })
    this.popScheduleList.splice(this.position, 1);
  }

  editSchedule(){
    const modal = this.modal.create({
      component: EditSchedulePage,
      componentProps: {
        ScheduleItem: this.obj,
        allItems:this.popScheduleList,
        position: this.position
       }
    }).then(view =>{
      view.present();
      view.onDidDismiss().then(()=>{
        this.pop.dismiss();
      })
        });
  }

  presentAlert(event){
    const alert = this.alertController.create({
      header: 'Removing Schedule',
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
            this.deleteSchedule()
          }
        }
      ]
    });

    alert.then((data)=>{
      data.present();
    })
  }

}

