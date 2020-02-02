import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { LoggerTestingModule } from "ngx-logger/testing";

import { EmailSubscriptionService } from "./email-subscription.service";

describe("EmailSubscriptionService", () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [LoggerTestingModule, HttpClientTestingModule]
  }));

  it("should be created", () => {
    const service: EmailSubscriptionService = TestBed.get(EmailSubscriptionService);
    expect(service).toBeTruthy();
  });
});
