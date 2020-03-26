import { TestBed } from "@angular/core/testing";

import { MailchimpSegmentService } from "./mailchimp-segment.service";

describe("MailchimpSegmentService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: MailchimpSegmentService = TestBed.get(MailchimpSegmentService);
    expect(service).toBeTruthy();
  });
});
