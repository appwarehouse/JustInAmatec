import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms'

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FirebaseServiceService } from './services/firebase-service.service';
import { environment } from '../environments/environment';
import * as firebase from 'firebase/app';
import { IonicStorageModule } from '@ionic/storage';
import { FilterListService } from './services/filter-list.service';
import { AddSitePageModule } from './modals/add-site/add-site.module';
import { AddPolicyPageModule } from './modals/add-policy/add-policy.module';
import { SitePopPageModule } from './popovers/site-pop/site-pop.module';
import { EditSitePageModule } from './modals/edit-site/edit-site.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule, MatOptionModule, MatSelectModule, MatFormFieldModule, MatNativeDateModule, MatChipsModule, MatTooltipModule, MatIconModule} from '@angular/material';
import { EventDetailPage } from './bottomSheets/event-detail/event-detail.page';
import { EventDetailPageModule } from './bottomSheets/event-detail/event-detail.module';
import { SplitterService } from './services/splitter.service';
import { AddListPageModule } from './modals/add-list/add-list.module';
import { DataBusService } from './services/data-bus.service';
import { AssignDevicePage } from './bottomSheets/assign-device/assign-device.page';
import { AssignDevicePageModule } from './bottomSheets/assign-device/assign-device.module';
import { MenuLinksService } from './services/menu-links.service';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { SignInPage } from './popupmodals/sign-in/sign-in.page';
import { SignUpPage } from './popupmodals/sign-up/sign-up.page';
import { SignInPageModule } from './popupmodals/sign-in/sign-in.module';
import { SignUpPageModule } from './popupmodals/sign-up/sign-up.module';
import { HttpClientModule } from '@angular/common/http';
import { SchedulePopPage } from './popovers/schedules-pop/schedules-pop.page';
import { EditSchedulePage } from './modals/edit-schedule/edit-schedule.page';
import { EditSchedulePageModule } from './modals/edit-schedule/edit-schedule.module';
import { SchedulesPopPageModule } from './popovers/schedules-pop/schedules-pop.module';
import { AddSchedulesPageModule } from './modals/add-schedules/add-schedules.module';
import { AddSchedulesPage } from './modals/add-schedules/add-schedules.page';
import { ReportViewerPage } from './modals/report-viewer/report-viewer.page';
import { ReportViewerPageModule } from './modals/report-viewer/report-viewer.module';


// Firebase is initailized in the app module file when the application is loaded.
firebase.initializeApp(environment.firebase);

@NgModule({
  declarations: [AppComponent],
  entryComponents: [ReportViewerPage,AddSchedulesPage,EditSchedulePage,SchedulePopPage,EventDetailPage, AssignDevicePage, SignInPage,SignUpPage],
  imports: [
    NgbModule,
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    AddSitePageModule,
    AddPolicyPageModule,
    HttpClientModule,
    SitePopPageModule,
    EditSitePageModule,
    BrowserAnimationsModule,
    MatButtonModule, 
    MatCheckboxModule,
    MatOptionModule,
    MatSelectModule,
    MatFormFieldModule,
    MatNativeDateModule,
    EventDetailPageModule,
    AddListPageModule,
    AddPolicyPageModule, 
    MatChipsModule, 
    AssignDevicePageModule,
    MatTooltipModule,
    MatIconModule,
    SignInPageModule,
    SignUpPageModule,
    ReactiveFormsModule,
    EditSchedulePageModule,
    SchedulesPopPageModule,
    AddSchedulesPageModule,
    ReportViewerPageModule
  ],
  //providers declared for all the services being used in the application
  providers: [
    StatusBar,
    SplashScreen,
    FirebaseServiceService,
    FilterListService,
    SplitterService,
    DataBusService,
    MenuLinksService,
    Dialogs,
    //hash routing strategy is used for servers that have not been configured to handle routing for single page applications
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
