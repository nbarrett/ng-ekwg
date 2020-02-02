import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { LoggerTestingModule } from "ngx-logger/testing";
import { FullNameWithAliasPipe } from "../pipes/full-name-with-alias.pipe";
import { FullNamePipe } from "../pipes/full-name.pipe";
import { MemberIdToFullNamePipe } from "../pipes/member-id-to-full-name.pipe";

import { StringUtilsService } from "./string-utils.service";

const memberService = {
  allLimitedFields: () => Promise.resolve({email: "test@example.com"}),
  filterFor: {GROUP_MEMBERS: ""}
};

describe("StringUtilsService", () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [LoggerTestingModule, HttpClientTestingModule],
    providers: [
      MemberIdToFullNamePipe,
      FullNamePipe,
      FullNameWithAliasPipe,
      {provide: "MemberService", useValue: memberService}]
  }));

  describe("stringifyObject", () => {
    it("should return an object with humanised key, values", () => {
      const service: StringUtilsService = TestBed.get(StringUtilsService);
      expect(service.stringifyObject({
          hostname: "api.meetup.com",
          protocol: "https:"
        }
      )).toBe("Hostname: api.meetup.com, Protocol: https:");
    });
  });

  describe("stringifyObjectNested", () => {
    it("should return an object nested objects each with humanised key, values", () => {
      const service: StringUtilsService = TestBed.get(StringUtilsService);
      expect(service.stringifyObject({
        title: "a Brief Description and Start Point",
        config: {
          meetup: {
            announce: true,
            defaultContent: "Prompt to join after 3 walks",
            publishStatus: "published",
            guestLimit: 7
          }
        }
      })).toEqual("Title: a Brief Description and Start Point, Config -> Meetup -> Announce: true, Default content: Prompt to join after 3 walks, Publish status: published, Guest limit: 7");
    });
  });

  describe("left", () => {
    it("should return the left X characters of string regardless of length", () => {
      const service: StringUtilsService = TestBed.get(StringUtilsService);
      expect(service.left("Hello Mum", 10)).toBe("Hello Mum");
      expect(service.left("the quick brown fox jumped over the lazy dog", 10)).toBe("the quick ");
    });
  });

  describe("stringify", () => {
    it("should return stringified version of message field if object", () => {
      const service: StringUtilsService = TestBed.get(StringUtilsService);
      expect(service.stringify({title: "who cares", message: "This is regular text"})).toBe("This is regular text");
      expect(service.stringify({
        title: "who cares",
        message: {some: {complex: {object: "wohoo"}}}
      })).toBe("Some -> Complex -> Object: wohoo");
    });
  });

  describe("replaceAll", () => {
    it("should replace multiple instance of one character with another", () => {
      const service: StringUtilsService = TestBed.get(StringUtilsService);
      expect(service.replaceAll("  ", " ", "Hello            Mum")).toBe("Hello Mum");
      expect(service.replaceAll("  ", " ", "Hello      Mum")).toBe("Hello Mum");
    });

    it("should not get stuck in a loop if search and replace are the same", () => {
      const service: StringUtilsService = TestBed.get(StringUtilsService);
      expect(service.replaceAll(" ", " ", "Hello            Mum")).toBe("Hello            Mum");
    });

    it("should replace one or more instances of one string with another", () => {
      const service: StringUtilsService = TestBed.get(StringUtilsService);
      expect(service.replaceAll("abc", "replaced text", "Test abc test test abc test test test abc test test abc")).toBe("Test replaced text test test replaced text test test test replaced text test test replaced text");
      expect(service.replaceAll(".", "", "$100.00")).toBe("$10000");
      expect(service.replaceAll("e", "o", "there are quite a few instances of the letter e in this text")).toBe("thoro aro quito a fow instancos of tho lottor o in this toxt");
      expect(service.replaceAll("the", "one", "the other the other the other the other ")).toBe("one ooner one ooner one ooner one ooner ");
      expect(service.replaceAll(".", "?", "1233457890.f?g,sfakj\n239870!@£$%^&*([]).{}")).toBe("1233457890?f?g,sfakj\n239870!@£$%^&*([])?{}");
    });

    it("should accept numeric values too!", () => {
      const service: StringUtilsService = TestBed.get(StringUtilsService);
      expect(service.replaceAll(9, 1, 909912349.9)).toBe(101112341.1);
    });

  });

});
