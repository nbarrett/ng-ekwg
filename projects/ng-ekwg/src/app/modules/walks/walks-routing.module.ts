import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { WalkAddSlotsComponent } from "../../pages/walks/walk-add-slots/walk-add-slots.component";
import { WalkAdminComponent } from "../../pages/walks/walk-admin/walk-admin.component";
import { WalkEditFullPageComponent } from "../../pages/walks/walk-edit-fullpage/walk-edit-full-page.component";
import { WalkEditComponent } from "../../pages/walks/walk-edit/walk-edit.component";
import { WalkExportComponent } from "../../pages/walks/walk-export/walk-export.component";
import { WalkDynamicContentComponent } from "../../pages/walks/walk-information/walk-dynamic-content";
import { WalkListComponent } from "../../pages/walks/walk-list/walk-list.component";
import { WalkMeetupSettingsComponent } from "../../pages/walks/walk-meetup-settings/walk-meetup-settings.component";
import { WalkViewComponent } from "../../pages/walks/walk-view/walk-view.component";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { PageService } from "../../services/page.service";
import { hasDynamicPath, hasMongoId } from "../../services/path-matchers";
import { StringUtilsService } from "../../services/string-utils.service";
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
    {matcher: hasMongoId, component: WalkViewComponent},
    {matcher: hasDynamicPath, component: WalkDynamicContentComponent},
    {path: "**", component: WalkListComponent},
  ])]
})
export class WalksRoutingModule {
  private logger: Logger;

  constructor(private pageService: PageService,
              private stringUtils: StringUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalksRoutingModule, NgxLoggerLevel.DEBUG);
  }
}

