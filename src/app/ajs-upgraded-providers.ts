export function AuthenticationModalsService($injector) {
  return $injector.get("AuthenticationModalsService");
}

export const AuthenticationModalsServiceProvider = {
  provide: "AuthenticationModalsService",
  useFactory: AuthenticationModalsService,
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

export function MailchimpListService($injector) {
  return $injector.get("MailchimpListService");
}

export const MailchimpListServiceProvider = {
  provide: "MailchimpListService",
  useFactory: MailchimpListService,
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

export function RamblersWalksAndEventsService($injector) {
  return $injector.get("RamblersWalksAndEventsService");
}

export const RamblersWalksAndEventsServiceProvider = {
  provide: "RamblersWalksAndEventsService",
  useFactory: RamblersWalksAndEventsService,
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
