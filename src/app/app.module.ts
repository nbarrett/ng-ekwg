import { HttpClientModule } from "@angular/common/http";
import { ApplicationRef, DoBootstrap, NgModule } from "@angular/core";
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
  ConfigDataProvider,
  ContentTextServiceProvider,
  GoogleMapsConfigProvider,
  LegacyUrlService,
  MemberLoginServiceProvider,
  MailchimpCampaignServiceProvider,
  MailchimpConfigProvider,
  MailchimpSegmentServiceProvider,
  MeetupServiceProvider,
  MemberServiceProvider,
  NotifierProvider,
  RamblersUploadAuditProvider,
  RamblersWalksAndEventsServiceProvider,
  WalksServiceProvider,
  MemberAuditServiceProvider
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
import { NotificationUrlComponent } from "./notification-url/notification-url.component";
import { NotificationDirective } from "./notifications/walks/notification.directive";
import { WalkNotificationChangesComponent } from "./notifications/walks/templates/common/walk-notification-changes.component";
import { WalkNotificationDetailsComponent } from "./notifications/walks/templates/common/walk-notification-details.component";
import { WalkNotificationFooterComponent } from "./notifications/walks/templates/common/walk-notification-footer.component";
import { WalkNotificationCoordinatorApprovedComponent } from "./notifications/walks/templates/coordinator/walk-notification-coordinator-approved.component";
import { WalkNotificationCoordinatorAwaitingApprovalComponent } from "./notifications/walks/templates/coordinator/walk-notification-coordinator-awaiting-approval.component";
import { WalkNotificationCoordinatorAwaitingWalkDetailsComponent } from "./notifications/walks/templates/coordinator/walk-notification-coordinator-awaiting-walk-details.component";
import { WalkNotificationCoordinatorDeletedComponent } from "./notifications/walks/templates/coordinator/walk-notification-coordinator-deleted.component";
import { WalkNotificationCoordinatorRequestedComponent } from "./notifications/walks/templates/coordinator/walk-notification-coordinator-requested.component";
import { WalkNotificationCoordinatorUpdatedComponent } from "./notifications/walks/templates/coordinator/walk-notification-coordinator-updated.component";
import { WalkNotificationLeaderApprovedComponent } from "./notifications/walks/templates/leader/walk-notification-leader-approved.component";
import { WalkNotificationLeaderAwaitingApprovalComponent } from "./notifications/walks/templates/leader/walk-notification-leader-awaiting-approval.component";
import { WalkNotificationLeaderAwaitingWalkDetailsComponent } from "./notifications/walks/templates/leader/walk-notification-leader-awaiting-walk-details.component";
import { WalkNotificationLeaderDeletedComponent } from "./notifications/walks/templates/leader/walk-notification-leader-deleted.component";
import { WalkNotificationLeaderRequestedComponent } from "./notifications/walks/templates/leader/walk-notification-leader-requested.component";
import { WalkNotificationLeaderUpdatedComponent } from "./notifications/walks/templates/leader/walk-notification-leader-updated.component";
import { MeetupDescriptionComponent } from "./notifications/walks/templates/meetup/meetup-description.component";
import { PageNavigatorComponent } from "./page-navigator/page-navigator.component";
import { PageTitleComponent } from "./page-title/page-title.component";
import { JoinUsComponent } from "./pages/join-us/join-us.component";
import { WalkAddSlotsComponent } from "./pages/walks/walk-add-slots/walk-add-slots.component";
import { WalkAdminComponent } from "./pages/walks/walk-admin/walk-admin.component";
import { WalkEditFullPageComponent } from "./pages/walks/walk-edit-fullpage/walk-edit-full-page.component";
import { WalkEditComponent } from "./pages/walks/walk-edit/walk-edit.component";
import { WalkExportComponent } from "./pages/walks/walk-export/walk-export.component";
import { WalkListComponent } from "./pages/walks/walk-list/walk-list.component";
import { WalkMeetupSettingsComponent } from "./pages/walks/walk-meetup-settings/walk-meetup-settings.component";
import { WalkMeetupComponent } from "./pages/walks/walk-meetup/walk-meetup.component";
import { WalkVenueComponent } from "./pages/walks/walk-venue/walk-venue.component";
import { WalkViewComponent } from "./pages/walks/walk-view/walk-view.component";
import { PanelExpanderComponent } from "./panel-expander/panel-expander.component";
import { AuditDeltaChangedItemsPipePipe } from "./pipes/audit-delta-changed-items.pipe";
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
import { HumanisePipe } from "./pipes/humanise.pipe";
import { MeetupEventSummaryPipe } from "./pipes/meetup-event-summary.pipe";
import { MemberIdToFullNamePipe } from "./pipes/member-id-to-full-name.pipe";
import { MemberIdsToFullNamesPipe } from "./pipes/member-ids-to-full-names.pipe";
import { SearchFilterPipe } from "./pipes/search-filter.pipe";
import { SnakeCasePipe } from "./pipes/snakecase.pipe";
import { ValueOrDefaultPipe } from "./pipes/value-or-default.pipe";
import { VenueIconPipe } from "./pipes/venue-icon.pipe";
import { WalkEventTypePipe } from "./pipes/walk-event-type.pipe";
import { WalkSummaryPipe } from "./pipes/walk-summary.pipe";
import { WalkValidationsListPipe } from "./pipes/walk-validations.pipe";
import { BroadcastService } from "./services/broadcast-service";
import { CommitteeReferenceDataService } from "./services/committee/committee-reference-data.service";
import { ConfigService } from "./services/config.service";
import { ContentTextService } from "./services/content-text.service";
import { DateUtilsService } from "./services/date-utils.service";
import { HttpResponseService } from "./services/http-response.service";
import { MemberLoginService } from "./services/member-login.service";
import { Logger, LoggerFactory } from "./services/logger-factory.service";
import { NotifierService } from "./services/notifier.service";
import { NumberUtilsService } from "./services/number-utils.service";
import { RouterHistoryService } from "./services/router-history.service";
import { StringUtilsService } from "./services/string-utils.service";
import { UrlService } from "./services/url.service";
import { WalkNotificationService } from "./services/walks/walk-notification.service";
import { WalksQueryService } from "./services/walks/walks-query.service";
import { WalksReferenceService } from "./services/walks/walks-reference-data.service";
import { NonRenderingComponent } from "./shared/non-rendering.component";
import { SiteEditComponent } from "./site-edit/site-edit.component";
import { SiteEditService } from "./site-edit/site-edit.service";
import { SiteNavigatorComponent } from "./site-navigator/site-navigator.component";
import { WalksAuthGuard } from "./walks-auth-guard.service";
import { WalkMeetupConfigParametersComponent } from "./pages/walks/walk-meetup-config-parameters/walk-meetup-config-parameters.component";

