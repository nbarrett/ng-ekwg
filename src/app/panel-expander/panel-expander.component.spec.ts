import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PanelExpanderComponent } from "./panel-expander.component";

describe("PanelExpanderComponent", () => {
  let component: PanelExpanderComponent;
  let fixture: ComponentFixture<PanelExpanderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelExpanderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelExpanderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
