export function LoggedInMemberService($injector) {
  return $injector.get("LoggedInMemberService");
}

export function AuthenticationModalsService($injector) {
  return $injector.get("AuthenticationModalsService");
}

export function ContentText($injector) {
  return $injector.get("ContentText");
}

export function CommitteeConfig($injector) {
  return $injector.get("CommitteeConfig");
}

export const CommitteeConfigProvider = {
  provide: "CommitteeConfig",
  useFactory: CommitteeConfig,
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

export const LegacyUrlService = ["$timeout", "$log", "$location", ($timeout, $log, $location) => {
  const logger = $log.getInstance("LegacyUrlService");
  $log.logLevels["LegacyUrlService"] = $log.LEVEL.OFF;

  return {navigateTo: (page, area) => {
      $timeout(() => {
        const url = "/" + page + (area ? "/" + area : "");
        logger.info("navigating to page:", page, "area:", area, "->", url);
        $location.path(url);
        logger.info("$location.path is now", $location.path());
      }, 1);
    }};

}];
