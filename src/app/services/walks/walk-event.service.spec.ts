import { TestBed } from "@angular/core/testing";
import { LoggerTestingModule } from "ngx-logger";
import { MemberLoginService } from "../../ajs-upgraded-providers";
import { Walk } from "../../models/walk.model";
import { AuditDeltaChangedItemsPipePipe } from "../../pipes/audit-delta-changed-items.pipe";
import { FullNameWithAliasPipe } from "../../pipes/full-name-with-alias.pipe";
import { FullNamePipe } from "../../pipes/full-name.pipe";
import { MemberIdToFullNamePipe } from "../../pipes/member-id-to-full-name.pipe";
import { StringUtilsService } from "../string-utils.service";

import { WalkEventService } from "./walk-event.service";
import { EventType } from "./walks-reference-data.service";

describe("WalksEventService", () => {
  const MemberLoginService = {
    memberLoggedIn: () => true,
    loggedInMember: () => {
    },
    allowWalkAdminEdits: () => true
  };

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      LoggerTestingModule
    ],
    providers: [
      AuditDeltaChangedItemsPipePipe, StringUtilsService, MemberIdToFullNamePipe, FullNameWithAliasPipe, FullNamePipe,
      {provide: "MemberLoginService", useValue: MemberLoginService},
      {provide: "MemberService", useValue: MemberLoginService}
      ]
  }));

  describe("dataAuditDelta", () => {
    it("changedItems should correctly calculate difference", () => {
      const service: WalkEventService = TestBed.get(WalkEventService);
      const walk: Walk = {
        walkDate: 12,
        gridReference: "123",
        postcode: "TN26 3HF",
        nearestTown: "this",
        events: [{
          eventType: EventType.AWAITING_APPROVAL, date: 23, memberId: "12",
          data: {nearestTown: "that"}
        }]
      };
      expect(service.walkDataAuditFor(walk, EventType.AWAITING_APPROVAL).changedItems)
        .toEqual([
          {fieldName: "walkDate", previousValue: undefined, currentValue: 12},
          {fieldName: "nearestTown", previousValue: "that", currentValue: "this"},
          {fieldName: "gridReference", previousValue: undefined, currentValue: "123"},
          {fieldName: "postcode", previousValue: undefined, currentValue: "TN26 3HF"},
        ]);
    });
  });

  describe("latestEventWithStatusChangeIs", () => {
    it("should return a value if there is no existing event with status change", () => {
      const service: WalkEventService = TestBed.get(WalkEventService);
      const walk: Walk = {
        walkDate: 12,
        gridReference: "123",
        postcode: "TN26 3HF",
        nearestTown: "this",
        events: [{
          eventType: EventType.WALK_DETAILS_COPIED, date: 23, memberId: "12",
          data: {nearestTown: "that"}
        }]
      };
      expect(service.latestEventWithStatusChangeIs(walk, EventType.AWAITING_APPROVAL))
        .toBe(false);
    });
  });
});
