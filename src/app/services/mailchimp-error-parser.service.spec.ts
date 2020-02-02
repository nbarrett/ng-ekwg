import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { LoggerTestingModule } from "ngx-logger/testing";

import { MailchimpErrorParserService } from "./mailchimp-error-parser.service";

describe("MailchimpErrorParserService", () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [LoggerTestingModule]
  }));

  it("should be created", () => {
    const service: MailchimpErrorParserService = TestBed.get(MailchimpErrorParserService);
    expect(service).toBeTruthy();
  });
});
