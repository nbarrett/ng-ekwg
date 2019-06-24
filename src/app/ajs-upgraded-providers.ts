export function DateUtils($injector) {
  return $injector.get("DateUtils");
}

export function LoggedInMemberService($injector) {
  return $injector.get("LoggedInMemberService");
}

export const DateUtilsProvider = {
  provide: "DateUtils",
  useFactory: DateUtils,
  deps: ["$injector"]
};

export const LoggedInMemberServiceProvider = {
  provide: "LoggedInMemberService",
  useFactory: LoggedInMemberService,
  deps: ["$injector"]
};

