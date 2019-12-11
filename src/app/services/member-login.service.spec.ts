import { TestBed } from "@angular/core/testing";

import { MemberLoginService } from "./member-login.service";

describe("MemberLoginService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: MemberLoginService = TestBed.get(MemberLoginService);
    expect(service).toBeTruthy();
  });
});
