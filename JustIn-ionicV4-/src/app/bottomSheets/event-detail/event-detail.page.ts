import { Component, OnInit, Inject } from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.page.html',
  styleUrls: ['./event-detail.page.scss'],
})
export class EventDetailPage implements OnInit {
  public eventItem;
  public mapsRef;
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public eventData: any) { 
    
    this.eventItem = eventData;
  }

  ngOnInit() {
    if(this.eventItem.evidence_items){
      if(this.eventItem.evidence_items.location){
        let lat = this.eventItem.evidence_items.location.latitude;
        let long = this.eventItem.evidence_items.location.longitude;
        this.mapsRef = "http://www.google.com/maps/place/" +lat+","+long+"/"
      }
      else{
        this.mapsRef = "http://www.google.com/maps/place/-26.151356,28.159319/";
      }
    }
    else{
      this.mapsRef = "http://www.google.com/maps/place/-26.151356,28.159319/";
    }
    
  }

}
