import { TestBed } from "@angular/core/testing";
import { PageService } from "./page.service";


describe("PageService", () => {

  beforeEach(() => TestBed.configureTestingModule({}).compileComponents());

  it("pageForArea should return home when empty passed in", () => {
    const service: PageService = TestBed.get(PageService);
    expect(service.pageForArea("")).toEqual({href: "", title: "Home"});
  });

  it("pageForArea should return the related page when that page is passed in", () => {
    const service: PageService = TestBed.get(PageService);
    expect(service.pageForArea("social")).toEqual({href: "social", title: "Social"});
  });

});
