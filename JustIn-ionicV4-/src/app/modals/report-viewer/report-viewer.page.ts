import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-report-viewer',
  templateUrl: './report-viewer.page.html',
  styleUrls: ['./report-viewer.page.scss'],
})
export class ReportViewerPage implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  closePDF(){
    this.dialog.closeAll();
  }

}
