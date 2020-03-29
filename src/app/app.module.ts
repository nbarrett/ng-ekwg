import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ApplicationRef, DoBootstrap, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute } from "@angular/router";
import { setUpLocationSync } from "@angular/router/upgrade";
import { downgradeComponent, downgradeInjectable, getAngularJSGlobal, UpgradeModule } from "@angular/upgrade/static";
import { NgSelectModule } from "@ng-select/ng-select";
import { Angular2CsvModule } from "angular2-csv";
import { FileUploadModule } from "ng2-file-upload";
import { AccordionModule } from "ngx-bootstrap/accordion";
import { AlertModule } from "ngx-bootstrap/alert";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { ModalModule } from "ngx-bootstrap/modal";
import { PopoverModule } from "ngx-bootstrap/popover";
import { TabsModule } from "ngx-bootstrap/tabs";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { CookieService } from "ngx-cookie-service";
import { CustomNGXLoggerService, LoggerModule, NgxLoggerLevel } from "ngx-logger";
import { MarkdownModule } from "ngx-markdown";
import { UiSwitchModule } from "ngx-ui-switch";
import { AccordionGroupComponent } from "./accordion/accordion-group.component";
import { AdminAuthGuard } from "./admin-auth-guard.service";
import { LoggedInGuard } from "./admin-login-guard.service";
import {
  AuthenticationModalsServiceProvider,
  ClipboardServiceProvider,
  LegacyUrlService,
  RamblersUploadAuditProvider,
  RamblersWalksAndEventsServiceProvider,
  WalksServiceProvider
} from "./ajs-upgraded-providers";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AuthInterceptor } from "./auth/auth.interceptor";
import { ContactUsDirective } from "./contact-us/contact-us-directive.component";
import { DatePickerComponent } from "./date-picker/date-picker.component";
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
import { ExpenseNotificationDirective } from "./notifications/expenses/expense-notification.directive";
import { ExpenseNotificationApproverFirstApprovalComponent } from "./notifications/expenses/templates/approver/expense-notification-approver-first-approval.component";
import { ExpenseNotificationApproverPaidComponent } from "./notifications/expenses/templates/approver/expense-notification-approver-paid.component";
import { ExpenseNotificationApproverReturnedComponent } from "./notifications/expenses/templates/approver/expense-notification-approver-returned.component";
import { ExpenseNotificationApproverSecondApprovalComponent } from "./notifications/expenses/templates/approver/expense-notification-approver-second-approval.component";
import { ExpenseNotificationApproverSubmittedComponent } from "./notifications/expenses/templates/approver/expense-notification-approver-submitted.component";
import { ExpenseNotificationDetailsComponent } from "./notifications/expenses/templates/common/expense-notification-details.component";
import { ExpenseNotificationCreatorPaidComponent } from "./notifications/expenses/templates/creator/expense-notification-creator-paid.component";
import { ExpenseNotificationCreatorReturnedComponent } from "./notifications/expenses/templates/creator/expense-notification-creator-returned.component";
import { ExpenseNotificationCreatorSecondApprovalComponent } from "./notifications/expenses/templates/creator/expense-notification-creator-second-approval.component";
import { ExpenseNotificationCreatorSubmittedComponent } from "./notifications/expenses/templates/creator/expense-notification-creator-submitted.component";
import { ExpenseNotificationTreasurerPaidComponent } from "./notifications/expenses/templates/treasurer/expense-notification-treasurer-paid.component";
import { ExpenseNotificationTreasurerSecondApprovalComponent } from "./notifications/expenses/templates/treasurer/expense-notification-treasurer-second-approval.component";
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
import { WalkNotificationDirective } from "./notifications/walks/walk-notification.directive";
import { PageNavigatorComponent } from "./page-navigator/page-navigator.component";
import { PageTitleComponent } from "./page-title/page-title.component";
import { PageComponent } from "./page/page.component";
import { AdminComponent } from "./pages/admin/admin/admin.component";
import { ExpensesComponent } from "./pages/admin/expenses/expenses.component";
import { ExpenseDetailModalComponent } from "./pages/admin/expenses/modals/expense-detail-modal.component";
import { ExpensePaidModalComponent } from "./pages/admin/expenses/modals/expense-paid-modal.component";
import { ExpenseReturnModalComponent } from "./pages/admin/expenses/modals/expense-return-modal.component";
import { ExpenseSubmitModalComponent } from "./pages/admin/expenses/modals/expense-submit-modal.component";
import { MemberAdminModalComponent } from "./pages/admin/member-admin-modal/member-admin-modal.component";
import { MemberAdminComponent } from "./pages/admin/member-admin/member-admin.component";
import { MemberBulkLoadComponent } from "./pages/admin/member-bulk-load/member-bulk-load.component";
import { MemberLoginAuditComponent } from "./pages/admin/member-login-audit/member-login-audit.component";
import { ChangePasswordComponent } from "./pages/admin/profile/change-password.component";
import { ContactDetailsComponent } from "./pages/admin/profile/contact-details.component";
import { EmailSubscriptionsComponent } from "./pages/admin/profile/email-subscriptions.component";
import { SendEmailsModalComponent } from "./pages/admin/send-emails/send-emails-modal.component";
import { ContactUsComponent } from "./pages/contact-us/contact-us.component";
import { JoinUsComponent } from "./pages/join-us/join-us.component";
import { ForgotPasswordModalComponent } from "./pages/login/forgot-password-modal/forgot-password-modal.component";
import { LoginModalComponent } from "./pages/login/login-modal/login-modal.component";
import { ResetPasswordModalComponent } from "./pages/login/reset-password-modal/reset-password-modal.component";
import { WalkAddSlotsComponent } from "./pages/walks/walk-add-slots/walk-add-slots.component";
import { WalkAdminComponent } from "./pages/walks/walk-admin/walk-admin.component";
import { WalkEditFullPageComponent } from "./pages/walks/walk-edit-fullpage/walk-edit-full-page.component";
import { WalkEditComponent } from "./pages/walks/walk-edit/walk-edit.component";
import { WalkExportComponent } from "./pages/walks/walk-export/walk-export.component";
import { WalkListComponent } from "./pages/walks/walk-list/walk-list.component";
import { WalkMeetupConfigParametersComponent } from "./pages/walks/walk-meetup-config-parameters/walk-meetup-config-parameters.component";
import { WalkMeetupSettingsComponent } from "./pages/walks/walk-meetup-settings/walk-meetup-settings.component";
import { WalkMeetupComponent } from "./pages/walks/walk-meetup/walk-meetup.component";
import { WalkVenueComponent } from "./pages/walks/walk-venue/walk-venue.component";
import { WalkViewComponent } from "./pages/walks/walk-view/walk-view.component";
import { PanelExpanderComponent } from "./panel-expander/panel-expander.component";
import { AuditDeltaChangedItemsPipePipe } from "./pipes/audit-delta-changed-items.pipe";
import { AuditDeltaValuePipe } from "./pipes/audit-delta-value.pipe";
import { ChangedItemsPipe } from "./pipes/changed-items.pipe";
import { CreatedAuditPipe } from "./pipes/created-audit-pipe";
import { DisplayDateAndTimePipe } from "./pipes/display-date-and-time.pipe";
import { DisplayDatePipe } from "./pipes/display-date.pipe";
import { DisplayDatesPipe } from "./pipes/display-dates.pipe";
import { DisplayDayPipe } from "./pipes/display-day.pipe";
import { EventNotePipe } from "./pipes/event-note.pipe";
import { FullNameWithAliasOrMePipe } from "./pipes/full-name-with-alias-or-me.pipe";
import { FullNameWithAliasPipe } from "./pipes/full-name-with-alias.pipe";
import { FullNamePipe } from "./pipes/full-name.pipe";
import { HumanisePipe } from "./pipes/humanise.pipe";
import { LastConfirmedDateDisplayed } from "./pipes/last-confirmed-date-displayed.pipe";
import { MeetupEventSummaryPipe } from "./pipes/meetup-event-summary.pipe";
import { MemberIdToFirstNamePipe } from "./pipes/member-id-to-first-name.pipe";
import { MemberIdToFullNamePipe } from "./pipes/member-id-to-full-name.pipe";
import { MemberIdsToFullNamesPipe } from "./pipes/member-ids-to-full-names.pipe";
import { MoneyPipe } from "./pipes/money.pipe";
import { SearchFilterPipe } from "./pipes/search-filter.pipe";
import { SnakeCasePipe } from "./pipes/snakecase.pipe";
import { UpdatedAuditPipe } from "./pipes/updated-audit-pipe";
import { ValueOrDefaultPipe } from "./pipes/value-or-default.pipe";
import { VenueIconPipe } from "./pipes/venue-icon.pipe";
import { WalkEventTypePipe } from "./pipes/walk-event-type.pipe";
import { WalkSummaryPipe } from "./pipes/walk-summary.pipe";
import { WalkValidationsListPipe } from "./pipes/walk-validations.pipe";
import { BroadcastService } from "./services/broadcast-service";
import { CommitteeConfigService } from "./services/commitee-config.service";
import { CommitteeReferenceDataService } from "./services/committee/committee-reference-data.service";
import { ConfigService } from "./services/config.service";
import { ContentMetadataService } from "./services/content-metadata.service";
import { DateUtilsService } from "./services/date-utils.service";
import { DbUtilsService } from "./services/db-utils.service";
import { HttpResponseService } from "./services/http-response.service";
import { Logger, LoggerFactory } from "./services/logger-factory.service";
import { MailchimpConfigService } from "./services/mailchimp-config.service";
import { MailchimpCampaignService } from "./services/mailchimp/mailchimp-campaign.service";
import { MailchimpListSubscriptionService } from "./services/mailchimp/mailchimp-list-subscription.service";
import { MailchimpSegmentService } from "./services/mailchimp/mailchimp-segment.service";
import { MemberLoginService } from "./services/member/member-login.service";
import { MemberService } from "./services/member/member.service";
import { NotifierService } from "./services/notifier.service";
import { NumberUtilsService } from "./services/number-utils.service";
import { PageService } from "./services/page.service";
import { ProfileConfirmationService } from "./services/profile-confirmation.service";
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

