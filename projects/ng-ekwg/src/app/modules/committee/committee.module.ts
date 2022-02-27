import { NgModule } from "@angular/core";
import { CommitteeNotificationDirective } from "../../notifications/committee/committee-notification.directive";
import { CommitteeNotificationDetailsComponent } from "../../notifications/committee/templates/committee-notification-details.component";
import { CommitteeEditFileModalComponent } from "../../pages/committee/edit/committee-edit-file-modal.component";
import { CommitteeGeneralComponent } from "../../pages/committee/general/committee-general.component";
import { CommitteeHistoryComponent } from "../../pages/committee/history/committee-history.component";
import { CommitteeHomeComponent } from "../../pages/committee/home/committee-home.component";
import { CommitteeNotificationSettingsModalComponent } from "../../pages/committee/notification-settings/committee-notification-settings-modal.component";
import { CommitteeRightColumnComponent } from "../../pages/committee/right-column/committee-right-column.component";
import { CommitteeSendNotificationModalComponent } from "../../pages/committee/send-notification/committee-send-notification-modal.component";
import { SharedModule } from "../../shared-module";

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
    CommitteeNotificationDirective,
  ],
  imports: [
    SharedModule,
  ],
  providers: [
  ]
})
export class CommitteeModule {
}
