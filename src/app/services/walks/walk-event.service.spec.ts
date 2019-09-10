import { TestBed } from "@angular/core/testing";
import { LoggerTestingModule } from "ngx-logger";
import { LoggedInMemberService } from "../../ajs-upgraded-providers";
import { Walk } from "../../models/walk.model";
import { AuditDeltaChangedItemsPipePipe } from "../../pipes/audit-delta-changed-items.pipe";

import { WalkEventService } from "./walk-event.service";
import { EventType } from "./walks-reference-data.service";

describe("WalksEventService", () => {
  const loggedInMemberService = {
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
      AuditDeltaChangedItemsPipePipe,
      {provide: "LoggedInMemberService", useValue: loggedInMemberService}]
  }));

  it("dataAuditDelta.changedItems should correctly calculate difference", () => {
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
})
;
