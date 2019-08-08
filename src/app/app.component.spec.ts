import { async, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AppComponent } from "./app.component";
import { UpgradeModule } from "@angular/upgrade/static";
import { LoggerTestingModule } from "ngx-logger";
import { SiteNavigatorComponent } from "./site-navigator/site-navigator.component";
import { MainLogoComponent } from "./main-logo/main-logo.component";
import { MainTitleComponent } from "./main-title/main-title.component";
import { LoginPanelComponent } from "./login-panel/login-panel.component";
import { PageNavigatorComponent } from "./page-navigator/page-navigator.component";
import { SiteEditComponent } from "./site-edit/site-edit.component";
import { UiSwitchComponent } from "ngx-ui-switch";
import { CookieService } from "ngx-cookie-service";
import { PageTitleComponent } from "./page-title/page-title.component";

describe("AppComponent", () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule,
        RouterTestingModule,
        UpgradeModule
      ],
      providers: [{provide: "LoggedInMemberService", useValue: {}},
        CookieService],
      declarations: [
        AppComponent, MainLogoComponent, PageTitleComponent, MainTitleComponent,
        SiteNavigatorComponent, LoginPanelComponent, PageNavigatorComponent, SiteEditComponent, UiSwitchComponent
      ],
    }).compileComponents();
  }));

  it("should render a router-outlet  tag", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector("router-outlet")).toBeTruthy();
  });

  it("should render title in a div [ng-view] tag", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector("div [ng-view]")).toBeFalsy();
  });
});
