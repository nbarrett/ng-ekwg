import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { UpgradeModule } from "@angular/upgrade/static";
import { APP_BASE_HREF } from "@angular/common";
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
import { DateUtilsProvider, LoggedInMemberServiceProvider } from "./ajs-upgraded-providers";
import { UiSwitchModule } from "ngx-ui-switch";
import { MainLogoComponent } from "./main-logo/main-logo.component";
import { SiteNavigatorComponent } from "./site-navigator/site-navigator.component";
import { MainTitleComponent } from "./main-title/main-title.component";
import { PageTitleComponent } from "./page-title/page-title.component";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LoginPanelComponent,
    LogoutComponent,
    MainLogoComponent,
    MainTitleComponent,
    PageNavigatorComponent,
    SiteEditComponent,
    PageTitleComponent,
    SiteNavigatorComponent
  ],
  imports: [
    LoggerModule.forRoot({serverLoggingUrl: "/api/logs", level: NgxLoggerLevel.INFO, serverLogLevel: NgxLoggerLevel.ERROR}),
    BrowserModule,
    AppRoutingModule,
    UpgradeModule,
    UiSwitchModule
  ],
  providers: [
    CustomNGXLoggerService,
    CookieService,
    SiteEditService,
    {provide: APP_BASE_HREF, useValue: "/"},
    DateUtilsProvider,
    LoggedInMemberServiceProvider,
  ],
  bootstrap: [PageTitleComponent, MainLogoComponent, MainTitleComponent, AppComponent,
    LoginPanelComponent, PageNavigatorComponent, SiteNavigatorComponent]
})

export class AppModule {
}
