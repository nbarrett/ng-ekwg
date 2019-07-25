export function LoggedInMemberService($injector) {
  return $injector.get("LoggedInMemberService");
}

export const LoggedInMemberServiceProvider = {
  provide: "LoggedInMemberService",
  useFactory: LoggedInMemberService,
  deps: ["$injector"]
};


export function AuthenticationModalsService($injector) {
  return $injector.get("AuthenticationModalsService");
}

export const AuthenticationModalsServiceProvider = {
  provide: "AuthenticationModalsService",
  useFactory: AuthenticationModalsService,
  deps: ["$injector"]
};

export function ContentText($injector) {
  return $injector.get("ContentText");
}

export const ContentTextProvider = {
  provide: "ContentText",
  useFactory: ContentText,
  deps: ["$injector"]
};

export function CommitteeConfig($injector) {
  return $injector.get("CommitteeConfig");
}

export const CommitteeConfigProvider = {
  provide: "CommitteeConfig",
  useFactory: CommitteeConfig,
  deps: ["$injector"]
};


export function ClipboardService($injector) {
  return $injector.get("ClipboardService");
}

export const ClipboardServiceProvider = {
  provide: "ClipboardService",
  useFactory: ContentText,
  deps: ["$injector"]
};

export function RamblersUploadAudit($injector) {
  return $injector.get("RamblersUploadAudit");
}

export const RamblersUploadAuditProvider = {
  provide: "RamblersUploadAudit",
  useFactory: ContentText,
  deps: ["$injector"]
};

export const WalksServiceProvider = {
  provide: "WalksService",
  useFactory: $injector => $injector.get("WalksService"),
  deps: ["$injector"]
};

export const WalksQueryServiceProvider = {
  provide: "WalksQueryService",
  useFactory: $injector => $injector.get("WalksQueryService"),
  deps: ["$injector"]
};

export const WalkNotificationServiceProvider = {
  provide: "WalkNotificationService",
  useFactory: $injector => $injector.get("WalkNotificationService"),
  deps: ["$injector"]
};

export const MemberServiceProvider = {
  provide: "MemberService",
  useFactory: $injector => $injector.get("MemberService"),
  deps: ["$injector"]
};

export const RamblersWalksAndEventsServiceProvider = {
  provide: "RamblersWalksAndEventsService",
  useFactory: $injector => $injector.get("RamblersWalksAndEventsService"),
  deps: ["$injector"]
};

export const NotifierProvider = {
  provide: "Notifier",
  useFactory: $injector => $injector.get("Notifier"),
  deps: ["$injector"]
};

export const GoogleMapsConfigProvider = {
  provide: "GoogleMapsConfig",
  useFactory: $injector => $injector.get("GoogleMapsConfig"),
  deps: ["$injector"]
};

export const MeetupServiceProvider = {
  provide: "MeetupService",
  useFactory: $injector => $injector.get("MeetupService"),
  deps: ["$injector"]
};

export const LegacyUrlService = ["$timeout", "$log", "$location", ($timeout, $log, $location) => {
  const logger = $log.getInstance("LegacyUrlService");
  $log.logLevels["LegacyUrlService"] = $log.LEVEL.OFF;

  return {
    navigateTo: (page, area) => {
      $timeout(() => {
        const url = "/" + page + (area ? "/" + area : "");
        logger.info("navigating to page:", page, "area:", area, "->", url);
        $location.path(url);
        logger.info("$location.path is now", $location.path());
      }, 1);
    }
  };

}];
