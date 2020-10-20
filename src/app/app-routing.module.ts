import { NgModule } from "@angular/core";
import { NoPreloading, RouterModule, Routes } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { ForgotPasswordComponent } from "./login/forgot-password.component";
import { LoginComponent } from "./login/login.component";
import { LogoutComponent } from "./logout/logout.component";
import { ContactUsComponent } from "./pages/contact-us/contact-us.component";
import { HomeComponent } from "./pages/home/home.component";
import { HowToComponent } from "./pages/how-to/how-to.component";
import { PrivacyPolicyComponent } from "./pages/home/privacy-policy.component";
import { ImageEditorComponent } from "./pages/image-editor/image-editor.component";
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
  {path: "how-to", component: HowToComponent},
  {path: "how-to/:member-resource-id", component: HowToComponent},
  {path: "image-editor/:image-source", component: ImageEditorComponent},
  {path: "join-us", component: JoinUsComponent},
  {path: "login", component: LoginComponent},
  {path: "logout", component: LogoutComponent},
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
