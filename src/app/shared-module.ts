import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgSelectModule } from "@ng-select/ng-select";
import { Angular2CsvModule } from "angular2-csv";
import { FileUploadModule } from "ng2-file-upload";
import { AccordionModule } from "ngx-bootstrap/accordion";
import { AlertModule } from "ngx-bootstrap/alert";
import { CarouselModule } from "ngx-bootstrap/carousel";
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
import { LoggedInGuard } from "./admin-login-guard.service";
import { AuthenticationModalsServiceProvider, ClipboardServiceProvider } from "./ajs-upgraded-providers";
import { AuthInterceptor } from "./auth/auth.interceptor";
import { ContactUsDirective } from "./contact-us/contact-us-directive.component";
import { DatePickerComponent } from "./date-picker/date-picker.component";
import { MarkdownEditorComponent } from "./markdown-editor/markdown-editor.component";
import { NotificationUrlComponent } from "./notification-url/notification-url.component";
import { PageComponent } from "./page/page.component";
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
import { FormatAuditPipe } from "./pipes/format-audit-pipe";
import { FullNameWithAliasOrMePipe } from "./pipes/full-name-with-alias-or-me.pipe";
import { FullNameWithAliasPipe } from "./pipes/full-name-with-alias.pipe";
import { FullNamePipe } from "./pipes/full-name.pipe";
import { HumanisePipe } from "./pipes/humanise.pipe";
import { LastConfirmedDateDisplayed } from "./pipes/last-confirmed-date-displayed.pipe";
import { LineFeedsToBreaksPipe } from "./pipes/line-feeds-to-breaks.pipe";
import { MeetupEventSummaryPipe } from "./pipes/meetup-event-summary.pipe";
import { MemberIdToFirstNamePipe } from "./pipes/member-id-to-first-name.pipe";
import { MemberIdToFullNamePipe } from "./pipes/member-id-to-full-name.pipe";
import { MemberIdsToFullNamesPipe } from "./pipes/member-ids-to-full-names.pipe";
import { MoneyPipe } from "./pipes/money.pipe";
import { SearchFilterPipe } from "./pipes/search-filter.pipe";
import { SnakeCasePipe } from "./pipes/snakecase.pipe";
import { UpdatedAuditPipe } from "./pipes/updated-audit-pipe";
import { ValueOrDefaultPipe } from "./pipes/value-or-default.pipe";
import { BroadcastService } from "./services/broadcast-service";
import { CommitteeConfigService } from "./services/commitee-config.service";
import { CommitteeReferenceDataService } from "./services/committee/committee-reference-data.service";
import { MailchimpConfigService } from "./services/mailchimp-config.service";
import { MailchimpListSubscriptionService } from "./services/mailchimp/mailchimp-list-subscription.service";
import { NotifierService } from "./services/notifier.service";
import { RouterHistoryService } from "./services/router-history.service";
import { SiteEditService } from "./site-edit/site-edit.service";

@NgModule({
  imports: [
    AccordionModule.forRoot(),
    AlertModule.forRoot(),
    Angular2CsvModule,
    BsDatepickerModule,
    BsDatepickerModule.forRoot(),
    CarouselModule.forRoot(),
    CollapseModule.forRoot(),
    CommonModule,
    FileUploadModule,
    FormsModule,
    FormsModule,
    LoggerModule.forRoot({serverLoggingUrl: "api/logs", level: NgxLoggerLevel.OFF, serverLogLevel: NgxLoggerLevel.OFF}),
    MarkdownModule.forRoot(),
    ModalModule.forRoot(),
    NgSelectModule,
    PopoverModule.forRoot(),
    RouterModule,
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    UiSwitchModule
  ],
  declarations: [
    PanelExpanderComponent,
    AccordionGroupComponent,
    ContactUsDirective,
    CreatedAuditPipe,
    FormatAuditPipe,
    DatePickerComponent,
    DisplayDateAndTimePipe,
    DisplayDatePipe,
    DisplayDatesPipe,
    LineFeedsToBreaksPipe,
    DisplayDayPipe,
    EventNotePipe,
    FullNamePipe,
    FullNameWithAliasOrMePipe,
    FullNameWithAliasPipe,
    HumanisePipe,
    LastConfirmedDateDisplayed,
    MarkdownEditorComponent,
    MeetupEventSummaryPipe,
    MemberIdsToFullNamesPipe,
    MemberIdToFirstNamePipe,
    MemberIdToFullNamePipe,
    MoneyPipe,
    NotificationUrlComponent,
    PageComponent,
    SearchFilterPipe,
    SnakeCasePipe,
    UpdatedAuditPipe,
    ValueOrDefaultPipe
  ],
  exports: [
    AccordionGroupComponent,
    AccordionModule,
    AlertModule,
    Angular2CsvModule,
    BsDatepickerModule,
    CarouselModule,
    CollapseModule,
    CommonModule,
    ContactUsDirective,
    CreatedAuditPipe,
    DatePickerComponent,
    DisplayDateAndTimePipe,
    DisplayDatePipe,
    DisplayDatesPipe,
    DisplayDayPipe,
    EventNotePipe,
    FileUploadModule,
    FormsModule,
    FullNamePipe,
    FullNameWithAliasOrMePipe,
    FullNameWithAliasPipe,
    HumanisePipe,
    LastConfirmedDateDisplayed,
    LoggerModule,
    LineFeedsToBreaksPipe,
    MarkdownEditorComponent,
    MarkdownModule,
    MeetupEventSummaryPipe,
    MemberIdsToFullNamesPipe,
    MemberIdToFirstNamePipe,
    MemberIdToFullNamePipe,
    ModalModule,
    MoneyPipe,
    NgSelectModule,
    NotificationUrlComponent,
    PageComponent,
    PanelExpanderComponent,
    PopoverModule,
    RouterModule,
    SearchFilterPipe,
    SnakeCasePipe,
    TabsModule,
    TooltipModule,
    UiSwitchModule,
    UpdatedAuditPipe,
    ValueOrDefaultPipe
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        AuditDeltaChangedItemsPipePipe,
        AuditDeltaValuePipe,
        AuthenticationModalsServiceProvider,
        BroadcastService,
        ChangedItemsPipe,
        ClipboardServiceProvider,
        CommitteeConfigService,
        CommitteeReferenceDataService,
        CookieService,
        CustomNGXLoggerService,
        DisplayDateAndTimePipe,
        DisplayDatePipe,
        DisplayDatesPipe,
        LineFeedsToBreaksPipe,
        DisplayDayPipe,
        EventNotePipe,
        FullNamePipe,
        FullNameWithAliasOrMePipe,
        FullNameWithAliasPipe,
        HumanisePipe,
        LastConfirmedDateDisplayed,
        LoggedInGuard,
        MailchimpConfigService,
        MailchimpListSubscriptionService,
        MeetupEventSummaryPipe,
        MemberIdsToFullNamesPipe,
        MemberIdToFullNamePipe,
        NotifierService,
        RouterHistoryService,
        SearchFilterPipe,
        SiteEditService,
        SnakeCasePipe,
        UpdatedAuditPipe,
        ValueOrDefaultPipe,
        {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
      ]
    };
  }
}
