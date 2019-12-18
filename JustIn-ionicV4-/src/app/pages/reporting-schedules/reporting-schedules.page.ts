import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase'
import { MenuLinksService } from 'src/app/services/menu-links.service';
import { PopoverController, ModalController } from '@ionic/angular';
import {SchedulePopPage} from '../../popovers/schedules-pop/schedules-pop.page'
import {AddSchedulesPage} from '../../modals/add-schedules/add-schedules.page'
import { MatDialog } from '@angular/material';
import { ReportViewerPage } from 'src/app/modals/report-viewer/report-viewer.page';
import cronstrue from 'cronstrue';


@Component({
  selector: 'app-reporting-schedules',
  templateUrl: './reporting-schedules.page.html',
  styleUrls: ['./reporting-schedules.page.scss'],
})
export class ReportingSchedulesPage implements OnInit {
  loggedUsername;
  schedulesList = [];
  menuList = [{name: 'Test1', children: []}]
  pdfSrc = "https://s1.q4cdn.com/806093406/files/doc_downloads/test.pdf";
  constructor(public dialog: MatDialog,public menu:MenuLinksService,public popoverCtrl: PopoverController, public modal: ModalController) {
    let answer = localStorage.getItem('isAdmin')
    if(answer === 'true'){
      this.menu.setAdminMenulist();
    }
    else{
      this.menu.setNormalMenuList();
    }
   }

  ngOnInit() {
    this.loggedUsername = localStorage.getItem('loggedDisplayName');
    let ref = firebase.database()
    .ref('schedule').on('value', (Snapshot)=>{
      this.schedulesList = [];
      Snapshot.forEach((item)=>{
        let obj = item.val();
        obj.intervalString = cronstrue.toString(obj.interval);
        console.log(obj)
        this.schedulesList.push(obj)
      })
    })
  }

  openPDF(){
    const dialogRef = this.dialog.open(ReportViewerPage, {
      width: '80vw',
      height: '95vh'
    });
  }

  presentPop(myEvent: Event, index) {
    const popover = this.popoverCtrl.create({
      component: SchedulePopPage,
      event: myEvent,
      translucent: true,
      componentProps:{
       position:index, 
       popScheduleList:this.schedulesList
      },
    }).then((pop) =>{
      pop.present();
    })
   } 

   addSchedule(){
    const modal = this.modal.create({
      component: AddSchedulesPage,
      componentProps: {
        allItems:this.schedulesList,
       }
    }).then(view =>{
      view.present();
    });
   }

}
