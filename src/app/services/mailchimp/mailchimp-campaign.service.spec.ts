import { TestBed } from "@angular/core/testing";

import { MailchimpCampaignService } from "./mailchimp-campaign.service";

describe("MailchimpCampaignService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: MailchimpCampaignService = TestBed.get(MailchimpCampaignService);
    expect(service).toBeTruthy();
  });
});
