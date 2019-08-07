import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { JoinUsComponent } from "./pages/join-us/join-us.component";
import { NonRenderingComponent } from "./shared/non-rendering.component";
import { MailingPreferencesComponent } from "./login/mailing-preferences.component";
import { LogoutComponent } from "./logout/logout.component";
import { ForgotPasswordComponent } from "./login/forgot-password.component";
import { SetPasswordComponent } from "./login/set-password.component";
import { Logger, LoggerFactory } from "./services/logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";
import { WalkEditComponent } from "./pages/walks/walk-edit/walk-edit.component";
import { WalkListComponent } from "./pages/walks/walks-list/walk-list.component";

const routes: Routes = [
  {path: "forgot-password", component: ForgotPasswordComponent},
  {path: "mailing-preferences", component: MailingPreferencesComponent},
  {path: "set-password/:password-reset-id", component: SetPasswordComponent},
  {path: "join-us", component: JoinUsComponent},
  {path: "login", component: LoginComponent},
  {path: "logout", component: LogoutComponent},
  {path: "walks/walkId/:walk-id", component: WalkListComponent},
  {path: "walks/add", component: WalkEditComponent},
  {path: "walks/edit/:walk-id", component: WalkEditComponent},
  {path: "walks", component: WalkListComponent},
  {path: "**", component: NonRenderingComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: false, preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})

export class AppRoutingModule {
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(AppRoutingModule, NgxLoggerLevel.INFO);
  }

}
