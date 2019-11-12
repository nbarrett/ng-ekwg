import { NgModule } from "@angular/core";
import { RamblersWalksAndEventsServiceProvider, WalksServiceProvider } from "../../ajs-upgraded-providers";
import { WalkNotificationChangesComponent } from "../../notifications/walks/templates/common/walk-notification-changes.component";
import { WalkNotificationDetailsComponent } from "../../notifications/walks/templates/common/walk-notification-details.component";
import { WalkNotificationFooterComponent } from "../../notifications/walks/templates/common/walk-notification-footer.component";
import { WalkNotificationCoordinatorApprovedComponent } from "../../notifications/walks/templates/coordinator/walk-notification-coordinator-approved.component";
import { WalkNotificationCoordinatorAwaitingApprovalComponent } from "../../notifications/walks/templates/coordinator/walk-notification-coordinator-awaiting-approval.component";
import { WalkNotificationCoordinatorAwaitingWalkDetailsComponent } from "../../notifications/walks/templates/coordinator/walk-notification-coordinator-awaiting-walk-details.component";
import { WalkNotificationCoordinatorDeletedComponent } from "../../notifications/walks/templates/coordinator/walk-notification-coordinator-deleted.component";
import { WalkNotificationCoordinatorRequestedComponent } from "../../notifications/walks/templates/coordinator/walk-notification-coordinator-requested.component";
import { WalkNotificationCoordinatorUpdatedComponent } from "../../notifications/walks/templates/coordinator/walk-notification-coordinator-updated.component";
import { WalkNotificationLeaderApprovedComponent } from "../../notifications/walks/templates/leader/walk-notification-leader-approved.component";
import { WalkNotificationLeaderAwaitingApprovalComponent } from "../../notifications/walks/templates/leader/walk-notification-leader-awaiting-approval.component";
import { WalkNotificationLeaderAwaitingWalkDetailsComponent } from "../../notifications/walks/templates/leader/walk-notification-leader-awaiting-walk-details.component";
import { WalkNotificationLeaderDeletedComponent } from "../../notifications/walks/templates/leader/walk-notification-leader-deleted.component";
import { WalkNotificationLeaderRequestedComponent } from "../../notifications/walks/templates/leader/walk-notification-leader-requested.component";
import { WalkNotificationLeaderUpdatedComponent } from "../../notifications/walks/templates/leader/walk-notification-leader-updated.component";
import { WalkNotificationDirective } from "../../notifications/walks/walk-notification.directive";
import { WalkAddSlotsComponent } from "../../pages/walks/walk-add-slots/walk-add-slots.component";
import { WalkAdminComponent } from "../../pages/walks/walk-admin/walk-admin.component";
import { WalkDisplayService } from "../../pages/walks/walk-display.service";
import { WalkEditFullPageComponent } from "../../pages/walks/walk-edit-fullpage/walk-edit-full-page.component";
import { WalkEditComponent } from "../../pages/walks/walk-edit/walk-edit.component";
import { WalkExportComponent } from "../../pages/walks/walk-export/walk-export.component";
import { WalkListComponent } from "../../pages/walks/walk-list/walk-list.component";
import { WalkMeetupConfigParametersComponent } from "../../pages/walks/walk-meetup-config-parameters/walk-meetup-config-parameters.component";
import { WalkMeetupSettingsComponent } from "../../pages/walks/walk-meetup-settings/walk-meetup-settings.component";
import { WalkMeetupComponent } from "../../pages/walks/walk-meetup/walk-meetup.component";
import { WalkVenueComponent } from "../../pages/walks/walk-venue/walk-venue.component";
import { WalkViewComponent } from "../../pages/walks/walk-view/walk-view.component";
import { VenueIconPipe } from "../../pipes/venue-icon.pipe";
import { WalkEventTypePipe } from "../../pipes/walk-event-type.pipe";
import { WalkSummaryPipe } from "../../pipes/walk-summary.pipe";
import { WalkValidationsListPipe } from "../../pipes/walk-validations.pipe";
import { WalkNotificationService } from "../../services/walks/walk-notification.service";
import { SharedModule } from "../../shared-module";
import { WalksAuthGuard } from "../../walks-auth-guard.service";

@NgModule({
  declarations: [
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
    WalkViewComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    RamblersWalksAndEventsServiceProvider,
    VenueIconPipe,
    WalkEventTypePipe,
    WalkNotificationService,
    WalksAuthGuard,
    WalkDisplayService,
    WalksServiceProvider,
    WalkSummaryPipe,
    WalkValidationsListPipe
  ]
})
export class WalksModule {
}
