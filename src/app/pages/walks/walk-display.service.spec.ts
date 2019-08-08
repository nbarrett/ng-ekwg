import { TestBed } from "@angular/core/testing";

import { WalkDisplayService } from "./walk-display.service";
import { LoggerTestingModule } from "ngx-logger";
import { RouterTestingModule } from "@angular/router/testing";
import { UpgradeModule } from "@angular/upgrade/static";

const googleConfig = {
  getConfig: () => {
  }
};

const ramblersWalksAndEventsService = {
  walkBaseUrl: () => {
  }
};

const loggedInMemberService = {
  memberLoggedIn: () => true,
  loggedInMember: () => {
  },
  allowWalkAdminEdits: () => true
};

const memberService = {
  allLimitedFields: () => Promise.resolve({email: "test@example.com"}),
  filterFor: {GROUP_MEMBERS: ""}
};

describe("WalkDisplayService", () => {
  let spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule,
        RouterTestingModule,
        UpgradeModule
      ],
      providers: [
        {provide: "RamblersWalksAndEventsService", useValue: ramblersWalksAndEventsService},
        {provide: "LoggedInMemberService", useValue: loggedInMemberService},
        {provide: "WalkNotificationService", useValue: {}},
        {provide: "MemberService", useValue: memberService},
        {provide: "GoogleMapsConfig", useValue: googleConfig}]
    });
    spy = spyOn(loggedInMemberService, "loggedInMember").and.returnValue({memberId: "123"});
    spy = spyOn(googleConfig, "getConfig").and.returnValue(Promise.resolve({}));
    spy = spyOn(ramblersWalksAndEventsService, "walkBaseUrl").and.returnValue(Promise.resolve({}));
  });

  describe("toWalkEditMode", () => {

    it("should return lead if user is logged in", () => {
      const service: WalkDisplayService = TestBed.get(WalkDisplayService);
      expect(service.toWalkEditMode({walkLeaderMemberId: "1w3", events: [], walkDate: 123364})).toEqual({
        caption: "edit",
        title: "Edit existing",
        editEnabled: true
      });
    });

    it("should return undefined if user is not logged in", () => {
      spy = spyOn(loggedInMemberService, "memberLoggedIn").and.returnValue(false);
      const service: WalkDisplayService = TestBed.get(WalkDisplayService);
      expect(service.toWalkEditMode({walkLeaderMemberId: "1w3", events: [], walkDate: 123364})).toBeUndefined();
    });
  });

});
