import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { JoinUsComponent } from "./pages/join-us/join-us.component";
import { NonRenderingComponent } from "./shared/non-rendering.component";
import { MailingPreferencesComponent } from "./login/mailing-preferences.component";
import { LogoutComponent } from "./logout/logout.component";
import { ForgotPasswordComponent } from "./login/forgot-password.component";
import { SetPasswordComponent } from "./login/set-password.component";

const routes: Routes = [
  {path: "forgot-password", component: ForgotPasswordComponent},
  {path: "mailing-preferences", component: MailingPreferencesComponent},
  {path: "set-password/:password-reset-id", component: SetPasswordComponent},
  {path: "join-us", component: JoinUsComponent},
  {path: "login", component: LoginComponent},
  {path: "logout", component: LogoutComponent},
  {path: "**", component: NonRenderingComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: "reload"
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
