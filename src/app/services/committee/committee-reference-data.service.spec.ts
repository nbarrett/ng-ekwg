import { async, TestBed } from "@angular/core/testing";
import { LoggerTestingModule } from "ngx-logger/testing";
import { CommitteeMember } from "../../models/committee.model";
import { CommitteeConfigService } from "../commitee-config.service";
import { CommitteeReferenceDataService } from "./committee-reference-data.service";

const NIC = {
  description: "Secretary",
  fullName: "Nic Meadway",
  memberId: "578bb704bd966f28bff5081b",
  email: "secretary@ekwg.co.uk"
};

const EXPECTED_NIC: CommitteeMember = {
  type: "secretary",
  description: "Secretary",
  fullName: "Nic Meadway",
  memberId: "578bb704bd966f28bff5081b",
  email: "secretary@ekwg.co.uk",
  nameAndDescription: "Secretary (Nic Meadway)"
};

const mockData = {
  committee: {
    contactUs: {
      chairman: {
        description: "Chairman",
        fullName: "Kerry O'Grady",
        email: "chairman@ekwg.co.uk",
        memberId: "52c595b3e4b003b51a33dac0"
      },
      secretary: NIC,
      treasurer: {
        description: "Treasurer",
        fullName: "Jon Inglett",
        email: "treasurer@ekwg.co.uk",
        memberId: "5a22f683bd966f3d367dbd80"
      },
      membership: {
        description: "Membership",
        fullName: "Jenny Brown",
        email: "membership@ekwg.co.uk",
        memberId: "5318ce73a08549a65a4a2899"
      },
      social: {
        description: "Social Co-ordinator",
        fullName: "Andrew Goh",
        email: "social@ekwg.co.uk",
        memberId: "5a281ddec2ef160584439b1f"
      },
      walks: {
        description: "Walks Co-ordinator",
        fullName: "Stuart Maisner",
        email: "walks@ekwg.co.uk",
        memberId: "55470ac1e4b0996846fa82ba"
      },
      support: {
        description: "Technical Support",
        fullName: "Nick Barrett",
        email: "nick.barrett@ekwg.co.uk",
        memberId: "52ab5d94e4b0f92ce9a5caee"
      }
    }
  }
};

describe("CommitteeReferenceDataService", () => {

  beforeEach(() => TestBed.configureTestingModule({
    imports: [LoggerTestingModule],
    providers: [{
      provide: CommitteeConfigService, useValue: {
        getConfig: () => Promise.resolve(mockData)
      }
    }]
  }));

  it("should return members for role", async(() => {
    const service: CommitteeReferenceDataService = TestBed.inject(CommitteeReferenceDataService);
    setTimeout(() => {
      expect(service.committeeMembersForRole("secretary")).toEqual([EXPECTED_NIC]);
    }, 0);
  }));

  it("should return committee members", async(() => {
    const service: CommitteeReferenceDataService = TestBed.inject(CommitteeReferenceDataService);
    setTimeout(() => {
      expect(service.committeeMembers()[1]).toEqual(EXPECTED_NIC);
    }, 0);
  }));

});
