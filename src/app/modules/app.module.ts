import { HttpClientModule } from "@angular/common/http";
import { ApplicationRef, DoBootstrap, NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { setUpLocationSync } from "@angular/router/upgrade";
import { downgradeComponent, downgradeInjectable, getAngularJSGlobal, UpgradeModule } from "@angular/upgrade/static";
import { NgxLoggerLevel } from "ngx-logger";
import { AppRoutingModule } from "../app-routing.module";
import { AppComponent } from "../app.component";
import { ContactUsDirective } from "../contact-us/contact-us-directive.component";
import { LoginPanelComponent } from "../login-panel/login-panel.component";
import { ForgotPasswordComponent } from "../login/forgot-password.component";
import { LoginComponent } from "../login/login.component";
import { SetPasswordComponent } from "../login/set-password.component";
import { LogoutComponent } from "../logout/logout.component";
import { MainLogoComponent } from "../main-logo/main-logo.component";
import { MainTitleComponent } from "../main-title/main-title.component";
import { MarkdownEditorComponent } from "../markdown-editor/markdown-editor.component";
import { MeetupDescriptionComponent } from "../notifications/walks/templates/meetup/meetup-description.component";
import { PageNavigatorComponent } from "../page-navigator/page-navigator.component";
import { PageTitleComponent } from "../page-title/page-title.component";
import { ContactUsComponent } from "../pages/contact-us/contact-us.component";
import { HomeComponent } from "../pages/home/home.component";
import { HowToModalComponent } from "../pages/how-to/how-to-modal.component";
import { HowToComponent } from "../pages/how-to/how-to.component";
import { PrivacyPolicyComponent } from "../pages/home/privacy-policy.component";
import { JoinUsComponent } from "../pages/join-us/join-us.component";
import { LoginModalComponent } from "../pages/login/login-modal/login-modal.component";
import { ChangedItemsPipe } from "../pipes/changed-items.pipe";
import { BroadcastService } from "../services/broadcast-service";
import { CommitteeConfigService } from "../services/committee/commitee-config.service";
import { ConfigService } from "../services/config.service";
import { ContentMetadataService } from "../services/content-metadata.service";
import { DateUtilsService } from "../services/date-utils.service";
import { DbUtilsService } from "../services/db-utils.service";
import { HttpResponseService } from "../services/http-response.service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { MailchimpConfigService } from "../services/mailchimp-config.service";
import { MailchimpCampaignService } from "../services/mailchimp/mailchimp-campaign.service";
import { MailchimpLinkService } from "../services/mailchimp/mailchimp-link.service";
import { MailchimpSegmentService } from "../services/mailchimp/mailchimp-segment.service";
import { MemberLoginService } from "../services/member/member-login.service";
import { MemberService } from "../services/member/member.service";
import { NotifierService } from "../services/notifier.service";
import { NumberUtilsService } from "../services/number-utils.service";
import { PageService } from "../services/page.service";
import { ProfileConfirmationService } from "../services/profile-confirmation.service";
import { RouterHistoryService } from "../services/router-history.service";
import { StringUtilsService } from "../services/string-utils.service";
import { UrlService } from "../services/url.service";
import { WalksQueryService } from "../services/walks/walks-query.service";
import { WalksReferenceService } from "../services/walks/walks-reference-data.service";
import { WalksService } from "../services/walks/walks.service";
import { SharedModule } from "../shared-module";
import { NonRenderingComponent } from "../shared/non-rendering.component";
import { SiteEditComponent } from "../site-edit/site-edit.component";
import { SiteEditService } from "../site-edit/site-edit.service";
import { SiteNavigatorComponent } from "../site-navigator/site-navigator.component";

@NgModule({
  declarations: [
    AppComponent,
    ChangedItemsPipe,
    ContactUsComponent,
    ForgotPasswordComponent,
    HomeComponent,
    HowToModalComponent,
    HowToComponent,
    JoinUsComponent,
    LoginComponent,
    LoginModalComponent,
    LoginPanelComponent,
    LogoutComponent,
    MainLogoComponent,
    MainTitleComponent,
    MeetupDescriptionComponent,
    NonRenderingComponent,
    PageNavigatorComponent,
    PageTitleComponent,
    PrivacyPolicyComponent,
    SetPasswordComponent,
    SiteEditComponent,
    SiteNavigatorComponent
  ],
  imports: [
    BrowserAnimationsModule,
    SharedModule.forRoot(),
    HttpClientModule,
    UpgradeModule,
    AppRoutingModule
  ],
  entryComponents: [
    AppComponent
  ]
})

export class AppModule implements DoBootstrap {
  private logger: Logger;

  constructor(private upgrade: UpgradeModule, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(AppComponent, NgxLoggerLevel.OFF);
  }

  ngDoBootstrap(appRef: ApplicationRef) {
    const legacy = getAngularJSGlobal().module("ekwgApp")
      .directive("markdownEditor", downgradeComponent({component: MarkdownEditorComponent}))
      .directive("contactUs", downgradeComponent({component: ContactUsDirective}))
      .factory("PageService", downgradeInjectable(PageService))
      .factory("DbUtils", downgradeInjectable(DbUtilsService))
      .factory("HttpResponseService", downgradeInjectable(HttpResponseService))
      .factory("ContentMetaDataService", downgradeInjectable(ContentMetadataService))
      .factory("NumberUtils", downgradeInjectable(NumberUtilsService))
      .factory("ContentMetadataService", downgradeInjectable(ContentMetadataService))
      .factory("CommitteeConfig", downgradeInjectable(CommitteeConfigService))
      .factory("ProfileConfirmationService", downgradeInjectable(ProfileConfirmationService))
      .factory("MemberLoginService", downgradeInjectable(MemberLoginService))
      .factory("StringUtils", downgradeInjectable(StringUtilsService))
      .factory("Config", downgradeInjectable(ConfigService))
      .factory("MemberService", downgradeInjectable(MemberService))
      .factory("WalksReferenceService", downgradeInjectable(WalksReferenceService))
      .factory("WalksQueryService", downgradeInjectable(WalksQueryService))
      .factory("BroadcastService", downgradeInjectable(BroadcastService))
      .factory("SiteEditService", downgradeInjectable(SiteEditService))
      .factory("MailchimpLinkService", downgradeInjectable(MailchimpLinkService))
      .factory("MailchimpSegmentService", downgradeInjectable(MailchimpSegmentService))
      .factory("MailchimpCampaignService", downgradeInjectable(MailchimpCampaignService))
      .factory("MailchimpConfig", downgradeInjectable(MailchimpConfigService))
      .factory("URLService", downgradeInjectable(UrlService))
      .factory("RouterHistoryService", downgradeInjectable(RouterHistoryService))
      .factory("DateUtils", downgradeInjectable(DateUtilsService))
      .factory("Notifier", downgradeInjectable(NotifierService))
      .factory("WalksService", downgradeInjectable(WalksService));
    this.upgrade.bootstrap(document.body, [legacy.name], {strictDi: true});
    setUpLocationSync(this.upgrade, "path");
    appRef.bootstrap(AppComponent);
  }

}
