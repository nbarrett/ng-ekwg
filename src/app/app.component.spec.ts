import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ComponentLoaderFactory } from "ngx-bootstrap/component-loader";
import { BsModalService } from "ngx-bootstrap/modal";
import { PositioningService } from "ngx-bootstrap/positioning";
import { CookieService } from "ngx-cookie-service";
import { LoggerTestingModule } from "ngx-logger/testing";
import { UiSwitchComponent } from "ngx-ui-switch";
import { AppComponent } from "./app.component";
import { LoginPanelComponent } from "./login-panel/login-panel.component";
import { MainLogoComponent } from "./main-logo/main-logo.component";
import { MainTitleComponent } from "./main-title/main-title.component";
import { PageNavigatorComponent } from "./page-navigator/page-navigator.component";
import { PageTitleComponent } from "./page-title/page-title.component";
import { FullNameWithAliasPipe } from "./pipes/full-name-with-alias.pipe";
import { FullNamePipe } from "./pipes/full-name.pipe";
import { MemberIdToFullNamePipe } from "./pipes/member-id-to-full-name.pipe";
import { SiteEditComponent } from "./site-edit/site-edit.component";
import { SiteNavigatorComponent } from "./site-navigator/site-navigator.component";

describe("AppComponent", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      providers: [
        ComponentLoaderFactory,
        PositioningService,
        BsModalService,
        FullNamePipe,
        MemberIdToFullNamePipe,
        FullNameWithAliasPipe,
        {provide: "MemberService", useValue: {}},
        {provide: "MemberAuditService", useValue: {}},
        CookieService],
      declarations: [AppComponent,
        MainLogoComponent, PageTitleComponent, MainTitleComponent,
        SiteNavigatorComponent, LoginPanelComponent, PageNavigatorComponent, SiteEditComponent, UiSwitchComponent
      ],
    }).compileComponents();
  });

  it("should render a router-outlet  tag", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector("router-outlet")).toBeTruthy();
  });

  it("should not render title in a div [ng-view] tag", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector("div [ng-view]")).toBeFalsy();
  });
});
