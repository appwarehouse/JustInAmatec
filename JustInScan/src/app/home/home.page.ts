import { Component } from '@angular/core';
import {MyFirstPlugin} from '@ionic-native/my-first-plugin/ngx';
import {HoneyWellScan} from '@ionic-native/honey-well-scan/ngx';
import { ToastController } from '@ionic/angular';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private byteArrayString;

  constructor(private permissions: AndroidPermissions,private myFirstPlugin: MyFirstPlugin, private honeywell: HoneyWellScan, private Toast:ToastController) {}

  ngOnInit(){
    this.myFirstPlugin.nativeToast().then();
  }

  bin2String(array) {
    var result = "";
    for (var i = 0; i < array.length; i++) {
      result += String.fromCharCode(parseInt(array[i], 2));
    }
    return result;
  }

  test(){
    console.log("Firing")
    this.myFirstPlugin.scan().then((data)=>{
      console.log(data)
    }).catch((err)=>{
      console.log(err)
    });
  }

  test2(){
    console.log("Firing2")
    this.myFirstPlugin.nativeToast().then();
  }

  test3(){
    this.honeywell.nativeToast().then((data)=>{
      const toast = this.Toast.create({
        message: data,
        duration: 6000,
        color: 'success'
      });
      toast.then((toaster)=>{
        toaster.present();
      })
    }).catch((err)=>{
      const toast = this.Toast.create({
        message: err,
        duration: 6000,
        color: 'danger'
      });
      toast.then((toaster)=>{
        toaster.present();
      })
    });
  }

  test4(){
    this.honeywell.scan().then((data)=>{
      this.byteArrayString = data;
      console.log(data)
      const toast = this.Toast.create({
        message: 'javcjhas',
        duration: 6000,
        color: 'success'
      });
      toast.then((toaster)=>{
        toaster.present();
      })
    }).catch((err)=>{
      this.byteArrayString = err;
      const toast = this.Toast.create({
        message: 'khkbflIWHEB',
        duration: 6000,
        color: 'danger'
      });
      toast.then((toaster)=>{
        toaster.present();
      })
    })
  }

}
