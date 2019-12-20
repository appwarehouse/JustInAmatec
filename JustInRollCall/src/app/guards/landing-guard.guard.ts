import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';
import { InitialDataSaveService } from '../services/initial-data-save.service';


@Injectable({
  providedIn: 'root'
})

//Guard to ensure that when the app is restarted, if logged in the user goes directly into the app. Else go to login page
export class LandingGuardGuard implements CanActivate{
  constructor(public router:Router, public DataSave: InitialDataSaveService){}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged((result) => {
        if (result) {
          console.log(result);
          this.router.navigateByUrl('home');
          return resolve(false);
        } else {
          return resolve(true);
        }
      });
    });
  }
}
