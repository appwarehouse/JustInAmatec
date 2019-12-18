import { Component } from '@angular/core';
import {MyFirstPlugin} from '@ionic-native/my-first-plugin/ngx';
import {Chainway2DPlugin} from '@ionic-native/chainway-2-d-plugin/ngx';
import {Device} from '@ionic-native/device/ngx'


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private MyFirstPlugin: MyFirstPlugin) {}

  ngOnInit(){
    this.MyFirstPlugin.nativeToast().then(()=>{
      console.log('tried')
    });
    console.log(this.MyFirstPlugin.platform)

}

  clicked(){
    console.log('fired')
    this.MyFirstPlugin.nativeToast().then(()=>{
      console.log('tried')
    })
    console.log(this.MyFirstPlugin.platform)
  }
}