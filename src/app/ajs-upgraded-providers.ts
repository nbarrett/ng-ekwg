export function DateUtils($injector) {
  return $injector.get("DateUtils");
}

export function LoggedInMemberService($injector) {
  return $injector.get("LoggedInMemberService");
}

export function AuthenticationModalsService($injector) {
  return $injector.get("AuthenticationModalsService");
}

export function ContentText($injector) {
  return $injector.get("ContentText");
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

export const AuthenticationModalsServiceProvider = {
  provide: "AuthenticationModalsService",
  useFactory: AuthenticationModalsService,
  deps: ["$injector"]
};

export const ContentTextProvider = {
  provide: "ContentText",
  useFactory: ContentText,
  deps: ["$injector"]
};

