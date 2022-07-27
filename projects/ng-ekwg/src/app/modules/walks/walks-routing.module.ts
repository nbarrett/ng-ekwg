import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { WalkAddSlotsComponent } from "../../pages/walks/walk-add-slots/walk-add-slots.component";
import { WalkAdminComponent } from "../../pages/walks/walk-admin/walk-admin.component";
import { WalkEditFullPageComponent } from "../../pages/walks/walk-edit-fullpage/walk-edit-full-page.component";
import { WalkEditComponent } from "../../pages/walks/walk-edit/walk-edit.component";
import { WalkExportComponent } from "../../pages/walks/walk-export/walk-export.component";
import { WalkListComponent } from "../../pages/walks/walk-list/walk-list.component";
import { WalkMeetupSettingsComponent } from "../../pages/walks/walk-meetup-settings/walk-meetup-settings.component";
import { WalksAuthGuard } from "../../walks-auth-guard.service";
import { WalksModule } from "./walks.module";

@NgModule({
  imports: [WalksModule, RouterModule.forChild([
    {path: "add", component: WalkEditComponent, canActivate: [WalksAuthGuard]},
    {path: "add-walk-slots", component: WalkAddSlotsComponent, canActivate: [WalksAuthGuard]},
    {path: "edit/:walk-id", component: WalkEditFullPageComponent},
    {path: "export", component: WalkExportComponent, canActivate: [WalksAuthGuard]},
    {path: "meetup-settings", component: WalkMeetupSettingsComponent, canActivate: [WalksAuthGuard]},
    {path: "admin", component: WalkAdminComponent, canActivate: [WalksAuthGuard]},
    {path: ":walk-id", component: WalkListComponent},
    {path: "admin", component: WalkAdminComponent},
    {path: "**", component: WalkListComponent},
  ])]
})
export class WalksRoutingModule {
}
