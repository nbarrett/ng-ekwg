import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { WalkViewComponent } from "./walk-view.component";

describe("WalkViewComponent", () => {
  let component: WalkViewComponent;
  let fixture: ComponentFixture<WalkViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalkViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalkViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
