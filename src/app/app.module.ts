import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { UpgradeModule } from "@angular/upgrade/static";
import { APP_BASE_HREF } from "@angular/common";
import { NavBarComponent } from "./navbar/navbar.component";
import { LoggerModule, NgxLoggerLevel } from "ngx-logger";
import { HeaderComponent } from "./header/header.component";
import { SiteEditComponent } from "./site-editt/site-edit.component";
import { LoginComponent } from "./login/login.component";
import { LogoutComponent } from "./logout/logout.component";
import { AppRoutingModule } from "./app-routing.module";


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    LogoutComponent,
    NavBarComponent,
    SiteEditComponent
  ],
  imports: [
    LoggerModule.forRoot({serverLoggingUrl: "/api/logs", level: NgxLoggerLevel.INFO, serverLogLevel: NgxLoggerLevel.ERROR}),
    BrowserModule,
    AppRoutingModule,
    UpgradeModule,
  ],
  providers: [{provide: APP_BASE_HREF, useValue: "/"}],
  bootstrap: [AppComponent, HeaderComponent, NavBarComponent]
})

export class AppModule {

}