@NgModule({
  declarations: [
    AccordionGroupComponent,
    AppComponent,
    AuditDeltaChangedItemsPipePipe,
    AuditDeltaValuePipe,
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
    HumanisePipe,
    SnakeCasePipe,
    JoinUsComponent,
    LoginComponent,
    LoginPanelComponent,
    LogoutComponent,
    MailingPreferencesComponent,
    MainLogoComponent,
    MainTitleComponent,
    MarkdownEditorComponent,
    MeetupEventSummaryPipe,
    MemberIdsToFullNamesPipe,
    MemberIdToFullNamePipe,
    NonRenderingComponent,
    NotificationDirective,
    NotificationUrlComponent,
    PageNavigatorComponent,
    PageTitleComponent,
    PanelExpanderComponent,
    SearchFilterPipe,
    SetPasswordComponent,
    SiteEditComponent,
    SiteNavigatorComponent,
    ValueOrDefaultPipe,
    VenueIconPipe,
    WalkAddSlotsComponent,
    WalkEditComponent,
    WalkEditFullPageComponent,
    WalkEventTypePipe,
    WalkExportComponent,
    WalkListComponent,
    WalkNotificationChangesComponent,
    MeetupDescriptionComponent,
    WalkNotificationCoordinatorApprovedComponent,
    WalkNotificationCoordinatorAwaitingApprovalComponent,
    WalkNotificationCoordinatorAwaitingWalkDetailsComponent,
    WalkNotificationCoordinatorDeletedComponent,
    WalkNotificationCoordinatorRequestedComponent,
    WalkNotificationCoordinatorUpdatedComponent,
    WalkNotificationDetailsComponent,
    WalkNotificationFooterComponent,
    WalkNotificationLeaderApprovedComponent,
    WalkNotificationLeaderAwaitingApprovalComponent,
    WalkNotificationLeaderAwaitingWalkDetailsComponent,
    WalkNotificationLeaderDeletedComponent,
    WalkNotificationLeaderRequestedComponent,
    WalkNotificationLeaderUpdatedComponent,
    WalkSummaryPipe,
    WalkValidationsListPipe,
    WalkViewComponent,
    WalkVenueComponent,
    WalkMeetupComponent,
    WalkAdminComponent,
    WalkMeetupSettingsComponent,
    WalkMeetupConfigParametersComponent,
  ],
  imports: [
    AccordionModule.forRoot(),
    AlertModule.forRoot(),
    Angular2CsvModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    BsDatepickerModule.forRoot(),
    HttpClientModule,
    LoggerModule.forRoot({serverLoggingUrl: "/api/logs", level: NgxLoggerLevel.INFO, serverLogLevel: NgxLoggerLevel.ERROR}),
    MarkdownModule.forRoot(),
    PopoverModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    UiSwitchModule,
    UpgradeModule,
  ],
  providers: [
    AuditDeltaChangedItemsPipePipe,
    AuditDeltaValuePipe,
    AuthenticationModalsServiceProvider,
    BroadcastService,
    ChangedItemsPipe,
    ClipboardServiceProvider,
    CommitteeConfigProvider,
    CommitteeReferenceDataService,
    ContentTextServiceProvider,
    ConfigDataProvider,
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
    HumanisePipe,
    SnakeCasePipe,
    WalkValidationsListPipe,
    GoogleMapsConfigProvider,
    MemberLoginServiceProvider,
    MailchimpCampaignServiceProvider,
    MailchimpConfigProvider,
    MailchimpSegmentServiceProvider,
    MeetupEventSummaryPipe,
    MeetupServiceProvider,
    MemberIdsToFullNamesPipe,
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
    VenueIconPipe,
    WalkEventTypePipe,
    WalkNotificationService,
    WalksAuthGuard,
    WalksServiceProvider,
    MemberAuditServiceProvider,
    WalkSummaryPipe,
  ],
  entryComponents: [
    AppComponent,
    ContactUsComponent,
    MeetupDescriptionComponent,
    WalkNotificationChangesComponent,
    WalkNotificationCoordinatorApprovedComponent,
    WalkNotificationCoordinatorAwaitingApprovalComponent,
    WalkNotificationCoordinatorAwaitingWalkDetailsComponent,
    WalkNotificationCoordinatorDeletedComponent,
    WalkNotificationCoordinatorRequestedComponent,
    WalkNotificationCoordinatorUpdatedComponent,
    WalkNotificationDetailsComponent,
    WalkNotificationFooterComponent,
    WalkNotificationLeaderApprovedComponent,
    WalkNotificationLeaderAwaitingApprovalComponent,
    WalkNotificationLeaderAwaitingWalkDetailsComponent,
    WalkNotificationLeaderDeletedComponent,
    WalkNotificationLeaderRequestedComponent,
    WalkNotificationLeaderUpdatedComponent,
    MarkdownEditorComponent
  ],
})

