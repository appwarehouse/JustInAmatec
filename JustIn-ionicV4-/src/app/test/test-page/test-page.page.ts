import { Component, OnInit } from '@angular/core';
import { MenuLinksService } from 'src/app/services/menu-links.service';

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.page.html',
  styleUrls: ['./test-page.page.scss'],
})
export class TestPagePage implements OnInit {

  constructor(public menu: MenuLinksService) { }
  menuList = [];
  ngOnInit() {
    this.menuList = this.menu.menuList
  }

  toggleSection(item){
    if(item.open === true){
      item.open = false;
    }
    else{
      item.open = true;
    }
  }

}
