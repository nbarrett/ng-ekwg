import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AdminAuthGuard } from "../../admin-auth-guard.service";
import { LoggedInGuard } from "../../admin-login-guard.service";
import { AdminComponent } from "../../pages/admin/admin/admin.component";
import { ExpensesComponent } from "../../pages/admin/expenses/expenses.component";
import { MemberAdminComponent } from "../../pages/admin/member-admin/member-admin.component";
import { MemberBulkLoadComponent } from "../../pages/admin/member-bulk-load/member-bulk-load.component";
import { MemberLoginAuditComponent } from "../../pages/admin/member-login-audit/member-login-audit.component";
import { ChangePasswordComponent } from "../../pages/admin/profile/change-password.component";
import { ContactDetailsComponent } from "../../pages/admin/profile/contact-details.component";
import { EmailSubscriptionsComponent } from "../../pages/admin/profile/email-subscriptions.component";
import { AdminModule } from "./admin.module";

@NgModule({
  imports: [AdminModule, RouterModule.forChild([
    {path: "", component: AdminComponent},
    {path: "expenses", component: ExpensesComponent, canActivate: [LoggedInGuard]},
    {path: "expenses/:expense-id", component: ExpensesComponent, canActivate: [LoggedInGuard]},
    {path: "member-login-audit", component: MemberLoginAuditComponent, canActivate: [AdminAuthGuard]},
    {path: "member-admin", component: MemberAdminComponent, canActivate: [AdminAuthGuard]},
    {path: "profile", component: ChangePasswordComponent, canActivate: [LoggedInGuard]},
    {path: "change-password", component: ChangePasswordComponent, canActivate: [LoggedInGuard]},
    {path: "email-subscriptions", component: EmailSubscriptionsComponent, canActivate: [LoggedInGuard]},
    {path: "contact-details", component: ContactDetailsComponent, canActivate: [LoggedInGuard]},
    {path: "member-bulk-load/:tab", component: MemberBulkLoadComponent, canActivate: [AdminAuthGuard]},
    {path: "member-bulk-load", component: MemberBulkLoadComponent, canActivate: [AdminAuthGuard]},
  ])]
})
export class AdminRoutingModule {
}
