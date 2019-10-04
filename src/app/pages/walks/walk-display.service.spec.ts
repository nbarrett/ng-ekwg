import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { UpgradeModule } from "@angular/upgrade/static";
import { LoggerTestingModule } from "ngx-logger";
import { MeetupEventResponse } from "../../models/meetup-event-response.model";
import { AuditDeltaChangedItemsPipePipe } from "../../pipes/audit-delta-changed-items.pipe";
import { AuditDeltaValuePipe } from "../../pipes/audit-delta-value.pipe";
import { DisplayDatePipe } from "../../pipes/display-date.pipe";
import { FullNameWithAliasPipe } from "../../pipes/full-name-with-alias.pipe";
import { FullNamePipe } from "../../pipes/full-name.pipe";
import { MemberIdToFullNamePipe } from "../../pipes/member-id-to-full-name.pipe";
import { ValueOrDefaultPipe } from "../../pipes/value-or-default.pipe";
import { WalksReferenceService } from "../../services/walks/walks-reference-data.service";
import { WalkDisplayService } from "./walk-display.service";

const anyWalkDate = 123364;
const walkLeaderMemberId = "walk-leader-id";
const dontCare = [];

const googleConfig = {
  getConfig: () => {
  }
};

const meetupService = {
  config: () => Promise.resolve(),
  eventsForStatus: () => Promise.resolve([] as MeetupEventResponse[])
};

const ramblersWalksAndEventsService = {
  walkBaseUrl: () => {
  }
};

const loggedInMemberService = {
  memberLoggedIn: () => false,
  loggedInMember: () => {
  },
  allowWalkAdminEdits: () => false
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
    spy = spyOn(googleConfig, "getConfig").and.returnValue(Promise.resolve({}));
    spy = spyOn(ramblersWalksAndEventsService, "walkBaseUrl").and.returnValue(Promise.resolve({}));
  });

  describe("toWalkAccessMode", () => {

    it("should return edit if user is logged in and admin", () => {
      spy = spyOn(loggedInMemberService, "memberLoggedIn").and.returnValue(true);
      spy = spyOn(loggedInMemberService, "allowWalkAdminEdits").and.returnValue(true);
      spy = spyOn(loggedInMemberService, "loggedInMember").and.returnValue({memberId: "some-other-id"});
      const service: WalkDisplayService = TestBed.get(WalkDisplayService);
      expect(service.toWalkAccessMode({walkLeaderMemberId: "any-walk-id", events: dontCare, walkDate: anyWalkDate})).toEqual(WalksReferenceService.walkAccessModes.edit);
    });

    it("should return edit if user is logged in and not admin but is leader", () => {
      spy = spyOn(loggedInMemberService, "memberLoggedIn").and.returnValue(true);
      spy = spyOn(loggedInMemberService, "allowWalkAdminEdits").and.returnValue(false);
      spy = spyOn(loggedInMemberService, "loggedInMember").and.returnValue({memberId: "leader-id"});
      const service: WalkDisplayService = TestBed.get(WalkDisplayService);
      expect(service.toWalkAccessMode({walkLeaderMemberId: "leader-id", events: dontCare, walkDate: anyWalkDate})).toEqual(WalksReferenceService.walkAccessModes.edit);
    });

    it("should return lead if user is logged in and not admin and walk doest have a leader", () => {
      spy = spyOn(loggedInMemberService, "memberLoggedIn").and.returnValue(true);
      spy = spyOn(loggedInMemberService, "allowWalkAdminEdits").and.returnValue(false);
      spy = spyOn(loggedInMemberService, "loggedInMember").and.returnValue({memberId: "leader-id"});
      const service: WalkDisplayService = TestBed.get(WalkDisplayService);
      expect(service.toWalkAccessMode({events: dontCare, walkDate: 0})).toEqual(WalksReferenceService.walkAccessModes.lead);
    });

    it("should return view if user is not logged in", () => {
      spy = spyOn(loggedInMemberService, "memberLoggedIn").and.returnValue(false);
      spy = spyOn(loggedInMemberService, "allowWalkAdminEdits").and.returnValue(false);
      const service: WalkDisplayService = TestBed.get(WalkDisplayService);
      expect(service.toWalkAccessMode({walkLeaderMemberId, events: dontCare, walkDate: anyWalkDate})).toEqual(WalksReferenceService.walkAccessModes.view);
    });

    it("should return view if user is not member admin and not leading the walk", () => {
      spy = spyOn(loggedInMemberService, "memberLoggedIn").and.returnValue(true);
      spy = spyOn(loggedInMemberService, "allowWalkAdminEdits").and.returnValue(false);
      spy = spyOn(loggedInMemberService, "loggedInMember").and.returnValue({memberId: "leader-id"});
      const service: WalkDisplayService = TestBed.get(WalkDisplayService);
      expect(service.toWalkAccessMode({walkLeaderMemberId: "another-walk-leader-id", events: dontCare, walkDate: anyWalkDate})).toEqual(WalksReferenceService.walkAccessModes.view);
    });
  });

});
