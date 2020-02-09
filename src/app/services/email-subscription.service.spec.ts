import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { RouterModule } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { CookieService } from "ngx-cookie-service";
import { LoggerTestingModule } from "ngx-logger/testing";
import { FullNameWithAliasPipe } from "../pipes/full-name-with-alias.pipe";
import { FullNamePipe } from "../pipes/full-name.pipe";
import { MemberIdToFullNamePipe } from "../pipes/member-id-to-full-name.pipe";

import { EmailSubscriptionService } from "./email-subscription.service";
import { StringUtilsService } from "./string-utils.service";

describe("EmailSubscriptionService", () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [LoggerTestingModule, HttpClientTestingModule, RouterTestingModule],
    providers: [CookieService, StringUtilsService, MemberIdToFullNamePipe, FullNamePipe, FullNameWithAliasPipe]

  }));

  it("should be created", () => {
    const service: EmailSubscriptionService = TestBed.get(EmailSubscriptionService);
    expect(service).toBeTruthy();
  });
});
