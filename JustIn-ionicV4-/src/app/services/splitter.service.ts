import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

//set if the split menu is open or if its closed
export class SplitterService {
  public splitValue = false;
  constructor() { }

  setSplit(){
    this.splitValue = !this.splitValue
  }

  getSplit(){
    return this.splitValue
  }
}
