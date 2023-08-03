import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AuthService } from '../auth.service';

@Component({
  templateUrl: './login.component.html'
})

export class LoginComponent {
  constructor(public AuthService: AuthService) {}

  onLogin(form: NgForm) {
    console.log(form.value);
    // denied
    if (form.invalid) {
      return;
    }
    // use auth service onLogin
    this.AuthService.login(form.value.eId, form.value.email, form.value.password, form.value.isAdmin);
  }
}
