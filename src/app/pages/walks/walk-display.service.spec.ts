import { TestBed } from "@angular/core/testing";

import { WalkDisplayService } from "./walk-display.service";

describe("WalkDisplayService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: WalkDisplayService = TestBed.get(WalkDisplayService);
    expect(service).toBeTruthy();
  });
});
