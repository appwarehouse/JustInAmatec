import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

//methods for filtering data lists by specific fields
export class FilterListService {
  public tempList = [];
  public filteredList = [];
  constructor() { }

  //filtering by display name, in lower case
  filterLists(List,searchTerm:string){
    this.filteredList = [];
    this.tempList = List;
    this.tempList.filter((item) =>{
     let answers =  item.display_name.toLowerCase().includes(searchTerm.toLowerCase())
     if(answers){
      this.filteredList.push(item);
     }
   })
   return this.filteredList;
  }

  //filtering devices by site display name, in lower case
  filtersiteDevices(deviceList,searchTerm:string){
    this.filteredList = [];
    this.tempList = deviceList;
    this.tempList.filter((item) =>{
     let answers =  item.site_summary.display_name.toLowerCase().includes(searchTerm.toLowerCase())
     if(answers){
      this.filteredList.push(item);
     
     }
   })
   return this.filteredList;
  }

    //filtering devices by device display name, in lower case
  filternameDevices(deviceList,searchTerm:string){
   
    this.filteredList = [];
    this.tempList = deviceList;
    this.tempList.filter((item) =>{
     let answers =  item.display_name.toLowerCase().includes(searchTerm.toLowerCase())
     if(answers){
      this.filteredList.push(item);
     
     }
   })
   return this.filteredList;
  }

    //filtering policies by display name, in lower case
  filterPolicies(policyList,searchTerm:string){
    this.filteredList = [];
    this.tempList = policyList;
    this.tempList.filter((item) =>{
     let answers =  item.display_name.toLowerCase().includes(searchTerm.toLowerCase())
     if(answers){
      this.filteredList.push(item);
     }
   })
   return this.filteredList;
  }

      //filtering sites by display name, in lower case
  filterSites(siteList,searchTerm:string) {
    this.filteredList = [];
    this.tempList = siteList;
    this.tempList.filter((item) =>{
     let answers =  item.display_name.toLowerCase().includes(searchTerm.toLowerCase())
     if(answers){
      this.filteredList.push(item);
     }
   })
   return this.filteredList;
  }
}
