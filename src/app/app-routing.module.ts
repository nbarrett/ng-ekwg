import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { ForgotPasswordComponent } from "./login/forgot-password.component";
import { LoginComponent } from "./login/login.component";
import { MailingPreferencesComponent } from "./login/mailing-preferences.component";
import { SetPasswordComponent } from "./login/set-password.component";
import { LogoutComponent } from "./logout/logout.component";
import { ContactUsComponent } from "./pages/contact-us/contact-us.component";
import { HomeComponent } from "./pages/home/home.component";
import { PrivacyPolicyComponent } from "./pages/home/privacy-policy.component";
import { JoinUsComponent } from "./pages/join-us/join-us.component";
import { WalkAddSlotsComponent } from "./pages/walks/walk-add-slots/walk-add-slots.component";
import { WalkEditFullPageComponent } from "./pages/walks/walk-edit-fullpage/walk-edit-full-page.component";
import { WalkEditComponent } from "./pages/walks/walk-edit/walk-edit.component";
import { WalkExportComponent } from "./pages/walks/walk-export/walk-export.component";
import { WalkListComponent } from "./pages/walks/walk-list/walk-list.component";
import { WalkMeetupSettingsComponent } from "./pages/walks/walk-meetup-settings/walk-meetup-settings.component";
import { Logger, LoggerFactory } from "./services/logger-factory.service";
import { NonRenderingComponent } from "./shared/non-rendering.component";
import { WalksAuthGuard } from "./walks-auth-guard.service";

const routes: Routes = [
  {path: "admin", loadChildren: () => import("./admin/admin-routing.module").then(module => module.AdminRoutingModule)},
  {path: "privacy-policy", component: PrivacyPolicyComponent},
  {path: "home", component: HomeComponent},
  {path: "", component: HomeComponent},
  {path: "forgot-password", component: ForgotPasswordComponent},
  {path: "mailing-preferences", component: MailingPreferencesComponent},
  {path: "set-password/:password-reset-id", component: SetPasswordComponent},
  {path: "join-us", component: JoinUsComponent},
  {path: "contact-us", component: ContactUsComponent},
  {path: "login", component: LoginComponent},
  {path: "logout", component: LogoutComponent},
  {path: "walks/walkId/:walk-id", component: WalkListComponent},
  {path: "walks/add", component: WalkEditComponent, canActivate: [WalksAuthGuard]},
  {path: "walks/edit/:walk-id", component: WalkEditFullPageComponent},
  {path: "walks/export", component: WalkExportComponent, canActivate: [WalksAuthGuard]},
  {path: "walks/add-walk-slots", component: WalkAddSlotsComponent, canActivate: [WalksAuthGuard]},
  {path: "walks/meetup-settings", component: WalkMeetupSettingsComponent, canActivate: [WalksAuthGuard]},
  {path: "walks", component: WalkListComponent},
  {path: "**", redirectTo: "", pathMatch: "full", component: NonRenderingComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: false, preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})

export class AppRoutingModule {
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(AppRoutingModule, NgxLoggerLevel.OFF);
  }

}
