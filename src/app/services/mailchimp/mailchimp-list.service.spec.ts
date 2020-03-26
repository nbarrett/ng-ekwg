import { TestBed } from "@angular/core/testing";

import { MailchimpListService } from "./mailchimp-list.service";

describe("MailchimpListService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should do something", () => {
    const service: MailchimpListService = TestBed.get(MailchimpListService);
    expect(service).toBeTruthy();
  });
});
