import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';


@Injectable({
  providedIn: 'root'
})
export class FirebaseGuardGuard implements CanActivate{

  constructor(public router:Router){}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged((result) => {
        console.log(result)
       if(result){
        return resolve(true);
       }
       else{
        this.router.navigateByUrl('log-in');
        return resolve(false);
       }
      })
    });
  }
}
