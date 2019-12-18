import { Component, ChangeDetectorRef } from '@angular/core';

import { Platform, ToastController, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import {timer} from 'rxjs';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { InitialDataSaveService } from './services/initial-data-save.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    }
  ];
  vcode;
  vnum;
  showSplash = true;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private Toast: ToastController,
    private nativeStorage: NativeStorage,
    public menu : MenuController,
    private appVersion: AppVersion,
    private saveData: InitialDataSaveService,
    public cd: ChangeDetectorRef
  ) {
    this.initializeApp();
  }

  logOut(){
    this.menu.close();
    localStorage.clear();
    this.router.navigate(['log-in']);
    firebase.auth().signOut().then(() =>{
      const toast = this.Toast.create({
        message: 'Logged Out Successfully.',
        duration: 4000,
        color: "success",
        position: "bottom"
      }).then((toaster) =>{
        toaster.present();
      });
    }).catch((error) =>{
      const toast = this.Toast.create({
        message: 'Log Out Error!',
        duration: 4000,
        color: "danger",
        position: "bottom"
      }).then((toaster) =>{
        toaster.present();
      });
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.backgroundColorByHexString('#de7500')
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      
      timer(3000).subscribe(() => {
        this.appVersion.getVersionNumber().then((num)=>{
          this.saveData.saveAppCode(num)
          this.vcode = num
          this.cd.detectChanges();
        })
        this.showSplash = false
      })
    });
  }
}
