import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {AuthGuard} from './guard/auth.guard'

// define all routes used in the application and assign them to the correct / relevant guard for access control
const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'list',
    loadChildren: './list/list.module#ListPageModule'
  },
  { path: 'sites', loadChildren: './pages/sites/sites.module#SitesPageModule', canActivate: [AuthGuard]},
  { path: 'devices', loadChildren: './pages/devices/devices.module#DevicesPageModule' , canActivate: [AuthGuard]},
  { path: 'policies', loadChildren: './pages/policies/policies.module#PoliciesPageModule' , canActivate: [AuthGuard]},
  { path: 'lists', loadChildren: './pages/lists/lists.module#ListsPageModule' , canActivate: [AuthGuard]},
  { path: 'reporting', loadChildren: './pages/reporting/reporting.module#ReportingPageModule' , canActivate: [AuthGuard]},
  { path: 'add-site', loadChildren: './modals/add-site/add-site.module#AddSitePageModule' , canActivate: [AuthGuard]},
  { path: 'add-policy', loadChildren: './modals/add-policy/add-policy.module#AddPolicyPageModule', canActivate: [AuthGuard]},
  { path: 'add-list', loadChildren: './modals/add-list/add-list.module#AddListPageModule', canActivate: [AuthGuard]},
  { path: 'site-pop', loadChildren: './popovers/site-pop/site-pop.module#SitePopPageModule', canActivate: [AuthGuard] },
  { path: 'edit-site', loadChildren: './modals/edit-site/edit-site.module#EditSitePageModule', canActivate: [AuthGuard] },
  { path: 'edit-device/:passedObject', loadChildren: './ForwardPages/edit-device/edit-device.module#EditDevicePageModule', canActivate: [AuthGuard]},
  { path: 'edit-list/:passedObject', loadChildren: './ForwardPages/edit-list/edit-list.module#EditListPageModule', canActivate: [AuthGuard] },
  { path: 'edit-policy', loadChildren: './ForwardPages/edit-policy/edit-policy.module#EditPolicyPageModule', canActivate: [AuthGuard] },
  { path: 'event-detail', loadChildren: './bottomSheets/event-detail/event-detail.module#EventDetailPageModule', canActivate: [AuthGuard]},
  { path: 'registration', loadChildren: './pages/registration/registration.module#RegistrationPageModule', canActivate: [AuthGuard] },
  { path: 'assign-device', loadChildren: './bottomSheets/assign-device/assign-device.module#AssignDevicePageModule', canActivate: [AuthGuard] },
  { path: 'sign-up', loadChildren: './popupmodals/sign-up/sign-up.module#SignUpPageModule' },
  { path: 'sign-in', loadChildren: './popupmodals/sign-in/sign-in.module#SignInPageModule' },
  { path: 'reporting-schedules', loadChildren: './pages/reporting-schedules/reporting-schedules.module#ReportingSchedulesPageModule', canActivate: [AuthGuard] },
  { path: 'schedules-pop', loadChildren: './popovers/schedules-pop/schedules-pop.module#SchedulesPopPageModule' },
  { path: 'edit-schedule', loadChildren: './modals/edit-schedule/edit-schedule.module#EditSchedulePageModule' },
  { path: 'add-schedules', loadChildren: './modals/add-schedules/add-schedules.module#AddSchedulesPageModule' },
  { path: 'report-viewer', loadChildren: './modals/report-viewer/report-viewer.module#ReportViewerPageModule' },
  { path: 'test-page', loadChildren: './test/test-page/test-page.module#TestPagePageModule' },
  { path: 'in-app-report-params', loadChildren: './pages/in-app-report-params/in-app-report-params.module#InAppReportParamsPageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, useHash : true})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
