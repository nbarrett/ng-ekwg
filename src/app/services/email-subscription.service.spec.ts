import { TestBed } from "@angular/core/testing";

import { EmailSubscriptionService } from "./email-subscription.service";

describe("EmailSubscriptionService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: EmailSubscriptionService = TestBed.get(EmailSubscriptionService);
    expect(service).toBeTruthy();
  });
});
