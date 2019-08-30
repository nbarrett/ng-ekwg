import { ApplicationRef, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute } from "@angular/router";
import { setUpLocationSync } from "@angular/router/upgrade";
import { downgradeComponent, downgradeInjectable, getAngularJSGlobal, UpgradeModule } from "@angular/upgrade/static";
import { Angular2CsvModule } from "angular2-csv";
import { AccordionModule } from "ngx-bootstrap/accordion";
import { AlertModule } from "ngx-bootstrap/alert";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { PopoverModule } from "ngx-bootstrap/popover";
import { TabsModule } from "ngx-bootstrap/tabs";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { CookieService } from "ngx-cookie-service";
import { CustomNGXLoggerService, LoggerModule, NgxLoggerLevel } from "ngx-logger";
import { MarkdownModule } from "ngx-markdown";
import { UiSwitchModule } from "ngx-ui-switch";
import { AccordionGroupComponent } from "./accordion/accordion-group.component";
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
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ContactUsComponent } from "./contact-us/contact-us.component";
import { LoginPanelComponent } from "./login-panel/login-panel.component";
import { ForgotPasswordComponent } from "./login/forgot-password.component";
import { LoginComponent } from "./login/login.component";
import { MailingPreferencesComponent } from "./login/mailing-preferences.component";
import { SetPasswordComponent } from "./login/set-password.component";
import { LogoutComponent } from "./logout/logout.component";
import { MainLogoComponent } from "./main-logo/main-logo.component";
import { MainTitleComponent } from "./main-title/main-title.component";
import { MarkdownEditorComponent } from "./markdown-editor/markdown-editor.component";
import { PageNavigatorComponent } from "./page-navigator/page-navigator.component";
import { PageTitleComponent } from "./page-title/page-title.component";
import { JoinUsComponent } from "./pages/join-us/join-us.component";
import { WalkAddSlotsComponent } from "./pages/walks/walk-add-slots/walk-add-slots.component";
import { WalkEditFullPageComponent } from "./pages/walks/walk-edit-fullpage/walk-edit-full-page.component";
import { WalkEditComponent } from "./pages/walks/walk-edit/walk-edit.component";
import { WalkExportComponent } from "./pages/walks/walk-export/walk-export.component";
import { WalkListComponent } from "./pages/walks/walk-list/walk-list.component";
import { WalkViewComponent } from "./pages/walks/walk-view/walk-view.component";
import { PanelExpanderComponent } from "./panel-expander/panel-expander.component";
import { AuditDeltaValuePipe } from "./pipes/audit-delta-value.pipe";
import { ChangedItemsPipe } from "./pipes/changed-items.pipe";
import { DisplayDateAndTimePipe } from "./pipes/display-date-and-time.pipe";
import { DisplayDatePipe } from "./pipes/display-date.pipe";
import { DisplayDatesPipe } from "./pipes/display-dates.pipe";
import { DisplayDayPipe } from "./pipes/display-day.pipe";
import { EventNotePipe } from "./pipes/event-note.pipe";
import { FullNameWithAliasOrMePipe } from "./pipes/full-name-with-alias-or-me.pipe";
import { FullNameWithAliasPipe } from "./pipes/full-name-with-alias.pipe";
import { FullNamePipe } from "./pipes/full-name.pipe";
import { MeetupEventSummaryPipe } from "./pipes/meetup-event-summary.pipe";
import { MemberIdToFullNamePipe } from "./pipes/member-id-to-full-name.pipe";
import { SearchFilterPipe } from "./pipes/search-filter.pipe";
import { ValueOrDefaultPipe } from "./pipes/value-or-default.pipe";
import { WalkEventTypePipe } from "./pipes/walk-event-type.pipe";
import { WalkSummaryPipe } from "./pipes/walk-summary.pipe";
import { BroadcastService } from "./services/broadcast-service";
import { CommitteeReferenceDataService } from "./services/committee-reference-data.service";
import { DateUtilsService } from "./services/date-utils.service";
import { Logger, LoggerFactory } from "./services/logger-factory.service";
import { NotifierService } from "./services/notifier.service";
import { RouterHistoryService } from "./services/router-history.service";
import { UrlService } from "./services/url.service";
import { WalksQueryService } from "./services/walks-query.service";
import { WalksReferenceService } from "./services/walks-reference-data.service";
import { NonRenderingComponent } from "./shared/non-rendering.component";
import { SiteEditComponent } from "./site-edit/site-edit.component";
import { SiteEditService } from "./site-edit/site-edit.service";
import { SiteNavigatorComponent } from "./site-navigator/site-navigator.component";

@NgModule({
  declarations: [
    AccordionGroupComponent,
    AppComponent,
    AuditDeltaValuePipe,
    ChangedItemsPipe,
    ContactUsComponent,
    DisplayDateAndTimePipe,
    DisplayDatePipe,
    DisplayDatesPipe,
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
    WalkEditFullPageComponent,
    WalkEventTypePipe,
    WalkExportComponent,
    WalkListComponent,
    WalkSummaryPipe,
    WalkViewComponent,
    PanelExpanderComponent,
    WalkAddSlotsComponent],
  imports: [
    AccordionModule.forRoot(),
    AlertModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    BsDatepickerModule.forRoot(),
    LoggerModule.forRoot({serverLoggingUrl: "/api/logs", level: NgxLoggerLevel.INFO, serverLogLevel: NgxLoggerLevel.ERROR}),
    MarkdownModule.forRoot(),
    Angular2CsvModule,
    PopoverModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    UiSwitchModule,
    UpgradeModule,
  ],
  providers: [
    AuditDeltaValuePipe,
    AuthenticationModalsServiceProvider,
    BroadcastService,
    ChangedItemsPipe,
    ClipboardServiceProvider,
    CommitteeConfigProvider,
    CommitteeReferenceDataService,
    ContentTextProvider,
    CookieService,
    CustomNGXLoggerService,
    DisplayDateAndTimePipe,
    DisplayDatePipe,
    DisplayDatesPipe,
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
      .factory("BroadcastService", downgradeInjectable(BroadcastService))
      .factory("SiteEditService", downgradeInjectable(SiteEditService))
      .factory("URLService", downgradeInjectable(UrlService))
      .factory("RouterHistoryService", downgradeInjectable(RouterHistoryService))
      .factory("DateUtils", downgradeInjectable(DateUtilsService));
    this.upgrade.bootstrap(document.body, [legacy.name], {strictDi: true});
    setUpLocationSync(this.upgrade);
    appRef.bootstrap(AppComponent);
  }

}
