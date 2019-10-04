import { TestBed } from "@angular/core/testing";
import { times } from "lodash-es";
import { LoggerTestingModule } from "ngx-logger";
import { FullNameWithAliasPipe } from "../pipes/full-name-with-alias.pipe";
import { FullNamePipe } from "../pipes/full-name.pipe";
import { MemberIdToFullNamePipe } from "../pipes/member-id-to-full-name.pipe";

import { NumberUtilsService } from "./number-utils.service";
import { StringUtilsService } from "./string-utils.service";

const memberService = {
  allLimitedFields: () => Promise.resolve({email: "test@example.com"}),
  filterFor: {GROUP_MEMBERS: ""}
};

describe("NumberUtilsService", () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [LoggerTestingModule, ],
    providers: [
      StringUtilsService,
      MemberIdToFullNamePipe,
      FullNamePipe,
      FullNameWithAliasPipe,
      {provide: "MemberService", useValue: memberService}]
  }));

  describe("asNumber", () => {

    it("should convert basic string", () => {
      const service: NumberUtilsService = TestBed.get(NumberUtilsService);
      expect(service.asNumber("12.45")).toBe(12.45);
    });

    it("should convert basic string with number of decimal places specified", () => {
      const service: NumberUtilsService = TestBed.get(NumberUtilsService);
      expect(service.asNumber("120.45167", 3)).toBe(120.452);
    });

    it("should remove all non-numeric items from input before converting", () => {
      const service: NumberUtilsService = TestBed.get(NumberUtilsService);
      expect(service.asNumber("this is number 15.467 is it not?")).toBe(15.467);
      expect(service.asNumber("1234  568")).toBe(1234568);
    });

    it("should return zero if no value supplied", () => {
      const service: NumberUtilsService = TestBed.get(NumberUtilsService);
      expect(service.asNumber()).toBe(0);
      expect(service.asNumber(undefined)).toBe(0);
      expect(service.asNumber("")).toBe(0);
    });

    it("should accept a numeric number", () => {
      const service: NumberUtilsService = TestBed.get(NumberUtilsService);
      expect(service.asNumber(120.45167, 3)).toBe(120.452);
    });

  });

  describe("sumValues", () => {

    it("should convert array of objects containing numbery values", () => {
      const service: NumberUtilsService = TestBed.get(NumberUtilsService);
      expect(service.sumValues([{value: 12}, {value: "the number 15"}, {value: "4567.78"}], "value")).toBe(4594.78);
    });

  });

  describe("generateUid", () => {

    it("should generate a uniq value each time", () => {
      const service: NumberUtilsService = TestBed.get(NumberUtilsService);
      const count = 1000;
      const generatedResults = new Set(times(count, () => service.generateUid()));
      expect(generatedResults.size).toBe(count);
    });

  });

});
