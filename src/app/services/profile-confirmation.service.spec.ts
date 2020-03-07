import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { CookieService } from "ngx-cookie-service";
import { LoggerTestingModule } from "ngx-logger/testing";
import { FullNameWithAliasPipe } from "../pipes/full-name-with-alias.pipe";
import { FullNamePipe } from "../pipes/full-name.pipe";
import { MemberIdToFullNamePipe } from "../pipes/member-id-to-full-name.pipe";

import { ProfileConfirmationService } from "./profile-confirmation.service";
import { StringUtilsService } from "./string-utils.service";

describe("ProfileConfirmationService", () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [LoggerTestingModule, HttpClientTestingModule, RouterTestingModule],
    providers: [CookieService, StringUtilsService, MemberIdToFullNamePipe, FullNamePipe, FullNameWithAliasPipe]
  }));

  it("should be created", () => {
    const service: ProfileConfirmationService = TestBed.get(ProfileConfirmationService);
    expect(service).toBeTruthy();
  });
});