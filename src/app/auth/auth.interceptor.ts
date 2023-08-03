/***********************************
; Title:  Auth Interceptor
; Author: Kurt Leadley
; Date:   15 March 2020
; Description: Gets Token out of HTTP header for auth checks
***************************************************************/
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';

@Injectable()

export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // get our token
    const authToken = this.authService.getToken();
    const authRequest = req.clone({
      // add auth token to http headers
      headers: req.headers.set('Authorization', "Bearer " + authToken)
    });
    return next.handle(authRequest);
  }
}
