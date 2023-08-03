/***********************************
; Title:  Auth Service
; Author: Kurt Leadley
; Date:   15 March 2020
; Description: Determines the token for the logged in user and what they can do
***************************************************************/
import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthData } from './auth-data-model';
import { environment } from '../../environments/environment';

// get our base url
const BACKEND_URL =  environment.apiUrl + "/users";

@Injectable({ providedIn: "root"})

export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private eId: string;
  private email : string;
  private isAdmin : string;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) {}
  // class methods for the AuthService
  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getEmployeeId() {
    return this.eId;
  }

  getEmployeeEmail() {
    return this.email;
  }
  getIsAdmin() {
    return this.isAdmin;
  }
  // create user http post
  createEmployee(eId: string, email:string, password: string, isAdmin: string) {
    const authData: AuthData = {eId: eId, email: email, password: password, isAdmin: isAdmin};
    this.http.post( BACKEND_URL + "/signup", authData)
      .subscribe(response => {
        console.log(response);
        this.router.navigate(['/login']);
      });
  }
  // login http post
  login(eId: string, email:string, password:string, isAdmin:string) {
    const authData: AuthData = {eId: eId, email: email, password: password, isAdmin: isAdmin};
    this.http.post<{token:string, expiresIn: number, eId: string, email: string, isAdmin: string}>(BACKEND_URL + "/login", authData)
      .subscribe( response => {
        const token = response.token;
        this.token = token;
        if (token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.eId = response.eId;
          this.email = response.email;
          this.isAdmin = response.isAdmin;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(token, expirationDate, this.eId, this.email, this.isAdmin);
          // navigate to homepage after a successful login
          this.router.navigate(['/']);
        }
        console.log(response);
      })
  }

  autoAuthEmployee() {
    const authInformation = this.getAuthData();

    if(!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    // is authenticated if there is still time left
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.eId = authInformation.eId;
      this.email = authInformation.email;
      this.isAdmin = authInformation.isAdmin;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }
  // clear our all the auth data on logout
  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.router.navigate(['/']);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.eId = null;
    this.email = null;
    this.isAdmin = null;
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    console.log("Setting Timer: " + duration);
    this.tokenTimer = setTimeout(()=> {
      this.logout();
    }, duration* 3000);
  }

  private saveAuthData(token:string, expirationDate:Date, eId: string, email:string, isAdmin:string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('eId', eId);
    localStorage.setItem('email', email);
    localStorage.setItem('isAdmin', isAdmin);
  }
  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('eId');
    localStorage.removeItem('email');
    localStorage.removeItem('isAdmin');
  }
  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const eId = localStorage.getItem('eId');
    const email = localStorage.getItem('email');
    const isAdmin = localStorage.getItem('isAdmin');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      eId: eId,
      email: email,
      isAdmin: isAdmin
    }
  }
}
