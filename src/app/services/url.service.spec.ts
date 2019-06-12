import { TestBed } from "@angular/core/testing";
import { UrlService } from "./url.service";
import { LoggerTestingModule } from "ngx-logger";
import { DOCUMENT } from "@angular/common";


describe("UrlService", () => {

  const URL_PATH = "https://www.ekwg.co.uk/#/admin/member-bulk-load";
  const LOCATION_VALUE = {
    location: {
      href: URL_PATH
    }
  };

  beforeEach(() => TestBed.configureTestingModule({
    imports: [LoggerTestingModule],
    providers: [{
      provide: DOCUMENT, useValue: LOCATION_VALUE
    }, UrlService]
  }).compileComponents());

  it("should return baseUrl as the path segment before /#", () => {
    const service: UrlService = TestBed.get(UrlService);
    expect(service.baseUrl(URL_PATH)).toBe("https://www.ekwg.co.uk");
  });

  it("should return relativeUrlFirstSegment as first path segment after /#", () => {
    const service: UrlService = TestBed.get(UrlService);
    expect(service.relativeUrlFirstSegment(URL_PATH)).toBe("/admin");
  });

  it("should return absUrl", () => {
    const service: UrlService = TestBed.get(UrlService);
    expect(service.absUrl()).toBe(URL_PATH);
  });

  it("should return resourceUrl as area type and id joined by slashes", () => {
    const service: UrlService = TestBed.get(UrlService);
    expect(service.resourceUrl("admin", "expenseses", "12345")).toBe("https://www.ekwg.co.uk/#/admin/expensesesId/12345");
  });
});
