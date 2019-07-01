import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { UpgradeModule } from "@angular/upgrade/static";
import { PageNavigatorComponent } from "./page-navigator/page-navigator.component";
import { CustomNGXLoggerService, LoggerModule, NgxLoggerLevel } from "ngx-logger";
import { LoginPanelComponent } from "./login-panel/login-panel.component";
import { SiteEditComponent } from "./site-edit/site-edit.component";
import { LoginComponent } from "./login/login.component";
import { LogoutComponent } from "./logout/logout.component";
import { AppRoutingModule } from "./app-routing.module";
import { NgModule } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { SiteEditService } from "./site-edit/site-edit.service";
import {
  AuthenticationModalsServiceProvider,
  ContentTextProvider,
  DateUtilsProvider,
  LoggedInMemberServiceProvider
} from "./ajs-upgraded-providers";
import { UiSwitchModule } from "ngx-ui-switch";
import { MainLogoComponent } from "./main-logo/main-logo.component";
import { SiteNavigatorComponent } from "./site-navigator/site-navigator.component";
import { MainTitleComponent } from "./main-title/main-title.component";
import { PageTitleComponent } from "./page-title/page-title.component";
import { JoinUsComponent } from "./pages/join-us/join-us.component";
import { NonRenderingComponent } from "./shared/non-rendering.component";
import { MailingPreferencesComponent } from "./login/mailing-preferences.component";
import { ForgotPasswordComponent } from "./login/forgot-password.component";
import { SetPasswordComponent } from "./login/set-password.component";
import { MarkdownEditorComponent } from "./markdown-editor/markdown-editor.component";
import { MarkdownModule } from "ngx-markdown";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LoginPanelComponent,
    LogoutComponent,
    MainLogoComponent,
    NonRenderingComponent,
    MailingPreferencesComponent,
    ForgotPasswordComponent,
    SetPasswordComponent,
    MainTitleComponent,
    MarkdownEditorComponent,
    PageNavigatorComponent,
    SiteEditComponent,
    PageTitleComponent,
    JoinUsComponent,
    SiteNavigatorComponent
  ],
  imports: [
    LoggerModule.forRoot({serverLoggingUrl: "/api/logs", level: NgxLoggerLevel.INFO, serverLogLevel: NgxLoggerLevel.ERROR}),
    MarkdownModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    UpgradeModule,
    UiSwitchModule
  ],
  providers: [
    CustomNGXLoggerService,
    CookieService,
    SiteEditService,
    DateUtilsProvider,
    LoggedInMemberServiceProvider,
    AuthenticationModalsServiceProvider,
    ContentTextProvider,
  ],
  entryComponents: [
    MarkdownEditorComponent,
  ],
  bootstrap: [PageTitleComponent, MainLogoComponent, MainTitleComponent, AppComponent,
    LoginPanelComponent, PageNavigatorComponent, SiteNavigatorComponent]
})

export class AppModule {
}
