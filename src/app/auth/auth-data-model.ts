/***********************************
; Title:  AuthData model
; Author: Kurt Leadley
; Date:   15 March 2020
; Description: Basic model for restricting user access based on user id
***************************************************************/

export interface AuthData {
  eId: string;
  email: string;
  password: string;
  isAdmin: string;
}
