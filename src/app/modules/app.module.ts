import { HttpClientModule } from "@angular/common/http";
import { ApplicationRef, DoBootstrap, NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgxLoggerLevel } from "ngx-logger";
import { AppRoutingModule } from "../app-routing.module";
import { AppComponent } from "../app.component";
import { FooterComponent } from "../footer/footer.component";
import { LoginPanelComponent } from "../login-panel/login-panel.component";
import { ForgotPasswordComponent } from "../login/forgot-password.component";
import { LoginComponent } from "../login/login.component";
import { SetPasswordComponent } from "../login/set-password.component";
import { LogoutComponent } from "../logout/logout.component";
import { MainLogoComponent } from "../main-logo/main-logo.component";
import { MainTitleComponent } from "../main-title/main-title.component";
import { MeetupDescriptionComponent } from "../notifications/walks/templates/meetup/meetup-description.component";
import { PageNavigatorComponent } from "../page-navigator/page-navigator.component";
import { PageTitleComponent } from "../page-title/page-title.component";
import { ContactUsComponent } from "../pages/contact-us/contact-us.component";
import { HomeComponent } from "../pages/home/home.component";
import { PrivacyPolicyComponent } from "../pages/home/privacy-policy.component";
import { HowToModalComponent } from "../pages/how-to/how-to-modal.component";
import { HowToComponent } from "../pages/how-to/how-to.component";
import { JoinUsComponent } from "../pages/join-us/join-us.component";
import { LetterheadTitleConfigComponent } from "../pages/letterhead/letterhead-title-config.component";
import { LetterheadTitleOutputComponent } from "../pages/letterhead/letterhead-title-output.component";
import { LetterheadTitlePartConfigComponent } from "../pages/letterhead/letterhead-title-part-config.component";
import { LetterheadComponent } from "../pages/letterhead/letterhead.component";
import { LoginModalComponent } from "../pages/login/login-modal/login-modal.component";
import { ChangedItemsPipe } from "../pipes/changed-items.pipe";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { SharedModule } from "../shared-module";
import { NonRenderingComponent } from "../shared/non-rendering.component";
import { SiteEditComponent } from "../site-edit/site-edit.component";
import { SiteNavigatorComponent } from "../site-navigator/site-navigator.component";

@NgModule({
  declarations: [
    AppComponent,
    ChangedItemsPipe,
    ContactUsComponent,
    FooterComponent,
    ForgotPasswordComponent,
    HomeComponent,
    HowToComponent,
    HowToModalComponent,
    JoinUsComponent,
    LetterheadComponent,
    LetterheadTitleConfigComponent,
    LetterheadTitleOutputComponent,
    LetterheadTitlePartConfigComponent,
    LoginComponent,
    LoginModalComponent,
    LoginPanelComponent,
    LogoutComponent,
    MainLogoComponent,
    MainTitleComponent,
    MeetupDescriptionComponent,
    NonRenderingComponent,
    PageNavigatorComponent,
    PageTitleComponent,
    PrivacyPolicyComponent,
    SetPasswordComponent,
    SiteEditComponent,
    SiteNavigatorComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SharedModule.forRoot(),
  ],
  entryComponents: [
    AppComponent
  ]
})

export class AppModule implements DoBootstrap {
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(AppComponent, NgxLoggerLevel.OFF);
  }

  ngDoBootstrap(appRef: ApplicationRef) {
    appRef.bootstrap(AppComponent);
  }

}
