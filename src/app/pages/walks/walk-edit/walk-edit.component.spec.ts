import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { WalkEditComponent } from "./walk-edit.component";

describe("WalkEditComponent", () => {
  let component: WalkEditComponent;
  let fixture: ComponentFixture<WalkEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalkEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalkEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
