import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataBusService {

  //ad-hoc method of passing policy data throughout the application
  public policyItem;
  constructor() {

   }

   setPolicyItem(item){
    this.policyItem = item;
   }

   getPolicyItem(){
     return this.policyItem;
  }
}
