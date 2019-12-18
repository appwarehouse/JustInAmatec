import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import * as firebase from 'firebase';

@Component({
  selector: 'app-add-policy',
  templateUrl: './add-policy.page.html',
  styleUrls: ['./add-policy.page.scss'],
})
export class AddPolicyPage implements OnInit {
  inputName:string;
  inputDescription:string;
  inputJsonString:string;
  constructor(public Modal:ModalController, public Toast:ToastController) { }

  ngOnInit() {
  }

  savePolicy(){
    let listAddPolicyObject = {
      created_at: firebase.database.ServerValue.TIMESTAMP,
      display_name: this.inputName,
      description: this.inputDescription,
      state_policy: JSON.parse(this.inputJsonString),
      status: "Active",
      updated_at: firebase.database.ServerValue.TIMESTAMP
    }

    firebase.database().ref('policies').push(listAddPolicyObject).then((promise) =>{
      const toast = this.Toast.create({
        message: 'Success. Policy: **' +this.inputName+ '** Added Successfully!',
        duration: 5000,
        color: "success"
      }).then((toaster) =>{
        toaster.present();
      });
    }).catch((error) =>{
      const toast = this.Toast.create({
        message: 'Error. Policy has not been saved.',
        duration: 4000,
        color: "danger"
      }).then((toaster) =>{
        toaster.present();
      }); 
    })
  }

  closeModal(){
    this.Modal.dismiss();
  }

}
