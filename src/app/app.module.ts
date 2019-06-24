import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { UpgradeModule } from "@angular/upgrade/static";
import { APP_BASE_HREF } from "@angular/common";
import { NavBarComponent } from "./navbar/navbar.component";
import { CustomNGXLoggerService, LoggerModule, NgxLoggerLevel } from "ngx-logger";
import { HeaderComponent } from "./header/header.component";
import { SiteEditComponent } from "./site-edit/site-edit.component";
import { LoginComponent } from "./login/login.component";
import { LogoutComponent } from "./logout/logout.component";
import { AppRoutingModule } from "./app-routing.module";
import { NgModule } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { SiteEditService } from "./site-edit/site-edit.service";
import { DateUtilsProvider, LoggedInMemberServiceProvider } from "./ajs-upgraded-providers";
import { UiSwitchModule } from "ngx-ui-switch";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    LogoutComponent,
    NavBarComponent,
    SiteEditComponent,
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
  bootstrap: [AppComponent, HeaderComponent, NavBarComponent]
})

export class AppModule {
}
