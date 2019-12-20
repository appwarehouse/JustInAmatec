import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import * as firebase from 'firebase';
import { FirebaseServiceService } from 'src/app/services/firebase-service.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { MatPaginator, MatTableDataSource, MatBottomSheet, MatBottomSheetRef, MatToolbar } from '@angular/material'
import { EventDetailPage } from '../../bottomSheets/event-detail/event-detail.page'
import { BehaviorSubject } from 'rxjs';
import { SplitterService } from 'src/app/services/splitter.service';
import { AngularCsv } from 'angular7-csv';
import { saveAs } from 'file-saver';
import { MenuLinksService } from 'src/app/services/menu-links.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as xlsx from 'xlsx';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { String, StringBuilder } from 'typescript-string-operations';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import cronstrue from 'cronstrue';

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.page.html',
  styleUrls: ['./reporting.page.scss'],
})


export class ReportingPage implements OnInit {
  @ViewChild('inOutPaginator') inOutPaginator: MatPaginator;
  @ViewChild('AllPaginator') AllPaginator: MatPaginator;

  public barChartLabels = ['In', 'Out'];
  public barChartType = 'bar';
  public barChartLegend = true;
  public barChartData = [];
  countIn;
  countOut;
  viewResults = false;
  inoutlist = []
  loader = false;
  showExport = false;
  inOutdataSource;
  renderedData: any;
  display = true;
  selectedSite: string;
  setDevicesString = [];
  searchTerm: string;
  resultsDisplay = false;
  icon = "arrow-round-down";
  columnsToDisplay = ["Event Date", "Driver Photo", "Summary", "Evidence Items", "Event Type", "Event Result"];
  inOutcolumnsToDisplay = ["Site", "Device", "Entry Date", "Exit Date", "Minutes On Site", "Vehicle Details", "Driver Details", "Driver Photo"]
  public fromDateTime;
  public toDateTime;
  public loggedPhoto;
  public loggedUsername;
  public sites = [];
  public devices = [];
  searchFilterTerm;
  ReportType = "AllEvents";
  public eventsList = new BehaviorSubject([]);
  dateForm: FormGroup;
  devicesForm: FormGroup;
  datasource = new MatTableDataSource();
  showPDFExport;
  inOutpage = 1;
  inOutpageSize = 10;
  inOutCollectionSize;
  get inOutResults() {
    return this.inoutlist
      .slice((this.inOutpage - 1) * this.inOutpageSize, (this.inOutpage - 1) * this.inOutpageSize + this.inOutpageSize);
  }
  events = [{ name: "All Events Report", value: "AllEvents" }, { name: "In Out Report", value: "InOut" }]
  constructor(public formBuilder: FormBuilder, public Toast: ToastController, public menu: MenuLinksService, public splitter: SplitterService, public bottomSheet: MatBottomSheet, public FirebaseService: FirebaseServiceService, public loadingController: LoadingController, public cd: ChangeDetectorRef, public HttpClient: HttpClient, public toast: ToastController) {
    this.datasource.connect().subscribe(d => this.renderedData = d);
    let answer = localStorage.getItem('isAdmin')
    if (answer === 'true') {
      this.menu.setAdminMenulist();
    }
    else {
      this.menu.setNormalMenuList();
    }
  }


  ngOnInit() {
    let newDate = new Date("01/08/92");
    console.log(newDate);
    let today = new Date()
    let days = Math.floor((today.getTime() - newDate.getTime()) / (1000 * 60 * 60 * 24))
    console.log(Math.floor(days / 365));
    this.dateForm = this.formBuilder.group({
      'fromDateTime': [this.fromDateTime, [
        Validators.required
      ]],
      'toDateTime': [this.toDateTime, [
        Validators.required
      ]]
    })
    this.devicesForm = this.formBuilder.group({
      'setDevicesString': [this.setDevicesString, [
        Validators.required
      ]],
    })
    this.loggedPhoto = localStorage.getItem('loggedphotoURL');
    this.loggedUsername = localStorage.getItem('loggedDisplayName');
    const loading = this.loadingController.create({
      translucent: true,
      spinner: "dots",
    }).then(loader => {
      loader.present();
      this.devices = [];
      this.sites = JSON.parse(localStorage.getItem('AllowedSites'));
      console.log(this.sites);
      this.sites.sort(function(a, b){
        var x = a.display_name.toLowerCase();
        var y = b.display_name.toLowerCase();
        if (x < y) {return -1;}
        if (x > y) {return 1;}
        return 0;
      });
      this.selectedSite = this.sites[0].display_name;
      let ref = firebase
        .database()
        .ref('devices')
        .orderByChild('/site_summary/uid')
        .equalTo(this.sites[0].key);
      //read once
      ref.on('child_added', (Snapshot) => {
        //convert to array
        let item = Snapshot.val();
        item.key = Snapshot.key;
        this.setDevicesString.push(item.display_name);
        this.devices.push(item)

      })
      loader.dismiss();
    })
  }

