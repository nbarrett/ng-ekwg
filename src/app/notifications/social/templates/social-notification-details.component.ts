import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { CommitteeConfig, CommitteeMember } from "../../../models/committee.model";
import { Member, MemberFilterSelection } from "../../../models/member.model";
import { SocialEvent } from "../../../models/social-events.model";
import { SocialDisplayService } from "../../../pages/social/social-display.service";
import { CommitteeConfigService } from "../../../services/committee/commitee-config.service";
import { CommitteeReferenceData } from "../../../services/committee/committee-reference-data";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";

@Component({
  selector: "app-social-notification-details",
  templateUrl: "./social-notification-details.component.html"
})
export class SocialNotificationDetailsComponent implements OnInit {

  @Input()
  public members: Member[];
  @Input()
  public socialEvent: SocialEvent;

  protected logger: Logger;
  private committeeReferenceData: CommitteeReferenceData;
  private dataSub: Subscription;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private committeeConfig: CommitteeConfigService,
    public display: SocialDisplayService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SocialNotificationDetailsComponent, NgxLoggerLevel.OFF);
  }

  memberFilterSelections(): MemberFilterSelection[] {
    return this.members.map(member => this.display.toMemberFilterSelection(member));
  }

  ngOnInit() {
    this.dataSub = this.committeeConfig.events().subscribe(data => this.committeeReferenceData = data);
    this.logger.debug("ngOnInit:app-social-notification-details members:", this.members, "socialEvent:", this.socialEvent);
  }

  replyTo(): CommitteeMember {
    return this.display?.committeeMembersPlusOrganiser(this.socialEvent)?.find(member => this.socialEvent?.notification?.content?.replyTo?.value === member.memberId);
  }

  signoffAs(): CommitteeMember {
    return this.display?.committeeMembersPlusOrganiser(this.socialEvent)?.find(member => this.socialEvent?.notification?.content?.signoffAs?.value === member.memberId);
  }
}
