import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { faBook, faCashRegister, faEnvelopeOpenText, faIdCard, faMailBulk, faUnlockAlt, faUser, faUsersCog } from "@fortawesome/free-solid-svg-icons";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { PageContent, PageContentType } from "../../../models/content-text.model";
import { AccessLevel } from "../../../models/member-resource.model";
import { LoginResponse } from "../../../models/member.model";
import { ContentTextService } from "../../../services/content-text.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { PageContentService } from "../../../services/page-content.service";
import { PageService } from "../../../services/page.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.sass"],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AdminComponent implements OnInit, OnDestroy {
  faIdCard = faIdCard;
  faUnlockAlt = faUnlockAlt;
  faEnvelopeOpenText = faEnvelopeOpenText;
  faCashRegister = faCashRegister;
  faUsersCog = faUsersCog;
  faMailBulk = faMailBulk;
  faBook = faBook;
  faUser = faUser;
  private logger: Logger;
  private subscription: Subscription;
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public loggedIn: boolean;
  public allowAdminEdits: boolean;
  itemCols: number;

  constructor(private pageService: PageService,
              private memberLoginService: MemberLoginService,
              private notifierService: NotifierService,
              public pageContentService: PageContentService,
              public contentTextService: ContentTextService,
              private authService: AuthService,
              private urlService: UrlService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(AdminComponent, NgxLoggerLevel.OFF);
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.pageService.setTitle();
    this.generateActionButtons();
    this.setPrivileges();
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.subscription = this.authService.authResponse().subscribe((loginResponse: LoginResponse) => this.setPrivileges(loginResponse));
  }

  private setPrivileges(loginResponse?: LoginResponse) {
    this.allowAdminEdits = this.memberLoginService.allowMemberAdminEdits();
    this.loggedIn = this.memberLoginService.memberLoggedIn();
    this.logger.debug(loginResponse, "setPrivileges:allowAdminEdits", this.allowAdminEdits, "this.loggedIn", this.loggedIn);
  }

  private generateActionButtons() {
    this.pageContentService.findByPath("admin#action-buttons")
      .then(async response => {
        this.logger.debug("response:", response);
        if (!response) {
          const data: PageContent = {
            path: "admin#action-buttons", rows: [
              {
                maxColumns: 4,
                showSwiper: false,
                type: PageContentType.ACTION_BUTTONS,
                columns: [
                  {
                    accessLevel: AccessLevel.loggedInMember,
                    title: "Contact details",
                    icon: "faIdCard",
                    href: "admin/contact-details",
                    contentTextId: (await this.contentTextService.findByNameAndCategory("personal-details-help", "admin"))?.id
                  },
                  {
                    accessLevel: AccessLevel.loggedInMember,
                    title: "Change Password",
                    icon: "faUnlockAlt",
                    href: "admin/change-password",
                    contentTextId: (await this.contentTextService.findByNameAndCategory("member-login-audit-help", "admin"))?.id
                  },
                  {
                    accessLevel: AccessLevel.loggedInMember,
                    title: "Email subscriptions",
                    icon: "faEnvelopeOpenText",
                    href: "admin/email-subscriptions",
                    contentTextId: (await this.contentTextService.findByNameAndCategory("contact-preferences-help", "admin"))?.id
                  },
                  {
                    accessLevel: AccessLevel.loggedInMember,
                    title: "Expenses",
                    icon: "faCashRegister",
                    href: "admin/expenses",
                    contentTextId: (await this.contentTextService.findByNameAndCategory("expenses-help", "admin"))?.id
                  },
                  {
                    accessLevel: AccessLevel.committee,
                    title: "Member Admin",
                    icon: "faUsersCog",
                    href: "admin/member-admin",
                    contentTextId: (await this.contentTextService.findByNameAndCategory("member-admin-help", "admin"))?.id
                  },
                  {
                    accessLevel: AccessLevel.committee,
                    title: "Member Bulk Load",
                    icon: "faMailBulk",
                    href: "admin/member-bulk-load",
                    contentTextId: (await this.contentTextService.findByNameAndCategory("bulk-load-help", "admin"))?.id
                  },
                  {
                    accessLevel: AccessLevel.committee,
                    title: "Member Login Audit",
                    icon: "faBook",
                    href: "admin/member-login-audit",
                    contentTextId: (await this.contentTextService.findByNameAndCategory("member-login-audit-help", "admin"))?.id
                  },
                ]
              }]
          };
          this.logger.debug("data", data);
          this.pageContentService.createOrUpdate(data);
        } else {
          this.logger.debug("found existing page content", response);
        }
      })
      .catch(async error => {
        this.logger.debug("error:", error);
      });
  }

}
