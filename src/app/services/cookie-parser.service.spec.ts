import { TestBed } from "@angular/core/testing";

import { CookieParserService } from "./cookie-parser.service";

describe("CookieParserService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: CookieParserService = TestBed.get(CookieParserService);
    expect(service).toBeTruthy();
  });
});
