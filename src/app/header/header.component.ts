import { Component } from "@angular/core";
import { NGXLogger } from "ngx-logger";
import { LoginService } from "../login/login.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html"
})
export class HeaderComponent {

  constructor(private loginService: LoginService, private logger: NGXLogger) {
  }

  memberLoginStatus() {
    // if (LoggedInMemberService.memberLoggedIn()) {
    if (false) {
      const loggedInMember = {
        firstName: "tbdfn",
        lastName: "tbdln"
      };
      // var loggedInMember = LoggedInMemberService.loggedInMember();
      // return "Logout " + loggedInMember.firstName + " " + loggedInMember.lastName;
      return "Logout " + loggedInMember.firstName + " " + loggedInMember.lastName;
    } else {
      return "Login to EWKG Site";
    }

  }

  loginOrLogoutUrl() {
    return this.loginService.memberLoggedIn() ? "/#logout" : "/#login";
  }

  allowEdits() {
    return false;
  }

  forgotPasswordUrl() {
    return "/#forgot-password";
  }

  memberLoggedIn() {
    return false;
  }
}
