import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommitteeHomeComponent } from "../../pages/committee/home/committee-home.component";
import { CommitteeNotificationSettingsComponent } from "../../pages/committee/notification-settings/committee-notification-settings.component";
import { CommitteeSendNotificationComponent } from "../../pages/committee/send-notification/committee-send-notification.component";
import { LetterheadComponent } from "../../pages/letterhead/letterhead.component";
import { hasDynamicPath, hasMongoId } from "../../services/path-matchers";
import { DynamicContentPageComponent } from "../common/dynamic-content-page/dynamic-content-page";
import { CommitteeModule } from "./committee.module";

@NgModule({
  imports: [CommitteeModule, RouterModule.forChild([
    {path: "configure-letterheads", component: LetterheadComponent},
    {path: "send-email", component: CommitteeSendNotificationComponent},
    {path: "campaign-settings", component: CommitteeNotificationSettingsComponent},
    {matcher: hasMongoId, component: CommitteeHomeComponent},
    {matcher: hasDynamicPath, component: DynamicContentPageComponent},
    {path: "**", component: CommitteeHomeComponent}
  ])]
})
export class CommitteeRoutingModule {
}
