import { HttpClientModule } from "@angular/common/http";
import { ApplicationRef, DoBootstrap, NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgxLoggerLevel } from "ngx-logger";
import { AppRoutingModule } from "../../app-routing.module";
import { CarouselStoryNavigatorComponent } from "../../carousel-story-navigator/carousel-story-navigator.component";
import { ContainerComponent } from "../../container/container";
import { FooterComponent } from "../../footer/footer";
import { FooterIconsComponent } from "../../footer/icons/footer-icons";
import { NewBrandHomeComponent } from "../../home-page/new-brand-home";
import { ImageCropperAndResizerComponent } from "../../image-cropper/image-cropper";
import { LoginPanelComponent } from "../../login-panel/login-panel.component";
import { ForgotPasswordComponent } from "../../login/forgot-password.component";
import { LoginComponent } from "../../login/login.component";
import { SetPasswordComponent } from "../../login/set-password.component";
import { LogoutComponent } from "../../logout/logout.component";
import { MainLogoComponent } from "../../main-logo/main-logo.component";
import { MainTitleComponent } from "../../main-title/main-title.component";
import { MeetupDescriptionComponent } from "../../notifications/walks/templates/meetup/meetup-description.component";
import { PageNavigatorComponent } from "../../page-navigator/page-navigator.component";
import { PageTitleComponent } from "../../page-title/page-title.component";
import { ContactUsComponent } from "../../pages/contact-us/contact-us.component";
import { FacebookComponent } from "../../pages/facebook/facebook.component";
import { HomeComponent } from "../../pages/home/home.component";
import { PrivacyPolicyComponent } from "../../pages/home/privacy-policy.component";
import { HowToModalComponent } from "../../pages/how-to/how-to-modal.component";
import { HowToComponent } from "../../pages/how-to/how-to.component";
import { InstagramComponent } from "../../pages/instagram/instagram.component";
import { JoinUsComponent } from "../../pages/join-us/join-us.component";
import { LetterheadTitleConfigComponent } from "../../pages/letterhead/letterhead-title-config.component";
import { LetterheadTitleOutputComponent } from "../../pages/letterhead/letterhead-title-output.component";
import { LetterheadTitlePartConfigComponent } from "../../pages/letterhead/letterhead-title-part-config.component";
import { LetterheadComponent } from "../../pages/letterhead/letterhead.component";
import { LoginModalComponent } from "../../pages/login/login-modal/login-modal.component";
import { ChangedItemsPipe } from "../../pipes/changed-items.pipe";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { SharedModule } from "../../shared-module";
import { SiteEditComponent } from "../../site-edit/site-edit.component";
import { HeaderButtonsComponent } from "../../site-navigator/header-buttons.component";
import { CardContainerComponent } from "./card-container/card-container.component";
import { NavbarComponent } from "./mobile-menu/navbar-content";
import { NavigatorComponent } from "./navigator/navigator";

@NgModule({
  declarations: [
    CarouselStoryNavigatorComponent,
    ChangedItemsPipe,
    ContactUsComponent,
    ContainerComponent,
    FooterIconsComponent,
    ForgotPasswordComponent,
    NewBrandHomeComponent,
    ImageCropperAndResizerComponent,
    HowToComponent,
    HowToModalComponent,
    JoinUsComponent,
    HomeComponent,
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
    FooterComponent,
    PageNavigatorComponent,
    PageTitleComponent,
    NavbarComponent,
    PrivacyPolicyComponent,
    SetPasswordComponent,
    SiteEditComponent,
    HeaderButtonsComponent,
    InstagramComponent,
    FacebookComponent,
    CardContainerComponent,
    NavigatorComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SharedModule.forRoot(),
  ],
  entryComponents: [
    ContainerComponent,
  ]
})

export class AppModule implements DoBootstrap {
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(AppModule, NgxLoggerLevel.OFF);
  }

  ngDoBootstrap(appRef: ApplicationRef) {
    appRef.bootstrap(ContainerComponent);
  }

}