export class AppModule implements DoBootstrap {
  private logger: Logger;

  constructor(private upgrade: UpgradeModule, private route: ActivatedRoute, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(AppComponent, NgxLoggerLevel.OFF);
  }

  ngDoBootstrap(appRef: ApplicationRef) {
    const legacy = getAngularJSGlobal().module("ekwgApp")
      .directive("markdownEditor", downgradeComponent({component: MarkdownEditorComponent}))
      .directive("contactUs", downgradeComponent({component: ContactUsComponent}))
      .factory("LegacyUrlService", LegacyUrlService)
      .factory("HttpResponseService", downgradeInjectable(HttpResponseService))
      .factory("NumberUtils", downgradeInjectable(NumberUtilsService))
      .factory("MemberLoginService", downgradeInjectable(MemberLoginService))
      .factory("StringUtils", downgradeInjectable(StringUtilsService))
      .factory("ContentText", downgradeInjectable(ContentTextService))
      .factory("Config", downgradeInjectable(ConfigService))
      .factory("CommitteeReferenceData", downgradeInjectable(CommitteeReferenceDataService))
      .factory("WalksReferenceService", downgradeInjectable(WalksReferenceService))
      .factory("WalksQueryService", downgradeInjectable(WalksQueryService))
      .factory("BroadcastService", downgradeInjectable(BroadcastService))
      .factory("SiteEditService", downgradeInjectable(SiteEditService))
      .factory("URLService", downgradeInjectable(UrlService))
      .factory("RouterHistoryService", downgradeInjectable(RouterHistoryService))
      .factory("DateUtils", downgradeInjectable(DateUtilsService))
      .factory("Notifier", downgradeInjectable(NotifierService));
    this.upgrade.bootstrap(document.body, [legacy.name], {strictDi: true});
    setUpLocationSync(this.upgrade);
    appRef.bootstrap(AppComponent);
  }

}
