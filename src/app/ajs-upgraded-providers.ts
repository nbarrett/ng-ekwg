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
  useFactory: ClipboardService,
  deps: ["$injector"]
};

export function RamblersUploadAudit($injector) {
  return $injector.get("RamblersUploadAudit");
}

export const RamblersUploadAuditProvider = {
  provide: "RamblersUploadAudit",
  useFactory: RamblersUploadAudit,
  deps: ["$injector"]
};

export function WalksService($injector) {
  return $injector.get("WalksService");
}

export const WalksServiceProvider = {
  provide: "WalksService",
  useFactory: WalksService,
  deps: ["$injector"]
};

export function WalkNotificationService($injector) {
  return $injector.get("WalkNotificationService");
}

export const WalkNotificationServiceProvider = {
  provide: "WalkNotificationService",
  useFactory: WalkNotificationService,
  deps: ["$injector"]
};

export function MemberService($injector) {
  return $injector.get("MemberService");
}

export const MemberServiceProvider = {
  provide: "MemberService",
  useFactory: MemberService,
  deps: ["$injector"]
};

export function RamblersWalksAndEventsService($injector) {
  return $injector.get("RamblersWalksAndEventsService");
}

export const RamblersWalksAndEventsServiceProvider = {
  provide: "RamblersWalksAndEventsService",
  useFactory: RamblersWalksAndEventsService,
  deps: ["$injector"]
};

export function Notifier($injector) {
  return $injector.get("Notifier");
}

export const NotifierProvider = {
  provide: "Notifier",
  useFactory: Notifier,
  deps: ["$injector"]
};

export function GoogleMapsConfig($injector) {
  return $injector.get("GoogleMapsConfig");
}

export const GoogleMapsConfigProvider = {
  provide: "GoogleMapsConfig",
  useFactory: GoogleMapsConfig,
  deps: ["$injector"]
};

export function MeetupService($injector) {
  return $injector.get("MeetupService");
}

export const MeetupServiceProvider = {
  provide: "MeetupService",
  useFactory: MeetupService,
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