  clearAll(event) {
    console.log('clearing')
    this.showPDFExport = false;
    this.showExport = false;
    this.viewResults = false;
    this.inoutlist = [];
    this.inOutdataSource = new MatTableDataSource(this.inoutlist);
    this.datasource = new MatTableDataSource(this.inoutlist);
  }


  //initiate report generation
  searchResult() {
    this.inOutdataSource = new MatTableDataSource([]);
    this.datasource = new MatTableDataSource([]);
    this.datasource.paginator = this.AllPaginator;
    this.inOutdataSource.paginator = this.inOutPaginator;
    this.inoutlist = [];

    if (this.ReportType === "InOut") {
      this.loader = true;
      this.countIn = 0;
      this.countOut = 0;
      this.generateInOutReport().then((results: any[]) => {
        if (results.length === 0) {
          this.loader = false;
          this.viewResults = false;
          const toast = this.Toast.create({
            message: 'No events were returned for this given criteria',
            duration: 3000,
            color: "warning",
            position: "bottom"
          }).then((toaster) => {
            toaster.present();
          })
        }
        this.loader = false;
        results.sort(function (a, b) {
          return new Date(a.f0_).getTime() - new Date(b.f0_).getTime()
        });
        results.forEach((item, pos) => {
          if (item.event_type === "GateExit") {
            this.countOut++;
          }
          if (item.event_type === "GateEnter") {
            this.countIn++;
          }
          let entrydate = new Date(item.f0_).getDate() + '/' + (new Date(item.f0_).getMonth() + 1) + '/' + new Date(item.f0_).getFullYear()
          let entryTime = new Date(item.f0_).toLocaleTimeString('en-GB');
          let exitdate;
          let minsOnSite;
          let exitTime;
          if (!item.f1_) {
            exitdate = "No Data"
            minsOnSite = "No Data"
            exitTime = "No Data"
          }
          else {
            exitdate = new Date(item.f1_).getDate() + '/' + (new Date(item.f1_).getMonth() + 1) + '/' + new Date(item.f1_).getFullYear()
            minsOnSite = Math.floor(((new Date(item.f1_).getTime() - new Date(item.f0_).getTime()) / 1000) / 60)
            exitTime = new Date(item.f1_).toLocaleTimeString('en-GB');
          }
          item.entrydate = entrydate;
          item.entryTime = entryTime;
          item.exitdate = exitdate;
          item.minsOnSite = minsOnSite;
          item.exitTime = exitTime;
          this.inoutlist.push(item);

          if (pos === results.length - 1) {
            this.inOutCollectionSize = this.inoutlist.length;
            this.viewResults = true;
            this.showPDFExport = true;
          }
        })
      })
    }
    else {
      this.loader = true;
      let tempList = [];
      let eventKeys = [];
      let selectedDevicesKeys = [];
      let selectedSiteUid
      const loading = this.loadingController.create({
        translucent: true,
        spinner: "dots",
      }).then(loader => {
        loader.present();
        //get UIDs for the selected site
        this.sites.forEach(element => {
          if (element.display_name === this.selectedSite) {
            selectedSiteUid = element.key;
          }
        })
        //get UIDs for selected devices
        this.setDevicesString.forEach((element) => {
          this.devices.forEach((dev) => {
            if (dev.display_name === element) {
              if (!selectedDevicesKeys.includes(dev.key)) {
                selectedDevicesKeys.push(dev.key);
              }
            }
          })
        })
        this.toDateTime.setHours(23);
        this.toDateTime.setMinutes(59);
        this.toDateTime.setSeconds(59);
        let timeDiff = Math.abs(this.toDateTime - this.fromDateTime)
        let dateDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        //loop through and get event keys for each date in the date range
        for (let i = 0; i < dateDiff; i++) {
          let tempDate = new Date(this.fromDateTime)
          let currentDate = tempDate.setDate(tempDate.getDate() + i);
          let currentDateYear = new Date(currentDate).getFullYear();
          let currentDateMonth = new Date(currentDate).getMonth() + 1;
          let currentDateDate = new Date(currentDate).getDate();
          //get all event keys for selected devices
          selectedDevicesKeys.forEach((key, pos) => {
            let ref = firebase
              .database()
              .ref('event_index/' + selectedSiteUid + '/' + key + '/' + currentDateYear + '/' + currentDateMonth + '/' + currentDateDate)
            ref.once('value', (Snapshot) => {
              Snapshot.forEach((el) => {
                let a = el.val();
                if (a.search_string) {
                  if (this.searchFilterTerm) {
                    if (a.search_string.toLowerCase().includes(this.searchFilterTerm.toLowerCase())) {
                      console.log(el.val())
                      let item = el.key;
                      eventKeys.push(item);
                    }
                  }
                  else {
                    let item = el.key;
                    eventKeys.push(item);
                  }

                }
                else {
                  let item = el.key;
                  eventKeys.push(item);
                }


              })
            }).then((data) => {

              //continue with the operation at the end of the forEach loop
              if (i === dateDiff - 1 && pos === selectedDevicesKeys.length - 1) {
                //if there are no events, tell the user
                if (eventKeys.length === 0) {
                  this.loader = false;
                  loader.dismiss();
                  this.datasource.data = [];
                  this.showExport = true;
                  const toast = this.Toast.create({
                    message: 'There are no events for the given search criteria',
                    duration: 6000,
                    color: "warning",
                    position: "bottom"
                  }).then((toaster) => {
                    toaster.present();
                  })
                }
                else {
                  //if there are events, get them from events node
                  //loop through and get event objects for each event key saved earlier
                  eventKeys.forEach((el) => {
                    let devRef = firebase
                      .database()
                      .ref('events/' + el)

                    devRef.once('value', (Snapshot) => {
                      let item = Snapshot.val();
                      item.key = Snapshot.key;
                      let unixTime = new Date(item.created_at);
                      item.created_at_time = unixTime.toLocaleString('en-GB');
                      tempList.push(item);
                    }).then((promise) => {
                      //tie results to MatDataTable, making use of RxJS Behavioural Subject
                      this.resultsDisplay = true;
                      tempList.sort(function(a, b){return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()});
                      this.eventsList.next(tempList);
                      this.datasource.data = this.eventsList.value;
                      this.datasource.paginator = this.AllPaginator;
                      this.showExport = true;
                      this.viewResults = true;
                      this.showPDFExport = true;
                      this.loader = false;
                      loader.dismiss();
                    })
                  })
                }
              }
            })
          })
        }
      })
    }

  }

