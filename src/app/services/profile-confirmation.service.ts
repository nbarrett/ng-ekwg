import { Injectable } from "@angular/core";
import { FullNamePipe } from "../pipes/full-name.pipe";
import { DateUtilsService } from "./date-utils.service";
import { MemberLoginService } from "./member/member-login.service";

@Injectable({
  providedIn: "root"
})
export class ProfileConfirmationService {

  constructor(private memberLoginService: MemberLoginService,
              private dateUtils: DateUtilsService,
              private fullName: FullNamePipe) {
  }

  confirmProfile(member) {
    if (member) {
      member.profileSettingsConfirmed = true;
      member.profileSettingsConfirmedAt = this.dateUtils.nowAsValue();
      member.profileSettingsConfirmedBy = this.fullName.transform(this.memberLoginService.loggedInMember());
    }
  }

  unconfirmProfile(member) {
    if (member) {
      member.profileSettingsConfirmed = undefined;
      member.profileSettingsConfirmedAt = undefined;
      member.profileSettingsConfirmedBy = undefined;
    }
  }

  processMember(member) {
    if (member) {
      if (member.profileSettingsConfirmed) {
        this.confirmProfile(member);
      } else {
        this.unconfirmProfile(member);
      }
    }
  }
}
