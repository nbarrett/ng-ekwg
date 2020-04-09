import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MarkdownModule } from "ngx-markdown";
import { MarkdownEditorComponent } from "./markdown-editor/markdown-editor.component";
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
import { MemberIdToFullNamePipe } from "./pipes/member-id-to-full-name.pipe";
import { MemberIdsToFullNamesPipe } from "./pipes/member-ids-to-full-names.pipe";
import { SearchFilterPipe } from "./pipes/search-filter.pipe";
import { SnakeCasePipe } from "./pipes/snakecase.pipe";
import { UpdatedAuditPipe } from "./pipes/updated-audit-pipe";
import { ValueOrDefaultPipe } from "./pipes/value-or-default.pipe";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule.forRoot()],
  declarations: [MarkdownEditorComponent,
    DisplayDateAndTimePipe,
    DisplayDatePipe,
    DisplayDatesPipe,
    DisplayDayPipe,
    EventNotePipe,
    FullNamePipe,
    FullNameWithAliasOrMePipe,
    FullNameWithAliasPipe,
    HumanisePipe,
    LastConfirmedDateDisplayed,
    MeetupEventSummaryPipe,
    MemberIdsToFullNamesPipe,
    MemberIdToFullNamePipe,
    SearchFilterPipe,
    SnakeCasePipe,
    UpdatedAuditPipe,
    ValueOrDefaultPipe,
  ],
  exports: [
    CommonModule,
    MarkdownEditorComponent,
    DisplayDateAndTimePipe,
    DisplayDatePipe,
    DisplayDatesPipe,
    DisplayDayPipe,
    EventNotePipe,
    FullNamePipe,
    FullNameWithAliasOrMePipe,
    FullNameWithAliasPipe,
    HumanisePipe,
    LastConfirmedDateDisplayed,
    MeetupEventSummaryPipe,
    MemberIdsToFullNamesPipe,
    MemberIdToFullNamePipe,
    SearchFilterPipe,
    SnakeCasePipe,
    UpdatedAuditPipe,
    ValueOrDefaultPipe],
  entryComponents: [],
  providers: [DisplayDateAndTimePipe,
    DisplayDatePipe,
    DisplayDatesPipe,
    DisplayDayPipe,
    EventNotePipe,
    FullNamePipe,
    FullNameWithAliasOrMePipe,
    FullNameWithAliasPipe,
    HumanisePipe,
    LastConfirmedDateDisplayed,
    MeetupEventSummaryPipe,
    MemberIdsToFullNamesPipe,
    MemberIdToFullNamePipe,
    SearchFilterPipe,
    SnakeCasePipe,
    UpdatedAuditPipe,
    ValueOrDefaultPipe]
})
export class SharedModule {
}