@NgModule({
  declarations: [
    AccordionGroupComponent,
    AdminComponent,
    AppComponent,
    AuditDeltaChangedItemsPipePipe,
    AuditDeltaValuePipe,
    AuditDeltaValuePipe,
    ChangedItemsPipe,
    ContactUsComponent,
    ContactUsDirective,
    CreatedAuditPipe,
    DatePickerComponent,
    DisplayDateAndTimePipe,
    DisplayDatePipe,
    DisplayDatesPipe,
    DisplayDayPipe,
    EmailSubscriptionsComponent,
    EventNotePipe,
    ExpenseDetailModalComponent,
    ExpenseNotificationApproverFirstApprovalComponent,
    ExpenseNotificationApproverPaidComponent,
    ExpenseNotificationApproverReturnedComponent,
    ExpenseNotificationApproverSecondApprovalComponent,
    ExpenseNotificationApproverSubmittedComponent,
    ExpenseNotificationCreatorPaidComponent,
    ExpenseNotificationCreatorReturnedComponent,
    ExpenseNotificationCreatorSecondApprovalComponent,
    ExpenseNotificationCreatorSubmittedComponent,
    ExpenseNotificationDetailsComponent,
    ExpenseNotificationDirective,
    ExpenseNotificationTreasurerPaidComponent,
    ExpenseNotificationTreasurerSecondApprovalComponent,
    ExpensePaidModalComponent,
    ExpenseReturnModalComponent,
    ExpensesComponent,
    ExpenseSubmitModalComponent,
    ForgotPasswordComponent,
    ForgotPasswordModalComponent,
    FullNamePipe,
    FullNameWithAliasOrMePipe,
    FullNameWithAliasPipe,
    HumanisePipe,
    JoinUsComponent,
    LastConfirmedDateDisplayed,
    LoginComponent,
    ChangePasswordComponent,
    LoginModalComponent,
    LoginPanelComponent,
    LogoutComponent,
    MailingPreferencesComponent,
    MainLogoComponent,
    MainTitleComponent,
    MarkdownEditorComponent,
    MeetupDescriptionComponent,
    MeetupEventSummaryPipe,
    MemberAdminComponent,
    MemberAdminModalComponent,
    MemberBulkLoadComponent,
    MemberIdsToFullNamesPipe,
    MemberIdToFirstNamePipe,
    MemberIdToFullNamePipe,
    MemberLoginAuditComponent,
    MoneyPipe,
    NonRenderingComponent,
    NotificationUrlComponent,
    PageComponent,
    PageNavigatorComponent,
    PageTitleComponent,
    PanelExpanderComponent,
    ContactDetailsComponent,
    ResetPasswordModalComponent,
    SearchFilterPipe,
    SendEmailsModalComponent,
    SetPasswordComponent,
    SiteEditComponent,
    SiteNavigatorComponent,
    SnakeCasePipe,
    UpdatedAuditPipe,
    ValueOrDefaultPipe,
    VenueIconPipe,
    WalkAddSlotsComponent,
    WalkAdminComponent,
    WalkEditComponent,
    WalkEditFullPageComponent,
    WalkEventTypePipe,
    WalkExportComponent,
    WalkListComponent,
    WalkMeetupComponent,
    WalkMeetupConfigParametersComponent,
    WalkMeetupSettingsComponent,
    WalkNotificationChangesComponent,
    WalkNotificationCoordinatorApprovedComponent,
    WalkNotificationCoordinatorAwaitingApprovalComponent,
    WalkNotificationCoordinatorAwaitingWalkDetailsComponent,
    WalkNotificationCoordinatorDeletedComponent,
    WalkNotificationCoordinatorRequestedComponent,
    WalkNotificationCoordinatorUpdatedComponent,
    WalkNotificationDetailsComponent,
    WalkNotificationDirective,
    WalkNotificationFooterComponent,
    WalkNotificationLeaderApprovedComponent,
    WalkNotificationLeaderAwaitingApprovalComponent,
    WalkNotificationLeaderAwaitingWalkDetailsComponent,
    WalkNotificationLeaderDeletedComponent,
    WalkNotificationLeaderRequestedComponent,
    WalkNotificationLeaderUpdatedComponent,
    WalkSummaryPipe,
    WalkValidationsListPipe,
    WalkVenueComponent,
    WalkViewComponent,
  ],
  imports: [
    AccordionModule.forRoot(),
    AlertModule.forRoot(),
    Angular2CsvModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    BsDatepickerModule.forRoot(),
    CollapseModule.forRoot(),
    FileUploadModule,
    HttpClientModule,
    LoggerModule.forRoot({serverLoggingUrl: "api/logs", level: NgxLoggerLevel.OFF, serverLogLevel: NgxLoggerLevel.OFF}),
    MarkdownModule.forRoot(),
    ModalModule.forRoot(),
    NgSelectModule,
    PopoverModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    UiSwitchModule,
    UpgradeModule,
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    AdminAuthGuard,
    AuditDeltaChangedItemsPipePipe,
    AuditDeltaValuePipe,
    AuthenticationModalsServiceProvider,
    BroadcastService,
    ChangedItemsPipe,
    ClipboardServiceProvider,
    CommitteeConfigService,
    CommitteeReferenceDataService,
    CookieService,
    CreatedAuditPipe,
    CustomNGXLoggerService,
    DisplayDateAndTimePipe,
    DisplayDatePipe,
    DisplayDatesPipe,
    DisplayDayPipe,
    MailchimpListSubscriptionService,
    EventNotePipe,
    FullNamePipe,
    FullNameWithAliasOrMePipe,
    FullNameWithAliasPipe,
    HumanisePipe,
    LastConfirmedDateDisplayed,
    LoggedInGuard,
    MailchimpConfigService,
    MeetupEventSummaryPipe,
    MemberIdsToFullNamesPipe,
    MemberIdToFullNamePipe,
    NotifierService,
    RamblersUploadAuditProvider,
    RamblersWalksAndEventsServiceProvider,
    RouterHistoryService,
    SearchFilterPipe,
    SiteEditService,
    SnakeCasePipe,
    UpdatedAuditPipe,
    ValueOrDefaultPipe,
    VenueIconPipe,
    WalkEventTypePipe,
    WalkNotificationService,
    WalksAuthGuard,
    WalksServiceProvider,
    WalkSummaryPipe,
    WalkValidationsListPipe,
  ],
  entryComponents: [
    AppComponent,
    ContactUsDirective,
    ExpenseDetailModalComponent,
    ExpenseNotificationApproverFirstApprovalComponent,
    ExpenseNotificationApproverPaidComponent,
    ExpenseNotificationApproverReturnedComponent,
    ExpenseNotificationApproverSecondApprovalComponent,
    ExpenseNotificationApproverSubmittedComponent,
    ExpenseNotificationApproverSubmittedComponent,
    ExpenseNotificationCreatorPaidComponent,
    ExpenseNotificationCreatorReturnedComponent,
    ExpenseNotificationCreatorSecondApprovalComponent,
    ExpenseNotificationCreatorSubmittedComponent,
    ExpenseNotificationDetailsComponent,
    ExpenseNotificationTreasurerPaidComponent,
    ExpenseNotificationTreasurerSecondApprovalComponent,
    ExpensePaidModalComponent,
    ExpenseReturnModalComponent,
    ExpenseSubmitModalComponent,
    ForgotPasswordModalComponent,
    LoginModalComponent,
    MarkdownEditorComponent,
    MeetupDescriptionComponent,
    MemberAdminModalComponent,
    ResetPasswordModalComponent,
    SendEmailsModalComponent,
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
      .directive("contactUs", downgradeComponent({component: ContactUsDirective}))
      .factory("LegacyUrlService", LegacyUrlService)
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
      .factory("CommitteeReferenceData", downgradeInjectable(CommitteeReferenceDataService))
      .factory("WalksReferenceService", downgradeInjectable(WalksReferenceService))
      .factory("WalksQueryService", downgradeInjectable(WalksQueryService))
      .factory("BroadcastService", downgradeInjectable(BroadcastService))
      .factory("SiteEditService", downgradeInjectable(SiteEditService))
      .factory("MailchimpSegmentService", downgradeInjectable(MailchimpSegmentService))
      .factory("MailchimpCampaignService", downgradeInjectable(MailchimpCampaignService))
      .factory("MailchimpConfig", downgradeInjectable(MailchimpConfigService))
      .factory("URLService", downgradeInjectable(UrlService))
      .factory("RouterHistoryService", downgradeInjectable(RouterHistoryService))
      .factory("DateUtils", downgradeInjectable(DateUtilsService))
      .factory("Notifier", downgradeInjectable(NotifierService));
    this.upgrade.bootstrap(document.body, [legacy.name], {strictDi: true});
    setUpLocationSync(this.upgrade, "path");
    appRef.bootstrap(AppComponent);
  }

}
