import { Component, Inject} from "@angular/core";
import { LoginService } from "../login/login.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html"
})
export class HeaderComponent {
  constructor(@Inject("LoggedInMemberService") private loggedInMemberService,
              private loginService: LoginService) {
  }

  memberLoginStatus() {
    if (this.loginService.memberLoggedIn()) {
      const loggedInMember = this.loginService.loggedInMember();
      return "Logout " + loggedInMember.firstName + " " + loggedInMember.lastName;
    } else {
      return "Login to EWKG Site";
    }
  }

  loginOrLogoutUrl() {
    return this.loginService.memberLoggedIn() ? "/#logout" : "/#login";
  }

  allowEdits() {
    return this.loggedInMemberService.allowContentEdits();
  }

  forgotPasswordUrl() {
    return "/#forgot-password";
  }

  memberLoggedIn() {
    return this.loginService.memberLoggedIn();
  }
}
