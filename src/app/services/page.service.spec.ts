import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { UpgradeModule } from "@angular/upgrade/static";
import { CookieService } from "ngx-cookie-service";
import { LoggerTestingModule } from "ngx-logger/testing";
import { PageService } from "./page.service";

describe("PageService", () => {

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      LoggerTestingModule,
      RouterTestingModule,
      UpgradeModule
    ],
    providers: [CookieService]
  }).compileComponents());

  describe("pageForArea", () => {

    it("should return home when empty passed in", () => {
      const service: PageService = TestBed.get(PageService);
      expect(service.pageForArea("")).toEqual({href: "", title: "Home"});
    });

    it("should return the related page when that page is passed in", () => {
      const service: PageService = TestBed.get(PageService);
      expect(service.pageForArea("social")).toEqual({href: "social", title: "Social"});
    });

    it("should allow / to be passed in as well but ignored the related page when that page is passed in", () => {
      const service: PageService = TestBed.get(PageService);
      expect(service.pageForArea("/social")).toEqual({href: "social", title: "Social"});
    });

    it("should return home if an invalid area is passed in", () => {
      const service: PageService = TestBed.get(PageService);
      expect(service.pageForArea("/i-dont-exist")).toEqual({href: "", title: "Home"});
    });
  });

});
