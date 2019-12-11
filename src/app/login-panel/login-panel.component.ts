import { Component, Inject } from "@angular/core";
import { MemberLoginService } from "../services/member-login.service";

@Component({
  selector: "app-login-panel",
  templateUrl: "./login-panel.component.html",
  styleUrls: ["./login-panel.component.sass"]
})
export class LoginPanelComponent {
  constructor(private memberLoginService: MemberLoginService) {
  }

  memberLoginStatus() {
    if (this.memberLoginService.memberLoggedIn()) {
      const loggedInMember = this.memberLoginService.loggedInMember();
      return "Logout " + loggedInMember.firstName + " " + loggedInMember.lastName;
    } else {
      return "Login to EWKG Site";
    }
  }

  loginOrLogoutUrl() {
    return this.memberLoginService.memberLoggedIn() ? "/logout" : "/login";
  }

  allowEdits() {
    return this.memberLoginService.allowContentEdits();
  }

  forgotPasswordUrl() {
    return "/forgot-password";
  }

  memberLoggedIn() {
    return this.memberLoginService.memberLoggedIn();
  }
}
