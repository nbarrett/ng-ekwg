import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { WalkExportComponent } from "./walk-export.component";

describe("WalkExportComponent", () => {
  let component: WalkExportComponent;
  let fixture: ComponentFixture<WalkExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalkExportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalkExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
