export function ClipboardService($injector) {
  return $injector.get("ClipboardService");
}

export const ClipboardServiceProvider = {
  provide: "ClipboardService",
  useFactory: ClipboardService,
  deps: ["$injector"]
};
