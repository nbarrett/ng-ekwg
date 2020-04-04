import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { AdminAuthGuard } from "./admin-auth-guard.service";
import { LoggedInGuard } from "./admin-login-guard.service";
import { ForgotPasswordComponent } from "./login/forgot-password.component";
import { LoginComponent } from "./login/login.component";
import { MailingPreferencesComponent } from "./login/mailing-preferences.component";
import { SetPasswordComponent } from "./login/set-password.component";
import { LogoutComponent } from "./logout/logout.component";
import { AdminComponent } from "./pages/admin/admin/admin.component";
import { ExpensesComponent } from "./pages/admin/expenses/expenses.component";
import { MemberAdminComponent } from "./pages/admin/member-admin/member-admin.component";
import { MemberBulkLoadComponent } from "./pages/admin/member-bulk-load/member-bulk-load.component";
import { MemberLoginAuditComponent } from "./pages/admin/member-login-audit/member-login-audit.component";
import { ChangePasswordComponent } from "./pages/admin/profile/change-password.component";
import { ContactDetailsComponent } from "./pages/admin/profile/contact-details.component";
import { EmailSubscriptionsComponent } from "./pages/admin/profile/email-subscriptions.component";
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
  {path: "privacy-policy", component: PrivacyPolicyComponent},
  {path: "admin", component: AdminComponent},
  {path: "admin/expenses", component: ExpensesComponent, canActivate: [LoggedInGuard]},
  {path: "admin/expenses/:expense-id", component: ExpensesComponent, canActivate: [LoggedInGuard]},
  {path: "admin/expenses/expenseId/:expense-id", component: ExpensesComponent, canActivate: [LoggedInGuard]},
  {path: "admin/member-login-audit", component: MemberLoginAuditComponent, canActivate: [AdminAuthGuard]},
  {path: "admin/member-admin", component: MemberAdminComponent, canActivate: [AdminAuthGuard]},
  {path: "admin/profile", component: ChangePasswordComponent, canActivate: [LoggedInGuard]},
  {path: "admin/change-password", component: ChangePasswordComponent, canActivate: [LoggedInGuard]},
  {path: "admin/email-subscriptions", component: EmailSubscriptionsComponent, canActivate: [LoggedInGuard]},
  {path: "admin/contact-details", component: ContactDetailsComponent, canActivate: [LoggedInGuard]},
  {path: "admin/member-bulk-load/:tab", component: MemberBulkLoadComponent, canActivate: [AdminAuthGuard]},
  {path: "admin/member-bulk-load", component: MemberBulkLoadComponent, canActivate: [AdminAuthGuard]},
  {path: "home", component: HomeComponent },
  {path: "", component: HomeComponent },
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
  {path: "**", component: NonRenderingComponent}
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
