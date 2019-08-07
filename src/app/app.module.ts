import { ActivatedRoute } from "@angular/router";
import { AppComponent } from "./app.component";
import { ApplicationRef, NgModule } from "@angular/core";
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
import { BroadcasterService } from "./services/broadcast-service";
import { AccordionModule } from "ngx-bootstrap/accordion";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { PopoverModule } from "ngx-bootstrap/popover";
import { WalksReferenceService } from "./services/walks-reference-data.service";
import { WalksQueryService } from "./services/walks-query.service";
import { AlertModule } from "ngx-bootstrap/alert";
import { NotifierService } from "./services/notifier.service";
import { AccordionGroupComponent } from "./accordion/accordion-group.component";
import { WalkViewComponent } from "./pages/walks/walk-view/walk-view.component";
import { WalkEditComponent } from "./pages/walks/walk-edit/walk-edit.component";
import { WalkListComponent } from "./pages/walks/walks-list/walk-list.component";
import { WalkExportComponent } from "./pages/walks/walk-export/walk-export.component";
import { TabsModule } from "ngx-bootstrap/tabs";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { ValueOrDefaultPipe } from "./pipes/value-or-default.pipe";
import { DisplayDatePipe } from "./pipes/display-date.pipe";
import { DisplayDayPipe } from "./pipes/display-day.pipe";
import { DisplayDateAndTimePipe } from "./pipes/display-date-and-time.pipe";
import { EventNotePipe } from "./pipes/event-note.pipe";
import { MemberIdToFullNamePipe } from "./pipes/member-id-to-full-name.pipe";
import { ChangedItemsPipe } from "./pipes/changed-items.pipe";
import { FullNamePipe } from "./pipes/full-name.pipe";
import { FullNameWithAliasOrMePipe } from "./pipes/full-name-with-alias-or-me.pipe";
import { AuditDeltaValuePipe } from "./pipes/audit-delta-value.pipe";
import { FullNameWithAliasPipe } from "./pipes/full-name-with-alias.pipe";
import { MeetupEventSummaryPipe } from "./pipes/meetup-event-summary.pipe";
import { WalkEventTypePipe } from "./pipes/walk-event-type.pipe";
import { SearchFilterPipe } from "./pipes/search-filter.pipe";
import { WalkSummaryPipe } from "./pipes/walk-summary.pipe";

@NgModule({
  declarations: [
    AccordionGroupComponent,
    AppComponent,
    AuditDeltaValuePipe,
    ChangedItemsPipe,
    ContactUsComponent,
    DisplayDateAndTimePipe,
    DisplayDatePipe,
    DisplayDayPipe,
    EventNotePipe,
    ForgotPasswordComponent,
    FullNamePipe,
    FullNameWithAliasOrMePipe,
    FullNameWithAliasPipe,
    JoinUsComponent,
    LoginComponent,
    LoginPanelComponent,
    LogoutComponent,
    MailingPreferencesComponent,
    MainLogoComponent,
    MainTitleComponent,
    MarkdownEditorComponent,
    MeetupEventSummaryPipe,
    MemberIdToFullNamePipe,
    NonRenderingComponent,
    PageNavigatorComponent,
    PageTitleComponent,
    SearchFilterPipe,
    SetPasswordComponent,
    SiteEditComponent,
    SiteNavigatorComponent,
    ValueOrDefaultPipe,
    WalkEditComponent,
    WalkEventTypePipe,
    WalkExportComponent,
    WalkListComponent,
    WalkSummaryPipe,
    WalkViewComponent],
  imports: [
    AccordionModule.forRoot(),
    AlertModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    BsDatepickerModule.forRoot(),
    LoggerModule.forRoot({serverLoggingUrl: "/api/logs", level: NgxLoggerLevel.INFO, serverLogLevel: NgxLoggerLevel.ERROR}),
    MarkdownModule.forRoot(),
    PopoverModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    UiSwitchModule,
    UpgradeModule,
  ],
  providers: [
    AuditDeltaValuePipe,
    AuthenticationModalsServiceProvider,
    BroadcasterService,
    ChangedItemsPipe,
    ClipboardServiceProvider,
    CommitteeConfigProvider,
    CommitteeReferenceDataService,
    ContentTextProvider,
    CookieService,
    CustomNGXLoggerService,
    DisplayDateAndTimePipe,
    DisplayDatePipe,
    DisplayDayPipe,
    EventNotePipe,
    FullNamePipe,
    FullNameWithAliasOrMePipe,
    FullNameWithAliasPipe,
    GoogleMapsConfigProvider,
    LoggedInMemberServiceProvider,
    MeetupEventSummaryPipe,
    MeetupServiceProvider,
    MemberIdToFullNamePipe,
    MemberServiceProvider,
    NotifierProvider,
    NotifierService,
    RamblersUploadAuditProvider,
    RamblersWalksAndEventsServiceProvider,
    RouterHistoryService,
    SearchFilterPipe,
    SiteEditService,
    ValueOrDefaultPipe,
    WalkEventTypePipe,
    WalkNotificationServiceProvider,
    WalksServiceProvider,
    WalkSummaryPipe,
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
      .factory("WalksReferenceService", downgradeInjectable(WalksReferenceService))
      .factory("WalksQueryService", downgradeInjectable(WalksQueryService))
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
