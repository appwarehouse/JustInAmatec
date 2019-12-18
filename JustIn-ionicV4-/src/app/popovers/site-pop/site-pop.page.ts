import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavParams, PopoverController } from '@ionic/angular';
import { EditSitePage } from '../../modals/edit-site/edit-site.page';

@Component({
  selector: 'app-site-pop',
  templateUrl: './site-pop.page.html',
  styleUrls: ['./site-pop.page.scss'],
})


export class SitePopPage implements OnInit {
  position;
  popSitesList = [];
  public obj = [];
  public allowedPolicies = [];
  constructor(public pop:PopoverController,public modal: ModalController,public navParams: NavParams) { 
    this.position = this.navParams.get('position');
    this.popSitesList = this.navParams.get('popSiteList');
  
  }

  ngOnInit() {
    this.obj = this.popSitesList[this.position];
    let item = this.popSitesList[this.position];
    Object.keys(item.allowed_policies).map((key) =>{
     this.allowedPolicies.push(item.allowed_policies[key])
    })
  }

  editSite(){
    const modal = this.modal.create({
      component: EditSitePage,
      componentProps: {
        siteItem: this.obj,
        allowedPolicies:this.allowedPolicies
       }
    }).then(view =>{
      view.present();
      view.onDidDismiss().then(()=>{
        this.pop.dismiss();
      })
    });
  }

  viewDevices(){
    
  }

}
