import { NgModule } from "@angular/core";
import { NoPreloading, RouterModule, Routes } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { ForgotPasswordComponent } from "./login/forgot-password.component";
import { LoginComponent } from "./login/login.component";
import { MailingPreferencesComponent } from "./login/mailing-preferences.component";
import { LogoutComponent } from "./logout/logout.component";
import { ContactUsComponent } from "./pages/contact-us/contact-us.component";
import { HomeComponent } from "./pages/home/home.component";
import { PrivacyPolicyComponent } from "./pages/home/privacy-policy.component";
import { JoinUsComponent } from "./pages/join-us/join-us.component";
import { Logger, LoggerFactory } from "./services/logger-factory.service";
import { NonRenderingComponent } from "./shared/non-rendering.component";

const routes: Routes = [
  {path: "", component: HomeComponent},
  {path: "admin", loadChildren: () => import("./modules/admin/admin-routing.module").then(module => module.AdminRoutingModule)},
  {path: "committee", loadChildren: () => import("./modules/committee/committee-routing.module").then(module => module.CommitteeRoutingModule)},
  {path: "contact-us", component: ContactUsComponent},
  {path: "forgot-password", component: ForgotPasswordComponent},
  {path: "home", component: HomeComponent},
  {path: "join-us", component: JoinUsComponent},
  {path: "login", component: LoginComponent},
  {path: "logout", component: LogoutComponent},
  {path: "mailing-preferences", component: MailingPreferencesComponent},
  {path: "privacy-policy", component: PrivacyPolicyComponent},
  {path: "social", loadChildren: () => import("./modules/social/social-routing.module").then(module => module.SocialRoutingModule)},
  {path: "walks", loadChildren: () => import("./modules/walks/walks-routing.module").then(module => module.WalksRoutingModule)},
  {path: "**", component: NonRenderingComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: false, preloadingStrategy: NoPreloading})],
  exports: [RouterModule]
})

export class AppRoutingModule {
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(AppRoutingModule, NgxLoggerLevel.OFF);
  }

}