  dataStudio(selectedSiteUid, selectedDevicesKeys) {
    let allparams = {
      site: selectedSiteUid,
      start: this.fromDateTime.getTime(),
      end: this.toDateTime.getTime(),
      devices: selectedDevicesKeys,
    }
    let link = 'https://cronreporting-dot-boomin-3f5a2.appspot.com/query/' + JSON.stringify(allparams);
    return this.HttpClient.get(link)
      .pipe(
        tap( // Log the result or error
          data => console.log("success: " + data),
          error => console.log("error: " + error)
        ));
  }

  generateInOutReport() {
    return new Promise((resolve, reject) => {
      let selectedSiteUid;
      let selectedDevicesKeys = [];
      this.sites.forEach(element => {
        if (element.display_name === this.selectedSite) {
          selectedSiteUid = element.key;
        }
      })
      this.setDevicesString.forEach((element) => {
        this.devices.forEach((dev) => {
          if (dev.display_name === element) {
            if (!selectedDevicesKeys.includes(dev.key)) {
              selectedDevicesKeys.push(dev.key);
            }
          }
        })
      })
      this.toDateTime.setHours(23);
      this.toDateTime.setMinutes(59);
      this.toDateTime.setSeconds(59);
      this.fromDateTime.setHours(0);
      this.fromDateTime.setMinutes(0);
      this.fromDateTime.setSeconds(0);

      this.dataStudio(selectedSiteUid, selectedDevicesKeys).subscribe((data) => {
        return resolve(data);
      })
    })


  }

  ageCalc(date, month, year) {
    let newMonth = month + 1;
    let newDate = new Date("" + newMonth + "/" + date + "/" + year + "");
    let today = new Date();
    let days = Math.floor((today.getTime() - newDate.getTime()) / (1000 * 60 * 60 * 24))
    return Math.floor(days / 365);
  }

  changeSiteDevices() {
    this.devices = [];
    let tempSiteUid;
    this.sites.forEach((element) => {
      if (element.display_name == this.selectedSite) {
        tempSiteUid = element.key;
      }
    })
    let ref = firebase
      .database()
      .ref('devices')
      .orderByChild('/site_summary/uid')
      .equalTo(tempSiteUid);
    ref.once('value', (Snapshot) => {
      Snapshot.forEach((child) => {
        let item = child.val();
        item.key = child.key;
        this.setDevicesString.push(item.display_name);
        this.devices.push(item);
      })
    })
  }

  splitView() {
    this.splitter.setSplit();
  }

  hideShow() {
    if (this.display) {

      this.icon = "arrow-round-down"
      this.display = !this.display;
    }
    else {

      this.icon = "arrow-round-up"
      this.display = !this.display;
    }
  }


  eventDetail(myRowData) {
    this.bottomSheet.open(EventDetailPage, {
      data: myRowData,
    });
  }

  //convert workbook into usable format for 'saveAs' plugin
  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i = 0; i <= s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  masterExport() {

  }

  getPDF(dataSource): Observable<any> {
    let pdfAPI = "http://pdf.codecronie.net/api/ConvertHTMLToPDF";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.HttpClient.post(pdfAPI, dataSource, httpOptions)
      .pipe(
        tap( // Log the result or error
          data => console.log("success: " + data),
          error => console.log("error: " + error)
        ));
  }

