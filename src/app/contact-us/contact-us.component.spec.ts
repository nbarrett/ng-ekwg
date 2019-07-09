import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ContactUsComponent } from "./contact-us.component";
import { LoggerTestingModule } from "ngx-logger";
import { CommitteeConfig } from "../ajs-upgraded-providers";

const URL_PATH = "https://www.ekwg.co.uk/admin/member-bulk-load";
const LOCATION_VALUE = {
  location: {
    href: URL_PATH
  }
};
xdescribe("ContactUsComponent", () => {
  let component: ContactUsComponent;
  let fixture: ComponentFixture<ContactUsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContactUsComponent],
      providers: [LoggerTestingModule, {
        provide: CommitteeConfig, useValue: LOCATION_VALUE
      }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
