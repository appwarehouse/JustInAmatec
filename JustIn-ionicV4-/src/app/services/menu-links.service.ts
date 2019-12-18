import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

// set the list of menu items dynamically through this service
export class MenuLinksService {
  public menuList = [];
  constructor() { }

  //get the list
  getMenuList(){
    return this.menuList;
  }

  //set normal user list
  setNormalMenuList(){
    this.menuList = [{
      title: 'Reporting',
      url: '/reporting',
      icon: 'stats',
      multi_level: false,
      open: false,
    }]
  }

  //set admin user list
  setAdminMenulist(){
    this.menuList = [
      {
        title: 'Sites',
        url: '/sites',
        icon: 'home',
        multi_level: false,
        open: false,
        submenu: [{title:'a', url:'', icon:''}]
      },
      {
        title: 'Devices',
        url: '/devices',
        icon: 'phone-portrait',
        multi_level: false,
        open: false,
        submenu: [{title:'a', url:'', icon:''}]
      },
      {
        title: 'Device Registration',
        url: '/registration',
        icon: 'person-add',
        multi_level: false,
        open: false,
        submenu: [{title:'c', url:'', icon:''}]
      },
      {
        title: 'Policies',
        url: '/policies',
        icon: 'list-box',
        multi_level: false,
        open: false,
        submenu: [{title:'v', url:'', icon:''}]
      },
      {
        title: 'Lists',
        url: '/lists',
        icon: 'checkbox',
        multi_level: false,
        open: false,
        submenu: [{title:'u', url:'', icon:''}]
      },
      {
        title: 'Reporting',
        url: '/reporting',
        icon: 'arrow-round-down',
        multi_level: true,
        open: false,
        submenu: [{title:'Report Generation', url:'/reporting', icon:'book'},
        {title:'Report Schedules', url:'/reporting-schedules', icon:'book'}]
      }/* ,
      {
        title: 'Test',
        url: '/test-page',
        icon: 'book',
        multi_level: true,
        open: false,
        submenu: [{title:'r', url:'', icon:''}]
      } */
    ]
  }
}
