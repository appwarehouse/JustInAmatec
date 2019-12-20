import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchEngineService {
  filteredList = [];
  tempList = [];
  constructor() { 

  }

  //all the below methods are for searching, where the relevant field is converted to lowercase and is checked for the characters in the search term

  searchName(List,searchTerm:string){
    this.filteredList = [];
    this.tempList = List;
    this.tempList.filter((item) =>{
      if(item.evidence_items.driver_card){
        let answers =  item.evidence_items.driver_card.lastname.toLowerCase().includes(searchTerm.toLowerCase())
        if(answers){
         this.filteredList.push(item);
        }
      }
   })
   return this.filteredList;
  }

  searchID(List,searchTerm:string){
    this.filteredList = [];
    this.tempList = List;
    this.tempList.filter((item) =>{
      if(item.evidence_items.id_card){
        let answers =  item.evidence_items.id_card.id_number.toLowerCase().includes(searchTerm.toLowerCase())
        if(answers){
         this.filteredList.push(item);
        }
      }
   })
   return this.filteredList;
  }
}
