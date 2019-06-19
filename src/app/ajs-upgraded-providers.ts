import { InjectionToken } from "@angular/core";

export const DateUtils = new InjectionToken("DateUtils");
export const LoggedInMemberService = new InjectionToken("LoggedInMemberService");

export const DateUtilsProvider = {
  provide: "DateUtils",
  useFactory: $injector => $injector.get("DateUtils"),
  deps: ["$injector"]
};

export const LoggedInMemberServiceProvider = {
  provide: "LoggedInMemberService",
  useFactory: $injector => $injector.get("LoggedInMemberService"),
  deps: ["$injector"]
};

