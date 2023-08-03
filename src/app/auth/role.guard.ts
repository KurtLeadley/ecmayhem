/*
; Author: Kurt Leadley
; Date:   15 March 2020
; Description: anything with canActivate in routes gets the isAuth check
***************************************************************/
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from "./auth.service";

@Injectable()
// this class if for determining if an admin is logged in
export class RoleGuard implements CanActivate {

  constructor(private authService : AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {

    // get isAdmin string from the authService function getIsAdmin
    const isAdmin = this.authService.getIsAdmin();

    // turn string into a boolean with this test
    var isAdminBoolean = (isAdmin == 'true');

    // redirect if not admin
    if (!isAdminBoolean) {
      this.router.navigate(['/']);
    }
    // return boolean
    return isAdminBoolean;
  }
}
