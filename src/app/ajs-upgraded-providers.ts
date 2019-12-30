export function MemberLoginService($injector) {
  return $injector.get("MemberLoginService");
}

export const MemberLoginServiceProvider = {
  provide: "MemberLoginService",
  useFactory: MemberLoginService,
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

export function ContentTextService($injector) {
  return $injector.get("ContentTextService");
}

export const ContentTextServiceProvider = {
  provide: "ContentTextService",
  useFactory: ContentTextService,
  deps: ["$injector"]
};

export function ConfigData($injector) {
  return $injector.get("ConfigData");
}

export const ConfigDataProvider = {
  provide: "ConfigData",
  useFactory: ConfigData,
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

export function MemberAuditService($injector) {
  return $injector.get("MemberAuditService");
}

export const MemberAuditServiceProvider = {
  provide: "MemberAuditService",
  useFactory: MemberAuditService,
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

export function MailchimpSegmentService($injector) {
  return $injector.get("MailchimpSegmentService");
}

export const MailchimpSegmentServiceProvider = {
  provide: "MailchimpSegmentService",
  useFactory: MailchimpSegmentService,
  deps: ["$injector"]
};

export function MailchimpCampaignService($injector) {
  return $injector.get("MailchimpCampaignService");
}

export const MailchimpCampaignServiceProvider = {
  provide: "MailchimpCampaignService",
  useFactory: MailchimpCampaignService,
  deps: ["$injector"]
};

export function MailchimpConfig($injector) {
  return $injector.get("MailchimpConfig");
}

export const MailchimpConfigProvider = {
  provide: "MailchimpConfig",
  useFactory: MailchimpConfig,
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
