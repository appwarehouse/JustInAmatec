import { Component } from '@angular/core';
import * as firebase from 'firebase';
import { Platform, ToastController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplitterService } from './services/splitter.service';
import { Router } from '@angular/router';
import { MenuLinksService } from './services/menu-links.service';
import { FirebaseServiceService } from './services/firebase-service.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'Sites',
      url: '/sites',
      icon: 'home'
    },
    {
      title: 'Devices',
      url: '/devices',
      icon: 'phone-portrait'
    },
    {
      title: 'Device Registration',
      url: '/registration',
      icon: 'person-add'
    },
    {
      title: 'Policies',
      url: '/policies',
      icon: 'list-box'
    },
    {
      title: 'Lists',
      url: '/lists',
      icon: 'checkbox'
    },
    {
      title: 'Reporting',
      url: '/reporting',
      icon: 'stats'
    }
  ];

  constructor(
    public FirebaseService:FirebaseServiceService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public splitter: SplitterService,
    public router:Router,
    public Toast:ToastController,
    public MenuList: MenuLinksService,
    public ionNavCtrl: NavController
  ) {
    this.initializeApp();
  }

  toggleSection(item){
    if(item.icon === 'arrow-round-down'){
      item.icon = 'arrow-round-up'
    }
    else{
      item.icon = 'arrow-round-down'
    }

    if(item.open === true){
      item.open = false;
    }
    else{
      item.open = true;
    }
  }

  //dynamically set the menu list
  menu(){
    return this.MenuList.getMenuList();
  }


  //dynamicaly determine if the splitmenu is open or closed
  splitView(){
    return this.splitter.getSplit();
  }

  //if image is clicked, navigate home
  homeClick(){
    let answer = this.FirebaseService.adminStatus
    if(answer){
      this.router.navigate(['sites']);
    }
  }

  //logout of application
  Logout(){
    //clear storagr and navigate to root
    localStorage.clear();
    this.ionNavCtrl.navigateRoot(['']);
    this.MenuList.menuList = [];
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
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
