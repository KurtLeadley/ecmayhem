/***********************************
; Title:  Auth Guard
; Author: Kurt Leadley
; Date:   15 March 2020
; Description: anything with canActivate in routes gets the isAuth check
***************************************************************/
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService : AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    const isAuth = this.authService.getIsAuth();
    // navigate to login if not authenticated
    if (!isAuth) {
      this.router.navigate(['/login']);
    }
    return isAuth;
  }
}
