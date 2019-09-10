import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { UpgradeModule } from "@angular/upgrade/static";
import { LoggerTestingModule } from "ngx-logger";
import { AuditDeltaChangedItemsPipePipe } from "../../pipes/audit-delta-changed-items.pipe";
import { AuditDeltaValuePipe } from "../../pipes/audit-delta-value.pipe";
import { DisplayDatePipe } from "../../pipes/display-date.pipe";
import { FullNameWithAliasPipe } from "../../pipes/full-name-with-alias.pipe";
import { FullNamePipe } from "../../pipes/full-name.pipe";
import { MemberIdToFullNamePipe } from "../../pipes/member-id-to-full-name.pipe";
import { ValueOrDefaultPipe } from "../../pipes/value-or-default.pipe";

import { WalkDisplayService } from "./walk-display.service";

const googleConfig = {
  getConfig: () => {
  }
};

const meetupService = {
  config: () => Promise.resolve(),
  eventsForStatus: () => Promise.resolve()
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
        AuditDeltaChangedItemsPipePipe,
        FullNameWithAliasPipe,
        FullNamePipe,
        AuditDeltaValuePipe,
        DisplayDatePipe,
        MemberIdToFullNamePipe,
        ValueOrDefaultPipe,
        {provide: "RamblersWalksAndEventsService", useValue: ramblersWalksAndEventsService},
        {provide: "LoggedInMemberService", useValue: loggedInMemberService},
        {provide: "WalkNotificationService", useValue: {}},
        {provide: "MailchimpSegmentService", useValue: {}},
        {provide: "MailchimpConfig", useValue: {}},
        {provide: "MailchimpCampaignService", useValue: {}},
        {provide: "MeetupService", useValue: meetupService},
        {provide: "ClipboardService", useValue: {}},
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
