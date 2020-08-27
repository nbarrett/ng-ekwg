import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { SocialEventsPermissions } from "../../../models/social-events.model";
import { Confirm } from "../../../models/ui-actions";
import { FullNameWithAliasPipe } from "../../../pipes/full-name-with-alias.pipe";
import { LineFeedsToBreaksPipe } from "../../../pipes/line-feeds-to-breaks.pipe";
import { BroadcastService } from "../../../services/broadcast-service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { SocialEventsService } from "../../../services/social-events/social-events.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { SiteEditService } from "../../../site-edit/site-edit.service";
import { SocialDisplayService } from "../social-display.service";

@Component({
  selector: "app-social-home",
  templateUrl: "./social-home.component.html",
  styleUrls: ["./social-home.component.sass"]
})
export class SocialHomeComponent implements OnInit {
  private logger: Logger;
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public allow: SocialEventsPermissions = {};
  public confirm = new Confirm();
  public socialEventId: string;

  constructor(private authService: AuthService,
              private notifierService: NotifierService,
              private stringUtils: StringUtilsService,
              private route: ActivatedRoute,
              private display: SocialDisplayService,
              private memberService: MemberService,
              private siteEditService: SiteEditService,
              private fullNameWithAlias: FullNameWithAliasPipe,
              private lineFeedsToBreaks: LineFeedsToBreaksPipe,
              private socialEventsService: SocialEventsService,
              private memberLoginService: MemberLoginService,
              private broadcastService: BroadcastService,
              private urlService: UrlService,
              protected dateUtils: DateUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SocialHomeComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit() {
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.authService.authResponse().subscribe(() => this.applyAllowEdits());
    this.siteEditService.events.subscribe(() => this.applyAllowEdits());
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const socialEventId = paramMap.get("social-event-id");
      this.logger.debug("socialEventId from route params:", paramMap, socialEventId);
      if (socialEventId) {
        this.socialEventId = socialEventId;
      }
    });
    this.applyAllowEdits();
  }

  applyAllowEdits() {
    this.allow.detailView = this.memberLoginService.allowSocialDetailView();
    this.allow.summaryView = this.memberLoginService.allowSocialAdminEdits() || !this.memberLoginService.allowSocialDetailView();
    this.allow.edits = this.memberLoginService.allowSocialAdminEdits();
    this.allow.copy = this.memberLoginService.allowSocialAdminEdits();
    this.allow.contentEdits = this.siteEditService.active() && this.memberLoginService.allowContentEdits();
    this.logger.info("permissions:", this.allow);
  }

}
