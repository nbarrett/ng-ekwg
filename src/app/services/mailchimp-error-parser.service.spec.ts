import { TestBed } from "@angular/core/testing";

import { MailchimpErrorParserService } from "./mailchimp-error-parser.service";

describe("MailchimpErrorParserService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: MailchimpErrorParserService = TestBed.get(MailchimpErrorParserService);
    expect(service).toBeTruthy();
  });
});
