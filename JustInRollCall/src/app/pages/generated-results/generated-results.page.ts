import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { SearchEngineService } from 'src/app/services/search-engine.service';

@Component({
  selector: 'app-generated-results',
  templateUrl: './generated-results.page.html',
  styleUrls: ['./generated-results.page.scss'],
})
export class GeneratedResultsPage implements OnInit {
  tempAllList = [];
  tempVehicleList = [];
  tempPedestrianList = [];
  vehicleresultList = [];
  vehicleExitEvents = [];
  vehicleEnterEvents = [];
  driverResultList = [];
  driverExitEvents = [];
  driverEnterEvents = [];
  pedestrianresultList = [];
  pedestrianExitEvents = [];
  pedestrianEnterEvents = [];
  isData = [];
  vehicleShow ;
  pedestrianShow ;
  allShow = true;
  searchTerm;
  searchIDTerm;
  searchVehicleTerm;
  allList = [];
  sitename;
  selectedFilterItems = "gender,timein,company,license";
  constructor(private nativeStorage: NativeStorage, public cd: ChangeDetectorRef, public search: SearchEngineService) { }

  ngOnInit() {
    //on init, remove all events that have been denied entry
    //next, loop through the remaining events and separate them by vehicle and pedestrian
    //then by GateExit or by GateEntry
    //next, loop vehicle exits and for each of the vehicle reg numbers, check if it is in the vehicle entries. 
    //if yes, assumption is that the vehicle has left the premises
    //if no, assumption is that the vehicle is still on site
    //the same process is done for the pedestrian events based on the id number object

    //
    this.nativeStorage.getItem('site').then((data)=>{
      this.sitename = data
    })
    this.nativeStorage.getItem('results').then((data)=>{
      this.isData = data
      console.log(data)
      data.forEach((event, eventpos)=>{

        if(event.policy_result != 'denied'){
          if(!event.evidence_items.custom_fields){
            event.company = "Not Available"
          }

          if(event.evidence_items.custom_fields){
            event.company = "Not Available"
          }

          if(event.evidence_items.vehicle_disk){
            if(event.evidence_items.pedestrian_card_number){
              console.log(event)
            }

            
            
              
              if(event.event_type === "GateExit"){
                let vinfo = event.evidence_items.vehicle_disk.vehicle_reg
                this.vehicleExitEvents.push(vinfo);
              }
              if(event.event_type === "GateEnter"){
                let vinfo = event.evidence_items.vehicle_disk.vehicle_reg
                this.vehicleEnterEvents.push([{eventpos},{vinfo}]);
              }
            
          }

          if(event.evidence_items.id_card){
            console.log(event);
            if(event.event_type === "GateExit"){
              let vinfo = event.evidence_items.id_card.id_number
              this.pedestrianExitEvents.push(vinfo);
            }
            if(event.event_type === "GateEnter"){
              let vinfo = event.evidence_items.id_card.id_number
              this.pedestrianEnterEvents.push([{eventpos},{vinfo}]);
            } 
          }

          if(event.evidence_items.driver_card){
            /* if(!event.evidence_items.vehicle_disk){
              if(event.event_type === "GateExit"){
                let vinfo = event.evidence_items.id_card.id_number
                this.pedestrianExitEvents.push(vinfo);
              }
              if(event.event_type === "GateEnter"){
                let vinfo = event.evidence_items.id_card.id_number
                this.pedestrianEnterEvents.push([{eventpos},{vinfo}]);
              } 
            } */
          }
          
        }
         

        if(eventpos === data.length - 1){
            this.pedestrianEnterEvents.forEach((itemEvent, scndpos)=>{
            if(this.pedestrianExitEvents.includes(itemEvent[1].vinfo)){
            
            }
            else{
              this.pedestrianresultList.push(data[itemEvent[0].eventpos]);
              this.allList.push(data[itemEvent[0].eventpos]);
              this.tempAllList.push(data[itemEvent[0].eventpos])
              this.tempPedestrianList.push(data[itemEvent[0].eventpos])
            }

            if(scndpos === this.pedestrianEnterEvents.length - 1){
              this.pedestrianresultList.sort(function(a, b){return a.created_at - b.created_at});
              console.log(this.pedestrianresultList);
              this.allList.sort(function(a, b){return a.created_at - b.created_at});
              console.log(this.allList);
              this.allShow = true;
            }
          })

          this.vehicleEnterEvents.forEach((itemEvent, scndpos)=>{
            if(this.vehicleExitEvents.includes(itemEvent[1].vinfo)){
             
            }
            else{
              this.vehicleresultList.push(data[itemEvent[0].eventpos])
              this.allList.push(data[itemEvent[0].eventpos])
              this.tempAllList.push(data[itemEvent[0].eventpos])
              this.tempVehicleList.push(data[itemEvent[0].eventpos])
              this.allShow = true;
            }

            if(scndpos === this.vehicleEnterEvents.length - 1){
              this.vehicleresultList.sort(function(a, b){return a.created_at - b.created_at});
              this.allList.sort(function(a, b){return a.created_at - b.created_at});
              console.log(this.vehicleresultList);
              console.log(this.allList);
              console.log(this.tempAllList)
              this.allShow = true;
            }
          })
        }
      })
    }).catch((err)=>{
      console.log(err)
    })
  }

  //when the segment is clicked, get the relevant segment name and assign the divs to show/hide
  //detect changes afterwards to force any change that are not appearing
   segmentChanged(event){
     console.log(event);
    if(event.detail.value === 'vehicle'){
      this.vehicleShow = true;
      this.pedestrianShow = false;
      this.allShow = false;
      this.cd.detectChanges();
    }
    if(event.detail.value === 'pedestrian'){
      this.vehicleShow = false;
      this.pedestrianShow = true;
      this.allShow = false;
      this.cd.detectChanges();
    }
    if(event.detail.value === 'all'){
      this.vehicleShow = false;
      this.pedestrianShow = false;
      this.allShow = true;
      this.cd.detectChanges();
    }
  }


  //method to search for results on the 'All' segment
  searchAll(){
    if(this.searchTerm.length > 0){
      this.allList = this.search.searchName(this.tempAllList,this.searchTerm);
      this.allList.sort(function(a, b){return a.created_at - b.created_at});
    }
    else{
      this.allList = this.tempAllList.sort(function(a, b){return a.created_at - b.created_at});
    }
    

  }

    //method to search for results on the 'vehicle' segment
  searchVehicle(){
    if(this.searchVehicleTerm.length > 0){
      this.vehicleresultList = this.search.searchName(this.tempVehicleList,this.searchVehicleTerm);
      this.vehicleresultList.sort(function(a, b){return a.created_at - b.created_at});
    }
    else{
      this.vehicleresultList = this.tempVehicleList.sort(function(a, b){return a.created_at - b.created_at});

    }
    
  }

    //method to search for results on the 'pedestrian' segment
  searchID(){
    if(this.searchIDTerm.length > 0){
      this.pedestrianresultList = this.search.searchID(this.tempPedestrianList,this.searchIDTerm);
      this.pedestrianresultList.sort(function(a, b){return a.created_at - b.created_at});
    }
    else{
      this.pedestrianresultList = this.tempPedestrianList.sort(function(a, b){return a.created_at - b.created_at});

    }
    
  }

  

  resultDetail(){

  }

}
