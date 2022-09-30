import { NgModule } from "@angular/core";
import { NoPreloading, RouterModule, Routes } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { NewBrandHomeComponent } from "./home-page/new-brand-home";
import { ForgotPasswordComponent } from "./login/forgot-password.component";
import { LoginComponent } from "./login/login.component";
import { LogoutComponent } from "./logout/logout.component";
import { ContactUsPageComponent } from "./pages/contact-us/contact-us-page.component";
import { HomeComponent } from "./pages/home/home.component";
import { PrivacyPolicyComponent } from "./pages/home/privacy-policy.component";
import { HowToComponent } from "./pages/how-to/how-to.component";
import { ImageListComponent } from "./pages/image-editor/image-list/image-list.component";
import { JoinUsComponent } from "./pages/join-us/join-us.component";
import { Logger, LoggerFactory } from "./services/logger-factory.service";

const routes: Routes = [
  {path: "", component: HomeComponent},
  {path: "admin", loadChildren: () => import("./modules/admin/admin-routing.module").then(module => module.AdminRoutingModule)},
  {path: "committee", loadChildren: () => import("./modules/committee/committee-routing.module").then(module => module.CommitteeRoutingModule)},
  {path: "contact-us", component: ContactUsPageComponent},
  {path: "forgot-password", component: ForgotPasswordComponent},
  {path: "home", component: HomeComponent},
  {path: "how-to", component: HowToComponent},
  {path: "how-to/:member-resource-id", component: HowToComponent},
  {path: "image-editor/:image-source", component: ImageListComponent},
  {path: "join-us", component: JoinUsComponent},
  {path: "login", component: LoginComponent},
  {path: "logout", component: LogoutComponent},
  {path: "privacy-policy", component: PrivacyPolicyComponent},
  {path: "new-brand", component: NewBrandHomeComponent},
  {path: "social", loadChildren: () => import("./modules/social/social-routing.module").then(module => module.SocialRoutingModule)},
  {path: "walks", loadChildren: () => import("./modules/walks/walks-routing.module").then(module => module.WalksRoutingModule)},
  {path: "**", redirectTo: "/"},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false, preloadingStrategy: NoPreloading, relativeLinkResolution: "legacy" })],
  exports: [RouterModule]
})

export class AppRoutingModule {
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(AppRoutingModule, NgxLoggerLevel.OFF);
  }

}
