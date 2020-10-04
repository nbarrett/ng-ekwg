import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { SocialEventsPermissions } from "../../../models/social-events.model";
import { Confirm } from "../../../models/ui-actions";
import { DateUtilsService } from "../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { SiteEditService } from "../../../site-edit/site-edit.service";

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
              private route: ActivatedRoute,
              private siteEditService: SiteEditService,
              private memberLoginService: MemberLoginService,
              protected dateUtils: DateUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SocialHomeComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.authService.authResponse().subscribe(() => this.applyAllows());
    this.siteEditService.events.subscribe(() => this.applyAllows());
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const socialEventId = paramMap.get("social-event-id");
      this.logger.debug("socialEventId from route params:", paramMap, socialEventId);
      if (socialEventId) {
        this.socialEventId = socialEventId;
      }
    });
    this.applyAllows();
  }

  applyAllows() {
    this.allow.detailView = this.memberLoginService.allowSocialDetailView();
    this.allow.summaryView = this.memberLoginService.allowSocialAdminEdits() || !this.memberLoginService.allowSocialDetailView();
    this.allow.edits = this.memberLoginService.allowSocialAdminEdits();
    this.allow.copy = this.memberLoginService.allowSocialAdminEdits();
    this.allow.contentEdits = this.siteEditService.active() && this.memberLoginService.allowContentEdits();
    this.logger.info("permissions:", this.allow);
  }

}
