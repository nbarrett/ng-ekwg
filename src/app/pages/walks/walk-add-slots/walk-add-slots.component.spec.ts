import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { WalkAddSlotsComponent } from "./walk-add-slots.component";

describe("WalkAddSlotsComponent", () => {
  let component: WalkAddSlotsComponent;
  let fixture: ComponentFixture<WalkAddSlotsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalkAddSlotsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalkAddSlotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
