import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from "@angular/core";
import extend from "lodash-es/extend";
import { BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { CommitteeFile } from "../../../models/committee.model";
import { LoginResponse } from "../../../models/member.model";
import { Confirm } from "../../../models/ui-actions";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MailchimpLinkService } from "../../../services/mailchimp/mailchimp-link.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";
import { CommitteeDisplayService } from "../committee-display.service";
import { CommitteeNotificationSettingsModalComponent } from "../notification-settings/committee-notification-settings-modal.component";
import { CommitteeSendNotificationModalComponent } from "../send-notification/committee-send-notification-modal.component";

@Component({
  selector: "app-committee-general",
  templateUrl: "./committee-general.component.html",
  changeDetection: ChangeDetectionStrategy.Default
})
export class CommitteeGeneralComponent implements OnInit, OnDestroy {
  @Input()
  public confirm: Confirm;
  @Input()
  public notify: AlertInstance;

  private logger: Logger;
  private subscription: Subscription;
  public notifyTarget: AlertTarget = {};

  constructor(private memberLoginService: MemberLoginService,
              private mailchimpLinkService: MailchimpLinkService,
              public display: CommitteeDisplayService,
              private notifierService: NotifierService,
              private authService: AuthService,
              private modalService: BsModalService,
              private urlService: UrlService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeGeneralComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.subscription = this.authService.authResponse().subscribe((loginResponse: LoginResponse) => {
    });
  }

  createModalOptions(initialState?: any): ModalOptions {
    return {
      class: "modal-xl",
      animated: false,
      backdrop: "static",
      ignoreBackdropClick: false,
      keyboard: true,
      focus: true,
      show: true,
      initialState: extend({}, initialState)
    };
  }

  sendNotification(confirm: Confirm, committeeFile?: CommitteeFile) {
    this.modalService.show(CommitteeSendNotificationModalComponent, this.createModalOptions({committeeFile, confirm}));
  }

  openMailchimp() {
    window.open(this.mailchimpLinkService.campaigns(), "_blank");
  }

  openSettings() {
    this.modalService.show(CommitteeNotificationSettingsModalComponent, this.display.createModalOptions());
  }

  configureLetterheads() {
    this.urlService.navigateTo("committee/letterhead");
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

}
