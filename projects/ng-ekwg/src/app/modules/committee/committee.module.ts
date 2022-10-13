import { NgModule } from "@angular/core";
import { CommitteeNotificationDirective } from "../../notifications/committee/committee-notification.directive";
import { CommitteeNotificationDetailsComponent } from "../../notifications/committee/templates/committee-notification-details.component";
import { CommitteeEditFileModalComponent } from "../../pages/committee/edit/committee-edit-file-modal.component";
import { CommitteeListYearsComponent } from "../../pages/committee/general/committee-list-years";
import { CommitteeYearComponent } from "../../pages/committee/year/committee-year.component";
import { CommitteeHomeComponent } from "../../pages/committee/home/committee-home.component";
import { CommitteeNotificationSettingsComponent } from "../../pages/committee/notification-settings/committee-notification-settings.component";
import { CommitteeCardComponent } from "../../pages/committee/card/committee-card.component";
import { CommitteeSendNotificationComponent } from "../../pages/committee/send-notification/committee-send-notification.component";
import { SharedModule } from "../../shared-module";

@NgModule({
  declarations: [
    CommitteeSendNotificationComponent,
    CommitteeNotificationDetailsComponent,
    CommitteeYearComponent,
    CommitteeCardComponent,
    CommitteeNotificationSettingsComponent,
    CommitteeEditFileModalComponent,
    CommitteeListYearsComponent,
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
