import { Component } from '@angular/core';
import {MyFirstPlugin} from '@ionic-native/my-first-plugin/ngx';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private myFirstPlugin: MyFirstPlugin) {}

  ngOnInit(){
    this.myFirstPlugin.nativeToast().then();
  }

  test(){
    this.myFirstPlugin.scan().then((data)=>{
      console.log(data)
    }).catch((err)=>{
      console.log(err)
    });
  }

}
