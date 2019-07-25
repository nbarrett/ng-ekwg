import { ActivatedRoute } from "@angular/router";
import { AppComponent } from "./app.component";
import { ApplicationRef, CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import {
  AuthenticationModalsServiceProvider,
  ClipboardServiceProvider,
  CommitteeConfigProvider,
  ContentTextProvider,
  GoogleMapsConfigProvider,
  LegacyUrlService,
  LoggedInMemberServiceProvider,
  MeetupServiceProvider,
  MemberServiceProvider,
  NotifierProvider,
  RamblersUploadAuditProvider,
  RamblersWalksAndEventsServiceProvider,
  WalkNotificationServiceProvider,
  WalksQueryServiceProvider,
  WalksServiceProvider
} from "./ajs-upgraded-providers";
import { BrowserModule } from "@angular/platform-browser";
import { CookieService } from "ngx-cookie-service";
import { CustomNGXLoggerService, LoggerModule, NgxLoggerLevel } from "ngx-logger";
import { DateUtilsService } from "./services/date-utils.service";
import { downgradeComponent, downgradeInjectable, getAngularJSGlobal, UpgradeModule } from "@angular/upgrade/static";
import { ForgotPasswordComponent } from "./login/forgot-password.component";
import { JoinUsComponent } from "./pages/join-us/join-us.component";
import { Logger, LoggerFactory } from "./services/logger-factory.service";
import { LoginComponent } from "./login/login.component";
import { LoginPanelComponent } from "./login-panel/login-panel.component";
import { LogoutComponent } from "./logout/logout.component";
import { MailingPreferencesComponent } from "./login/mailing-preferences.component";
import { MainLogoComponent } from "./main-logo/main-logo.component";
import { MainTitleComponent } from "./main-title/main-title.component";
import { MarkdownEditorComponent } from "./markdown-editor/markdown-editor.component";
import { MarkdownModule } from "ngx-markdown";
import { NonRenderingComponent } from "./shared/non-rendering.component";
import { PageNavigatorComponent } from "./page-navigator/page-navigator.component";
import { PageTitleComponent } from "./page-title/page-title.component";
import { SetPasswordComponent } from "./login/set-password.component";
import { setUpLocationSync } from "@angular/router/upgrade";
import { SiteEditComponent } from "./site-edit/site-edit.component";
import { SiteEditService } from "./site-edit/site-edit.service";
import { SiteNavigatorComponent } from "./site-navigator/site-navigator.component";
import { UiSwitchModule } from "ngx-ui-switch";
import { CommitteeReferenceDataService } from "./services/committee-reference-data.service";
import { ContactUsComponent } from "./contact-us/contact-us.component";
import { RouterHistoryService } from "./services/router-history.service";
import { UrlService } from "./services/url.service";
import { WalksComponent } from "./pages/walks/walks.component";
import { BroadcasterService } from "./services/broadcast-service";
import { DisplayDate, DisplayDateAndTime, DisplayDay } from "./pipes";

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    ContactUsComponent,
    ForgotPasswordComponent,
    JoinUsComponent,
    LoginComponent,
    LoginPanelComponent,
    LogoutComponent,
    MailingPreferencesComponent,
    MainLogoComponent,
    MainTitleComponent,
    MarkdownEditorComponent,
    NonRenderingComponent,
    PageNavigatorComponent,
    PageTitleComponent,
    SetPasswordComponent,
    SiteEditComponent,
    DisplayDate,
    DisplayDay,
    DisplayDateAndTime,
    SiteNavigatorComponent,
    WalksComponent
  ],
  imports: [
    BrowserModule,
    LoggerModule.forRoot({serverLoggingUrl: "/api/logs", level: NgxLoggerLevel.INFO, serverLogLevel: NgxLoggerLevel.ERROR}),
    MarkdownModule.forRoot(),
    AppRoutingModule,
    UpgradeModule,
    UiSwitchModule,
  ],
  providers: [
    CustomNGXLoggerService,
    CookieService,
    SiteEditService,
    RouterHistoryService,
    CommitteeReferenceDataService,
    LoggedInMemberServiceProvider,
    ClipboardServiceProvider,
    RamblersUploadAuditProvider,
    WalksServiceProvider,
    WalksQueryServiceProvider,
    WalkNotificationServiceProvider,
    MemberServiceProvider,
    RamblersWalksAndEventsServiceProvider,
    NotifierProvider,
    GoogleMapsConfigProvider,
    MeetupServiceProvider,
    CommitteeConfigProvider,
    AuthenticationModalsServiceProvider,
    ContentTextProvider,
  ],
  entryComponents: [
    AppComponent,
    ContactUsComponent,
    MarkdownEditorComponent
  ],
})

export class AppModule {
  private logger: Logger;

  constructor(private upgrade: UpgradeModule, private route: ActivatedRoute, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(AppComponent, NgxLoggerLevel.INFO);
  }

  ngDoBootstrap(appRef: ApplicationRef) {
    const legacy = getAngularJSGlobal().module("ekwgApp")
      .directive("markdownEditor", downgradeComponent({component: MarkdownEditorComponent}))
      .directive("contactUs", downgradeComponent({component: ContactUsComponent}))
      .factory("LegacyUrlService", LegacyUrlService)
      .factory("CommitteeReferenceData", downgradeInjectable(CommitteeReferenceDataService))
      .factory("BroadcasterService", downgradeInjectable(BroadcasterService))
      .factory("SiteEditService", downgradeInjectable(SiteEditService))
      .factory("URLService", downgradeInjectable(UrlService))
      .factory("RouterHistoryService", downgradeInjectable(RouterHistoryService))
      .factory("DateUtils", downgradeInjectable(DateUtilsService));
    this.upgrade.bootstrap(document.body, [legacy.name], {strictDi: true});
    setUpLocationSync(this.upgrade);
    appRef.bootstrap(AppComponent);
  }

}
