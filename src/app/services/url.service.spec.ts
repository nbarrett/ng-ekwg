import { TestBed } from "@angular/core/testing";
import { UrlService } from "./url.service";
import { LoggerTestingModule } from "ngx-logger/testing";
import { DOCUMENT } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";


describe("UrlService", () => {

  const INJECTED_URL = "https://ng-ekwg-staging.herokuapp.com/walks/walk-programme";

  const URL_PATH = "https://www.ekwg.co.uk/admin/member-bulk-load/12398719823";
  const LOCATION_VALUE = {
    location: {
      href: URL_PATH
    }
  };

  beforeEach(() => TestBed.configureTestingModule({
    imports: [LoggerTestingModule, RouterModule.forRoot([])],
    providers: [
      {provide: Router, useValue: {url: "/admin/member-bulk-load/12398719823"}},
      {provide: ActivatedRoute, useValue: {snapshot: {url: Array("admin", "member-bulk-load")}}},
      {provide: DOCUMENT, useValue: LOCATION_VALUE}]
  }).compileComponents());

  it("should return baseUrl as the path segment before /", () => {
    const service: UrlService = TestBed.get(UrlService);
    expect(service.baseUrl(URL_PATH)).toBe("https://www.ekwg.co.uk");
  });

  describe("area", () => {

    it("should return current location when no args are passed", () => {
      const service: UrlService = TestBed.get(UrlService);
      expect(service.area()).toBe("admin");
    });

    it("should return first url segment minus the slash", () => {
      const service: UrlService = TestBed.get(UrlService);
      expect(service.area("https://www.ekwg.co.uk/walks/my-walk-detail")).toBe("walks");
    });

    it("should support passing of argument", () => {
      const service: UrlService = TestBed.get(UrlService);
      expect(service.area("https://ng-ekwg-production.herokuapp.com/contact-us")).toBe("contact-us");
    });

  });

  describe("areaUrl", () => {

    it("should return the url segment after the area", () => {
      const service: UrlService = TestBed.get(UrlService);
      expect(service.areaUrl()).toBe("member-bulk-load/12398719823");
    });

  });


  describe("notificationHref", () => {

    const object = {
      type: "walk",
      area: "walks",
      id: "1234-567"
    };

    it("should return the url of an event on the site", () => {
      const service: UrlService = TestBed.get(UrlService);
      expect(service.notificationHref(object)).toBe("https://www.ekwg.co.uk/walks/walkId/1234-567");
    });

  });

  describe("resourceUrlForAWSFileName", () => {

    it("should return a path to an aws file name", () => {
      const service: UrlService = TestBed.get(UrlService);
      expect(service.resourceUrlForAWSFileName("file.pdf")).toBe("https://www.ekwg.co.uk/api/aws/s3/file.pdf");
    });

  });

  describe("hasRouteParameter", () => {

    it("should return false if not in the current url", () => {
      const service: UrlService = TestBed.get(UrlService);
      expect(service.hasRouteParameter("blah-blah")).toBe(false);
    });

    it("should return true if in the current url", () => {
      const service: UrlService = TestBed.get(UrlService);
      expect(service.hasRouteParameter("member-bulk-load")).toBe(true);
    });

  });

  describe("isArea", () => {

    it("should accept string argument", () => {
      const service: UrlService = TestBed.get(UrlService);
      expect(service.isArea("admin")).toBe(true);
    });

    it("should return true if one or more of the areas is present", () => {
      const service: UrlService = TestBed.get(UrlService);
      expect(service.isArea("blah-blah")).toBe(false);
      expect(service.isArea("admin", "blah-blah")).toBe(true);
    });

    it("should return false if none of the areas is present", () => {
      const service: UrlService = TestBed.get(UrlService);
      expect(service.isArea("hello")).toBe(false);
      expect(service.isArea("wahh-baby", "blah-blah")).toBe(false);
    });

  });

  describe("relativeUrlFirstSegment", () => {

    it("should return first path segment after base url including slash", () => {
      const service: UrlService = TestBed.get(UrlService);
      expect(service.relativeUrlFirstSegment()).toBe("/admin");
    });

    it("should allow passed parameter to be processed", () => {
      const service: UrlService = TestBed.get(UrlService);
      expect(service.relativeUrlFirstSegment(INJECTED_URL)).toBe("/walks");
    });

  });

  it("absUrl should return full current url ", () => {
    const service: UrlService = TestBed.get(UrlService);
    expect(service.absUrl()).toBe(URL_PATH);
  });

  it("should return resourceUrl as area type and id joined by slashes", () => {
    const service: UrlService = TestBed.get(UrlService);
    expect(service.resourceUrl("admin", "expenses", "12345")).toBe("https://www.ekwg.co.uk/admin/expensesId/12345");
  });

});
