import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { LoggerTestingModule } from "ngx-logger/testing";
import { NotificationAWSUrlConfig, NotificationUrlConfig } from "../models/resource.model";
import { UrlService } from "./url.service";

describe("UrlService", () => {

  const INJECTED_URL = "https://ng-ekwg-staging.herokuapp.com/walks/walk-programme";

  const URL_PATH = "https://www.ekwg.co.uk/admin/member-bulk-load/12398719823";
  const LOCATION_VALUE = {
    location: {
      href: URL_PATH
    },
    querySelectorAll: () => []
  };
  beforeEach(() => TestBed.configureTestingModule({
    imports: [LoggerTestingModule],
    providers: [
      {provide: Router, useValue: {url: "/admin/member-bulk-load/12398719823"}},
      {provide: ActivatedRoute, useValue: {snapshot: {url: Array("admin", "member-bulk-load")}}},
      {provide: DOCUMENT, useValue: LOCATION_VALUE}]
  }).compileComponents());

  it("should return baseUrl as the path segment before /", () => {
    const service: UrlService = TestBed.inject(UrlService);
    expect(service.baseUrl(URL_PATH)).toBe("https://www.ekwg.co.uk");
  });

  describe("area", () => {

    it("should return current location when no args are passed", () => {
      const service: UrlService = TestBed.inject(UrlService);
      expect(service.area()).toBe("admin");
    });

    it("should return first url segment minus the slash", () => {
      const service: UrlService = TestBed.inject(UrlService);
      expect(service.area("https://www.ekwg.co.uk/walks/my-walk-detail")).toBe("walks");
    });

    it("should support passing of argument", () => {
      const service: UrlService = TestBed.inject(UrlService);
      expect(service.area("https://ng-ekwg-production.herokuapp.com/contact-us")).toBe("contact-us");
    });

  });

  describe("areaUrl", () => {

    it("should return the url segment after the area", () => {
      const service: UrlService = TestBed.inject(UrlService);
      expect(service.areaUrl()).toBe("member-bulk-load/12398719823");
    });

  });

  describe("notificationHref", () => {

    it("should return the url of a walk on the site", () => {
      const object: NotificationUrlConfig = {
        area: "walks",
        id: "1234-567"
      };

      const service: UrlService = TestBed.inject(UrlService);
      expect(service.notificationHref(object)).toBe("https://www.ekwg.co.uk/walks/1234-567");
    });

    it("should return the url of an expense in the sub-area of admin", () => {
      const object: NotificationUrlConfig = {
        subArea: "expenses",
        area: "admin",
        id: "1234-567"
      };

      const service: UrlService = TestBed.inject(UrlService);
      expect(service.notificationHref(object)).toBe("https://www.ekwg.co.uk/admin/expenses/1234-567");
    });

    it("should return the aws url if name supplied", () => {

      const object: NotificationAWSUrlConfig = {
        name: "expenses/file.12346.pdf",
      };

      const service: UrlService = TestBed.inject(UrlService);
      expect(service.notificationHref(object)).toBe("https://www.ekwg.co.uk/api/aws/s3/expenses/file.12346.pdf");
    });

  });

  describe("resourceUrlForAWSFileName", () => {

    it("should return a path to an aws file name", () => {
      const service: UrlService = TestBed.inject(UrlService);
      expect(service.resourceUrlForAWSFileName("file.pdf")).toBe("https://www.ekwg.co.uk/api/aws/s3/file.pdf");
    });

  });

  describe("hasRouteParameter", () => {

    it("should return false if not in the current url", () => {
      const service: UrlService = TestBed.inject(UrlService);
      expect(service.hasRouteParameter("blah-blah")).toBe(false);
    });

    it("should return true if in the current url", () => {
      const service: UrlService = TestBed.inject(UrlService);
      expect(service.hasRouteParameter("member-bulk-load")).toBe(true);
    });

  });

  describe("isArea", () => {

    it("should accept string argument", () => {
      const service: UrlService = TestBed.inject(UrlService);
      expect(service.isArea("admin")).toBe(true);
    });

    it("should return true if one or more of the areas is present", () => {
      const service: UrlService = TestBed.inject(UrlService);
      expect(service.isArea("blah-blah")).toBe(false);
      expect(service.isArea("admin", "blah-blah")).toBe(true);
    });

    it("should return false if none of the areas is present", () => {
      const service: UrlService = TestBed.inject(UrlService);
      expect(service.isArea("hello")).toBe(false);
      expect(service.isArea("wahh-baby", "blah-blah")).toBe(false);
    });

  });

  describe("isSubArea", () => {

    it("should return true when sub area is matched", () => {
      const service: UrlService = TestBed.inject(UrlService);
      expect(service.isSubArea("member-bulk-load")).toBe(true);
    });

    it("should return false when sub area is not matched", () => {
      const service: UrlService = TestBed.inject(UrlService);
      expect(service.isSubArea("not-bulk-load")).toBe(false);
    });

  });

  describe("relativeUrlFirstSegment", () => {

    it("should return first path segment after base url including slash", () => {
      const service: UrlService = TestBed.inject(UrlService);
      expect(service.relativeUrlFirstSegment()).toBe("/admin");
    });

    it("should allow passed parameter to be processed", () => {
      const service: UrlService = TestBed.inject(UrlService);
      expect(service.relativeUrlFirstSegment(INJECTED_URL)).toBe("/walks");
    });

  });

  describe("relativeUrl", () => {

    it("should return the path segment after the host including slash", () => {
      const service: UrlService = TestBed.inject(UrlService);
      expect(service.relativeUrl()).toBe("/admin/member-bulk-load/12398719823");
    });

    it("should allow passed parameter to be processed", () => {
      const service: UrlService = TestBed.inject(UrlService);
      expect(service.relativeUrl(INJECTED_URL)).toBe("/walks/walk-programme");
    });

  });

  it("absUrl should return full current url ", () => {
    const service: UrlService = TestBed.inject(UrlService);
    expect(service.absUrl()).toBe(URL_PATH);
  });

});
