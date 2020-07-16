import { NgModule } from "@angular/core";
import { CommitteeNotificationDetailsComponent } from "../../notifications/committee/templates/committee-notification-details.component";
import { CommitteeHomeComponent } from "../../pages/committee/admin/committee-home.component";
import { CommitteeEditFileModalComponent } from "../../pages/committee/edit/committee-edit-file-modal.component";
import { CommitteeGeneralComponent } from "../../pages/committee/general/committee-general.component";
import { CommitteeHistoryComponent } from "../../pages/committee/history/committee-history.component";
import { CommitteeNotificationSettingsModalComponent } from "../../pages/committee/notification-settings/committee-notification-settings-modal.component";
import { CommitteeRightColumnComponent } from "../../pages/committee/right-column/committee-right-column.component";
import { CommitteeSendNotificationModalComponent } from "../../pages/committee/send-notification/committee-send-notification-modal.component";
import { LineFeedsToBreaksPipe } from "../../pipes/line-feeds-to-breaks.pipe";
import { SharedModule } from "../../shared-module";
import { CommitteeAuthGuardService } from "./committee-auth-guard.service";

@NgModule({
  declarations: [
    CommitteeSendNotificationModalComponent,
    CommitteeNotificationDetailsComponent,
    CommitteeHistoryComponent,
    CommitteeRightColumnComponent,
    CommitteeNotificationSettingsModalComponent,
    CommitteeEditFileModalComponent,
    CommitteeGeneralComponent,
    CommitteeHomeComponent,
    LineFeedsToBreaksPipe
  ],
  imports: [
    SharedModule
  ],
  providers: [
    CommitteeAuthGuardService,
    LineFeedsToBreaksPipe,
  ]
})
export class CommitteeModule {
}
