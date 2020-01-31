import { TestBed } from "@angular/core/testing";

import { MemberNamingService } from "./member-naming.service";

describe("MemberNamingService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: MemberNamingService = TestBed.get(MemberNamingService);
    expect(service).toBeTruthy();
  });
});