  getInOut(incomingHTML) {
    let pdfAPI = "https://cronreporting-dot-boomin-3f5a2.appspot.com/inout";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    let obj = {
      html: incomingHTML
    }

    return this.HttpClient.post(pdfAPI, JSON.stringify(obj), httpOptions)
      .pipe(
        tap( // Log the result or error
          data => console.log("success: " + data),
          error => console.log("error: " + error)
        ));
  }

  exportPDF() {
    if (this.ReportType === 'InOut') {
      const loading = this.loadingController.create({
        translucent: true,
        spinner: "dots",
      }).then(loader => {
        loader.present();
        let masterString = "";
        let htmlString = "";
        this.inoutlist.forEach((result, pos) => {
          let options = {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          };

          let VehicleDetailsSplit = result.VehicleDetails.split("/")
          result.VehicleDetailsSplit = VehicleDetailsSplit

          if (result.DriverDetails) {
            let DriverDetailsSplit = result.DriverDetails.split("\n")
            result.DriverDetailsSplit = DriverDetailsSplit
          }
          //if there is no exit driver name
          if (!result.exit_driver_name) {
            result.exit_driver_name = "No Driver Data"
            result.exit_driver_id_no = ""
          }
          //if there are no driver details
          if (!result.DriverDetails) {
            result.DriverDetails = "No Driver Data"
          }
          //if there is no exit driver card url, replace with placeholder image
          if (!result.exit_driver_card_photo_url) {
            result.exit_driver_card_photo_url = "https://via.placeholder.com/150"
          }

          //if there is a driver card url, replace with placeholder image
          if (!result.driver_card_photo_url) {
            result.driver_card_photo_url = "https://via.placeholder.com/150"
          }

          if (result.DriverDetails === "No Driver Data") {
            masterString = masterString.concat(`<tr>
            <td rowspan="2" style="vertical-align: top; text-align: left">
                Name: <strong>` + result.site_name + `</strong><br><br>
                Device Name: <strong>` + result.device_name + `</strong>
            </td>
            <td style="vertical-align: top; text-align: left">
                Entry
            </td>
            <td style="vertical-align: top; text-align: left">
            ` + result.entrydate + `
            </td>
            <td style="vertical-align: top; text-align: left">
            ` + result.entryTime + `
            </td>
            <td rowspan="2" style="vertical-align: top; text-align: left">
            ` + result.minsOnSite + `
            </td>
            
            <td rowspan="2" style="vertical-align: top; text-align: left">
            ` + result.VehicleDetailsSplit[0] + `
            <br>
            ` + result.VehicleDetailsSplit[1] + `
            <br>
            ` + result.VehicleDetailsSplit[2] + `
            </td>
            
            <td style="vertical-align: top; text-align: left">
            ` + result.DriverDetails + `
            </td>
            <td>
            <img src=`+ result.driver_card_photo_url + ` style="width: 80px">
            </td>
            </tr>
            <tr>
            
            <td style="vertical-align: top; text-align: left">
                Exit
            </td>
            <td style="vertical-align: top; text-align: left">
            ` + result.exitdate + `
            </td>
            <td style="vertical-align: top; text-align: left">
                ` + result.exitTime + `
            </td>
                                
            <td style="vertical-align: top; text-align: left">
            ` + result.exit_driver_name + `<br>
            ` + result.exit_driver_id_no + `
            </td>
            <td>
            <img src=`+ result.exit_driver_card_photo_url + ` style="width: 80px">
            </td>
            </tr>`)
          }
          else {
            masterString = masterString.concat(`<tr>
            <td rowspan="2" style="vertical-align: top; text-align: left">
                Name: <strong>` + result.site_name + `</strong><br><br>
                Device Name: <strong>` + result.device_name + `</strong>
            </td>
            <td style="vertical-align: top; text-align: left">
                Entry
            </td>
            <td style="vertical-align: top; text-align: left">
            ` + result.entrydate + `
            </td>
            <td style="vertical-align: top; text-align: left">
            ` + result.entryTime + `
            </td>
            <td rowspan="2" style="vertical-align: top; text-align: left">
            ` + result.minsOnSite + `
            </td>
            
            <td rowspan="2" style="vertical-align: top; text-align: left">
            ` + result.VehicleDetailsSplit[0] + `
            <br>
            ` + result.VehicleDetailsSplit[1] + `
            <br>
            ` + result.VehicleDetailsSplit[2] + `
            </td>
            
            <td style="vertical-align: top; text-align: left">
            ` + result.DriverDetailsSplit[0] + `
            <br>
            ` + result.DriverDetailsSplit[1] + `
            <br>
            ` + result.DriverDetailsSplit[2] + `
            </td>
            <td>
            <img src=`+ result.driver_card_photo_url + ` style="width: 80px">
            </td>
            </tr>
            <tr>
            
            <td style="vertical-align: top; text-align: left">
                Exit
            </td>
            <td style="vertical-align: top; text-align: left">
            ` + result.exitdate + `
            </td>
            <td style="vertical-align: top; text-align: left">
                ` + result.exitTime + `
            </td>
                                
            <td style="vertical-align: top; text-align: left">
            ` + result.exit_driver_name + `<br>
            ` + result.exit_driver_id_no + `
            </td>
            <td>
            <img src=`+ result.exit_driver_card_photo_url + ` style="width: 80px">
            </td>
            </tr>`)
          }


          /* if(result.driver_card_photo_url){
            masterString = masterString.concat(`
            <tr valign="top">
            <td style="font-family: OpenSans-Regular">` + result.site_name + `</td>
            <td style="font-family: OpenSans-Regular">` + result.device_name + `</td>
            <td style="font-family: OpenSans-Regular">` + result.entrydate + `</td>
            <td style="font-family: OpenSans-Regular">` + result.entryTime +`</td>
            <td style="font-family: OpenSans-Regular">` + result.exitdate + `</td>
            <td style="font-family: OpenSans-Regular">` + result.exitTime+ `</td>
            <td style="font-family: OpenSans-Regular">` + result.minsOnSite + `</td>
            <td style="font-family: OpenSans-Regular">` + result.VehicleDetails +`</td>
            <td style="font-family: OpenSans-Regular">` + result.DriverDetails +`</td>
            <td><img src=` + result.driver_card_photo_url + ` style="width: 80px"></td>
            </tr>`)
  
          }
          else{
            masterString = masterString.concat(`
            <tr valign="top">
            <td style="font-family: OpenSans-Regular">` + result.site_name + `</td>
            <td style="font-family: OpenSans-Regular">` + result.device_name + `</td>
            <td style="font-family: OpenSans-Regular">` + result.entrydate + `</td>
            <td style="font-family: OpenSans-Regular">` + result.entryTime +`</td>
            <td style="font-family: OpenSans-Regular">` + result.exitdate + `</td>
            <td style="font-family: OpenSans-Regular">` + result.exitTime+ `</td>
            <td style="font-family: OpenSans-Regular">` + result.minsOnSite + `</td>
            <td style="font-family: OpenSans-Regular">` + result.VehicleDetails +`</td>
            <td style="font-family: OpenSans-Regular">` + result.DriverDetails +`</td>
            <td><img src='https://via.placeholder.com/150' style="width: 80px"></td>
            </tr>`)
  
          } */

          if (pos === this.inoutlist.length - 1) {
            htmlString = `<html>
            <head>
              <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/metro/4.1.5/css/metro.min.css">
              <script src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.min.js'></script>
    
              <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    
    
            <style>
            @font-face {
              font-family: 'OpenSans-Regular';
              font-style: normal;
              font-weight: 400;
              font-display: swap;
              src: local('Open Sans Regular'), local('OpenSans-Regular'), url(https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0b.woff2) format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            </style>
    
            </head>
            <body>
                    <div style="margin:20px">
                            <div class="row">
                              <div class="col-9">
                                <h1>` + this.selectedSite + ` Report</h1>
                                <h4>Date Range: ` + new Date(this.fromDateTime).toLocaleDateString('en-GB', options) + ` - ` + new Date(this.toDateTime).toLocaleDateString('en-GB', options) + `</h4>
                              </div>
                              <div class="col-3" style="text-align: right;">
                                <img src="{#asset JustInByAmatec.png @encoding=dataURI}" style="width: 100px;">
                              </div>
                            </div>
                          </div>
                          
            
                        <div style="margin: 20px">
                                <table class='table striped'>
                                        <thead>
                                            <tr>
                                            <th>Site Details</th>
                                            <th>Event Type</th>
                                            <th>Event Date</th>
                                            <th>Event Time</th>
                                            <th>Minutes On Site</th>
                                            <th>Vehicle Details</th>
                                            <th>Driver Details</th>
                                            <th>Driver Photo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ` + masterString + `
                                        </tbody>
                                    </table>
                        </div>
            <script>
            var ctx = document.getElementById('myChart').getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['In', 'Out'],
                    datasets: [{
                        label: 'In Out Report',
                        data: [` + this.countIn + `, ` + this.countOut + `],
                        backgroundColor: [
                            'rgba(252,147,65,0.5)',
                            'rgba(151,249,190,0.5)'
                        ],
                        borderColor: [
                            'rgba(252,147,65,0.5)',
                            'rgba(151,249,190,0.5)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                  legend: { display: false },
                  title: {
                    display: true,
                    text: 'In Out Report for Site ` + this.selectedSite + `'
                  },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
            </script>
            </body>
          </html>`;
            this.toast.create({
              message: 'Please wait a moment as the PDF is generated.'
            }).then((toaster) => {
              toaster.present();
              this.getInOut(htmlString).subscribe((data: any) => {
                toaster.dismiss();
                let today = new Date();
                let date = today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate()
                let name = "Just_In_" + date + "_" + this.selectedSite + "_IN_OUT_Report.pdf";
                this.convertBaseb64ToBlob(data.base64, 'data:application/pdf;base64', name)
                loader.dismiss();
              })
            })

          }
        })

      })
    }
    if (this.ReportType === 'AllEvents') {
      const loading = this.loadingController.create({
        translucent: true,
        spinner: "dots",
      }).then(loader => {
        loader.present();
        let ws_data = [['Date', 'Site', 'Device Name', 'Event', 'Result', 'ID Card', 'ID Number',
          'Nationality', 'Driver Card', 'Gender', 'ID Number', 'ID Type', 'Initials', 'LastName', 'SADC Country',
          'Vehicle Disk', 'Date of Expiry', 'Engine Number', 'License Disk Number', 'License Number', 'Make', 'Model',
          'Color', "VIN", "Image", "Age"]]
        this.eventsList.value.forEach(element => {
          //check and ammend fields
          let datalist = [];
          if (element.created_at_time) {
            datalist.push(element.created_at_time)
          }
          else {
            datalist.push("N/A")
          }
          if (element.site) {
            datalist.push(element.site.display_name)
          }
          else {
            datalist.push("N/A")
          }
          if (element.device) {
            datalist.push(element.device.display_name)
          }
          else {
            datalist.push("N/A")
          }
          if (element.event_type) {
            datalist.push(element.event_type)
          }
          else {
            datalist.push("N/A")
          }
          if (element.policy_result) {
            datalist.push(element.policy_result)
          }
          else {
            datalist.push("N/A")
          }
          if (element.evidence_items) {
            if (element.evidence_items.id_card) {
              datalist.push("True");
              datalist.push(element.evidence_items.id_card.id_number);
              datalist.push(element.evidence_items.id_card.nationality);
            }
            else {
              datalist.push("N/A");
              datalist.push("N/A");
              datalist.push("N/A");
            }
          }
          else {
            datalist.push("N/A");
            datalist.push("N/A");
            datalist.push("N/A");
          }

          if (element.evidence_items) {
            if (element.evidence_items.driver_card) {
              datalist.push("True");
              datalist.push(element.evidence_items.driver_card.gender);
              datalist.push(element.evidence_items.driver_card.id_no);
              datalist.push(element.evidence_items.driver_card.id_type);
              datalist.push(element.evidence_items.driver_card.initials);
              datalist.push(element.evidence_items.driver_card.lastname);
              datalist.push(element.evidence_items.driver_card.sadc_country);
            }
            else {
              datalist.push("N/A");
              datalist.push("N/A");
              datalist.push("N/A");
              datalist.push("N/A");
              datalist.push("N/A");
              datalist.push("N/A");
              datalist.push("N/A");
            }
          }
          else {
            datalist.push("N/A");
            datalist.push("N/A");
            datalist.push("N/A");
            datalist.push("N/A");
            datalist.push("N/A")
            datalist.push("N/A");
          }

          if (element.evidence_items) {
            if (element.evidence_items.vehicle_disk) {
              datalist.push("True");
              datalist.push(element.evidence_items.vehicle_disk.date_of_expiry);
              datalist.push(element.evidence_items.vehicle_disk.engine_no);
              datalist.push(element.evidence_items.vehicle_disk.licence_disk_no);
              datalist.push(element.evidence_items.vehicle_disk.licence_no);
              datalist.push(element.evidence_items.vehicle_disk.make);
              datalist.push(element.evidence_items.vehicle_disk.model);
              datalist.push(element.evidence_items.vehicle_disk.colour);
              datalist.push(element.evidence_items.vehicle_disk.vin);
            }
            else {
              datalist.push("N/A");
              datalist.push("N/A");
              datalist.push("N/A");
              datalist.push("N/A");
              datalist.push("N/A");
              datalist.push("N/A");
              datalist.push("N/A");
              datalist.push("N/A");
              datalist.push("N/A");
            }
          }
          else {
            datalist.push("N/A");
            datalist.push("N/A");
            datalist.push("N/A");
            datalist.push("N/A");
            datalist.push("N/A");
            datalist.push("N/A");
            datalist.push("N/A");
            datalist.push("N/A");
          }
          if (element.evidence_items) {
            if (element.evidence_items.driver_card_photo) {
              datalist.push("<img src='" + element.evidence_items.driver_card_photo.payload + "'>")
            }
            else {
              datalist.push("<img src='https://via.placeholder.com/150'>");
            }
          }
          else {
            datalist.push("<img src='https://via.placeholder.com/150'>");
          }
          if (element.evidence_items) {
            if (element.evidence_items.driver_card) {
              if (element.evidence_items.driver_card.birth_date) {
                let newMonth = element.evidence_items.driver_card.birth_date.month + 1;
                let newDate = new Date("" + newMonth + "/" + element.evidence_items.driver_card.birth_date.date + "/" + element.evidence_items.driver_card.birth_date.year + "");
                let today = new Date();
                let days = Math.floor((today.getTime() - newDate.getTime()) / (1000 * 60 * 60 * 24))
                datalist.push(Math.floor(days / 365))
              }
              else {
                datalist.push(0)
              }

            }
            else {
              datalist.push("No Age Data")
            }
          }
          else {
            datalist.push("No Age Data")
          }
          //push array to Array of Arrays (list of data for each sheet)
          ws_data.push(datalist);
        })
        //create sheet and assign relevant device data to sheet\
        let masterString = new StringBuilder();
        for (let i = 1; i < ws_data.length - 1; i++) {
          let rowString = `<tr>
              <td>
                  <strong>Date: </strong>`+ ws_data[i][0] + `
              </td>
              <td>
                      <strong>Name: </strong>`+ ws_data[i][13] + `<br>
                      <strong>Initials: </strong>`+ ws_data[i][12] + `<br>
                      <strong>Gender: </strong>`+ ws_data[i][9] + `<br>
                      <strong>Age: </strong>`+ ws_data[i][25] + `<br>
    
              </td>
              <td>                
                  <strong>ID Number: </strong>`+ ws_data[i][10] + `<br>
                  <strong>Type: </strong>`+ ws_data[i][11] + `<br>
                  <strong>SADC Country: </strong>`+ ws_data[i][14] + `<br>
                  <strong>Nationality: </strong>`+ ws_data[i][7] + `<br>
              </td>
              <td>
                  <!--Image url here-->
                  `+ ws_data[i][24] + `
              </td>
              <td>
                  <strong>Site: </strong>`+ ws_data[i][1] + `<br>
                  <strong>Device Name: </strong>`+ ws_data[i][2] + `<br>
              </td>
              <td>
                  <strong>Event: </strong>`+ ws_data[i][3] + `<br>
                  <strong>Result: </strong>`+ ws_data[i][4] + `<br>
              </td>
              <td>
                  <strong>Vehicle Disc: </strong>`+ ws_data[i][15] + `<br>
                  <strong>Disc Expiry Date: </strong>`+ ws_data[i][16] + `<br>
                  <strong>Engine #: </strong>`+ ws_data[i][17] + `<br>
                  <strong>License Disk #: </strong>`+ ws_data[i][18] + `<br>
                  <strong>License #: </strong>`+ ws_data[i][19] + `<br>
                  <strong>Vehicle Make: </strong>`+ ws_data[i][20] + `<br>
                  <strong>Vehicle Model: </strong>`+ ws_data[i][21] + `<br>
                  <strong>Color: </strong>`+ ws_data[i][22] + `<br>
                  <strong>VIN #: </strong>`+ ws_data[i][23] + `<br>
              </td>
          </tr>`
          masterString.Append(rowString);
        }
        let html = `
          <table style="width:100%" class="just-in-pdf-table">
            <tr>
              <th>Date</th>
              <th>Personal Details</th>
              <th>Identification</th>
              <th>Picture</th>
              <th>Site Details</th>
              <th>Event Details</th>
              <th>Vehicle Details</th>
            </tr>
            `+ masterString.ToString() + `
          </table>`
        let obj;
        let options = { year: 'numeric', month: 'short', day: '2-digit' }
        let reportDater = new Date().toLocaleDateString('en-GB', options)
        if (this.searchFilterTerm) {
          obj = {
            fromDateTime: this.fromDateTime.toLocaleString('en-GB'),
            toDateTime: this.toDateTime.toLocaleString('en-GB'),
            reportName: "" + this.selectedSite.toString() + " Report " + reportDater,
            devices: this.setDevicesString,
            siteName: this.selectedSite.toString(),
            filters: this.searchFilterTerm,
            payLoad: html
          }
        }
        else {
          obj = {
            fromDateTime: this.fromDateTime.toLocaleString('en-GB'),
            toDateTime: this.toDateTime.toLocaleString('en-GB'),
            reportName: "" + this.selectedSite.toString() + " Report " + reportDater,
            devices: this.setDevicesString,
            siteName: this.selectedSite.toString(),
            filters: "No Filters",
            payLoad: html
          }
        }
        this.toast.create({
          message: 'Please wait a moment as the PDF is generated.'
        }).then((toaster) => {
          toaster.present();
          this.getPDF(JSON.stringify(obj)).subscribe((data) => {
            if (data) {
              toaster.dismiss();
              loader.dismiss();
              let today = new Date();
              let date = today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate()
              let name = "Just_In_" + date + "_" + this.selectedSite + "_All_Events_Report.pdf";
              this.convertBaseb64ToBlob(data, 'data:application/pdf;base64', name)
            }
          })
        })

      })
    }


  }

