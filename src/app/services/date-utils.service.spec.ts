import { TestBed } from "@angular/core/testing";
import { DateUtilsService } from "./date-utils.service";
import * as moment from "moment-timezone";
import { LoggerTestingModule } from "ngx-logger";

describe("DateUtilsService", () => {

  beforeEach(() => TestBed.configureTestingModule({
    imports: [LoggerTestingModule],
    providers: []
  }).compileComponents());

  describe("asMoment", () => {

    it("should return a moment instance when passed a string and a date format", () => {
      const DateUtils: DateUtilsService = TestBed.get(DateUtilsService);
      expect(DateUtils.asMoment("Weds 09 July 2014", "ddd DD MMMM YYYY").valueOf() - 1404860400000).toBeLessThan(2);
    });

  });

  describe("nowAsValue", () => {
    it("should return a millisecond timestamp value as of now", () => {
      const DateUtils: DateUtilsService = TestBed.get(DateUtilsService);
      expect(DateUtils.nowAsValue() - Date.parse(new Date().toISOString())).toBeLessThan(2);
    });
  });

  describe("asValue", () => {

    it("should return a millisecond timestamp value passed a string and a date format", () => {
      const DateUtils: DateUtilsService = TestBed.get(DateUtilsService);
      expect(DateUtils.asValue("Fri 13 June 2014", "ddd DD MMMM YYYY")).toEqual(1402614000000);
    });

    it("should return the same value when passed a millisecond timestamp value", () => {
      const DateUtils: DateUtilsService = TestBed.get(DateUtilsService);
      expect(DateUtils.asValue(1404860400000)).toEqual(1404860400000);
    });

    it("should return a millisecond timestamp value without date when datePortionOnly is true", () => {
      const DateUtils: DateUtilsService = TestBed.get(DateUtilsService);
      expect(DateUtils.asValueNoTime(1402697264866)).toEqual(1402614000000);
      expect(DateUtils.asValueNoTime(1402614000000)).toEqual(1402614000000);
    });

  });

  describe("asString", () => {

    it("should return string version of date given a timestamp, no input format and output format", () => {
      const DateUtils: DateUtilsService = TestBed.get(DateUtilsService);
      expect(DateUtils.asString(1402697264866, undefined, "ddd DD MMMM YYYY, h:mm:ss a"))
        .toEqual("Fri 13 June 2014, 11:07:44 pm");
      expect(DateUtils.asString(1402614000000, undefined, "ddd DD MMMM YYYY, h:mm:ss a"))
        .toEqual("Fri 13 June 2014, 12:00:00 am");
      expect(DateUtils.asString(1402614000000, undefined, "ddd DD MMMM YYYY, h:mm:ss a")).toEqual("Fri 13 June 2014, 12:00:00 am");
    });

    it("should return string version of date in format 2 given a string, input format 1 and output format 2", () => {
      const DateUtils: DateUtilsService = TestBed.get(DateUtilsService);
      expect(DateUtils.asString("Fri 13 June 2014, 11:07:44 pm", "ddd DD MMMM YYYY, h:mm:ss a",
        "ddd DD MMMM YYYY, h:mm:ss a"))
        .toEqual("Fri 13 June 2014, 11:07:44 pm");
      expect(DateUtils.asString("Fri 13 June 2014, 11:07:44 pm", "ddd DD MMMM YYYY, h:mm:ss a",
        "DD-MMM-YYYY")).toEqual("13-Jun-2014");
    });

    it("should return invalid date if invalid string passed", () => {
      const DateUtils: DateUtilsService = TestBed.get(DateUtilsService);

      expect(DateUtils.asString("10.0", "HH mm", "HH:mm")).toEqual("10:00");
      expect(DateUtils.asString("TBD", "HH mm", "HH:mm")).toEqual("Invalid date");
    });

  });

  describe("momentNow", () => {

    it("should create a moment as of now when passed a string and a date format", () => {
      const DateUtils: DateUtilsService = TestBed.get(DateUtilsService);
      const testMoment = moment();
      expect(DateUtils.momentNow() - testMoment).toBeLessThan(2);
    });

  });

});
