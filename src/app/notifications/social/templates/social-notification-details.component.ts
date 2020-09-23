import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { CommitteeMember } from "../../../models/committee.model";
import { Member, MemberFilterSelection } from "../../../models/member.model";
import { SocialEvent } from "../../../models/social-events.model";
import { SocialDisplayService } from "../../../pages/social/social-display.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";

@Component({
  selector: "app-social-notification-details",
  templateUrl: "./social-notification-details.component.html"
})
export class SocialNotificationDetailsComponent implements OnInit {

  @Input()
  public members: Member[];
  @Input()
  public committeeMembers: CommitteeMember[];
  @Input()
  public socialEvent: SocialEvent;

  protected logger: Logger;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    public display: SocialDisplayService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SocialNotificationDetailsComponent, NgxLoggerLevel.OFF);
  }

  memberFilterSelections(): MemberFilterSelection[] {
    return this.members.map(member => this.display.toMemberFilterSelection(member));
  }

  ngOnInit() {
    this.logger.debug("ngOnInit:socialEvent ->", this.socialEvent);
  }

  replyTo() {
    return this.committeeMembers.find(member => this.socialEvent?.notification?.content?.replyTo?.value === member.memberId);
  }

  signoffAs() {
    return this.committeeMembers.find(member => this.socialEvent?.notification?.content?.signoffAs?.value === member.memberId);
  }
}