  exportXLSX() {
    let workBook = xlsx.utils.book_new();
    workBook.Props = {
      Title: "JustIn Report",
      Subject: "Report",
      Author: "Amatec",
      CreatedDate: new Date(),
    };
    //workbook uses an array of arrays
    let ws_data = [['Date', 'Site', 'Device Name', 'Event', 'Result', 'ID Card', 'ID Number',
      'Nationality', 'Driver Card', 'Gender', 'ID Number', 'ID Type', 'Initials', 'LastName', 'SADC Country',
      'Vehicle Disk', 'Date of Expiry', 'Engine Number', 'License Disk Number', 'License Number', 'Make', 'Model',
      'Vehicle Reg', "VIN"]]
    this.eventsList.value.forEach(element => {
      //check and ammend fields
      let datalist = [];
      if (element.created_at_time) {
        datalist.push(element.created_at_time)
      }
      else {
        datalist.push("N/A")
      }
      if (element.site) {
        datalist.push(element.site.display_name)
      }
      else {
        datalist.push("N/A")
      }
      if (element.device) {
        datalist.push(element.device.display_name)
      }
      else {
        datalist.push("N/A")
      }
      if (element.event_type) {
        datalist.push(element.event_type)
      }
      else {
        datalist.push("N/A")
      }
      if (element.policy_result) {
        datalist.push(element.policy_result)
      }
      else {
        datalist.push("N/A")
      }
      if (element.evidence_items) {
        if (element.evidence_items.id_card) {
          datalist.push("True");
          datalist.push(element.evidence_items.id_card.id_number);
          datalist.push(element.evidence_items.id_card.nationality);
        }
        else {
          datalist.push("N/A");
          datalist.push("N/A");
          datalist.push("N/A");
        }
      }
      else {
        datalist.push("N/A");
        datalist.push("N/A");
        datalist.push("N/A");
      }

      if (element.evidence_items) {
        if (element.evidence_items.driver_card) {
          datalist.push("True");
          datalist.push(element.evidence_items.driver_card.gender);
          datalist.push(element.evidence_items.driver_card.id_no);
          datalist.push(element.evidence_items.driver_card.id_type);
          datalist.push(element.evidence_items.driver_card.initials);
          datalist.push(element.evidence_items.driver_card.lastname);
          datalist.push(element.evidence_items.driver_card.sadc_country);
        }
        else {
          datalist.push("N/A");
          datalist.push("N/A");
          datalist.push("N/A");
          datalist.push("N/A");
          datalist.push("N/A");
          datalist.push("N/A");
          datalist.push("N/A");
        }
      }
      else {
        datalist.push("N/A");
        datalist.push("N/A");
        datalist.push("N/A");
        datalist.push("N/A");
        datalist.push("N/A")
        datalist.push("N/A");
      }

      if (element.evidence_items) {
        if (element.evidence_items.vehicle_disk) {
          datalist.push("True");
          datalist.push(element.evidence_items.vehicle_disk.date_of_expiry);
          datalist.push(element.evidence_items.vehicle_disk.engine_no);
          datalist.push(element.evidence_items.vehicle_disk.licence_disk_no);
          datalist.push(element.evidence_items.vehicle_disk.licence_no);
          datalist.push(element.evidence_items.vehicle_disk.make);
          datalist.push(element.evidence_items.vehicle_disk.model);
          datalist.push(element.evidence_items.vehicle_disk.vehicle_reg);
          datalist.push(element.evidence_items.vehicle_disk.vin);
        }
        else {
          datalist.push("N/A");
          datalist.push("N/A");
          datalist.push("N/A");
          datalist.push("N/A");
          datalist.push("N/A");
          datalist.push("N/A");
          datalist.push("N/A");
          datalist.push("N/A");
          datalist.push("N/A");
        }
      }
      else {
        datalist.push("N/A");
        datalist.push("N/A");
        datalist.push("N/A");
        datalist.push("N/A");
        datalist.push("N/A")
        datalist.push("N/A");
        datalist.push("N/A");
        datalist.push("N/A");
      }
      //push array to Array of Arrays (list of data for each sheet)
      ws_data.push(datalist);
    })
    //create sheet and assign relevant device data to sheet\
    console.log(ws_data)
    let sheet = xlsx.utils.aoa_to_sheet(ws_data)
    console.log(sheet);

    xlsx.utils.book_append_sheet(workBook, sheet, this.selectedSite);
    let book = xlsx.write(workBook, { bookType: 'xlsx', type: 'binary' })

    //convert to usable format
    let formattedWB = this.s2ab(book)
    let today = new Date();
    let date = today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate()
    let nameString = "Just In " + date + " Report.xlsx";
    saveAs.saveAs(new Blob([formattedWB], { type: "application/octet-stream" }), nameString);
  }

  convertBaseb64ToBlob(b64Data, contentType, namestring): Blob {
    contentType = contentType || '';
    const sliceSize = 512;
    b64Data = b64Data.replace(/^[^,]+,/, '');
    b64Data = b64Data.replace(/\s/g, '');
    const byteCharacters = window.atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    saveAs.saveAs(new Blob(byteArrays, { type: 'application/pdf' }), namestring)
    return new Blob(byteArrays, { type: 'application/pdf' });
  }

}
