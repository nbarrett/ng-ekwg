import { async, TestBed } from "@angular/core/testing";
import { CommitteeConfig, CommitteeMember } from "../../models/committee.model";
import { CommitteeReferenceData } from "./committee-reference-data";

const NIC = {
  type: "secretary",
  description: "Secretary",
  fullName: "Nic Meadway",
  memberId: "578bb704bd966f28bff5081b",
  email: "secretary@ekwg.co.uk",
  nameAndDescription: "Secretary (Nic Meadway)"
};

const EXPECTED_NIC: CommitteeMember = {
  description: "Secretary",
  fullName: "Nic Meadway",
  memberId: "578bb704bd966f28bff5081b",
  email: "secretary@ekwg.co.uk",
  nameAndDescription: "Secretary (Nic Meadway)",
  type: "secretary"
};

const mockData: CommitteeConfig = {
  committee: {
    contactUs: {
      chairman: {
        nameAndDescription: "Chairman (Kerry O'Grady)",
        type: "chairman",
        description: "Chairman",
        fullName: "Kerry O'Grady",
        email: "chairman@ekwg.co.uk",
        memberId: "52c595b3e4b003b51a33dac0"
      },
      secretary: NIC,
      treasurer: {
        nameAndDescription: "Treasurer (Jon Inglett)",
        type: "treasurer",
        description: "Treasurer",
        fullName: "Jon Inglett",
        email: "treasurer@ekwg.co.uk",
        memberId: "5a22f683bd966f3d367dbd80"
      },
      membership: {
        nameAndDescription: "Membership (Jenny Brown)",
        type: "membership",
        description: "Membership",
        fullName: "Jenny Brown",
        email: "membership@ekwg.co.uk",
        memberId: "5318ce73a08549a65a4a2899"
      },
      social: {
        nameAndDescription: "Social (Andrew Goh)",
        type: "secretary",
        description: "Social Co-ordinator",
        fullName: "Andrew Goh",
        email: "social@ekwg.co.uk",
        memberId: "5a281ddec2ef160584439b1f"
      },
      walks: {
        nameAndDescription: "Walks (Stuart Maisner)",
        type: "walks",
        description: "Walks Co-ordinator",
        fullName: "Stuart Maisner",
        email: "walks@ekwg.co.uk",
        memberId: "55470ac1e4b0996846fa82ba"
      },
      support: {
        nameAndDescription: "Technical Support (Nick Barrett)",
        type: "support",
        description: "Technical Support",
        fullName: "Nick Barrett",
        email: "nick.barrett@ekwg.co.uk",
        memberId: "52ab5d94e4b0f92ce9a5caee"
      }
    },
    fileTypes: [{description: "file", public: true}]
  },
};

describe("CommitteeReferenceData", () => {

  beforeEach(() => TestBed.configureTestingModule({}));

  it("should return members for role", async(() => {
    const service: CommitteeReferenceData = CommitteeReferenceData.create(mockData, null, null);
    expect(service.committeeMembersForRole("secretary")).toEqual([EXPECTED_NIC]);
  }));

  it("should return committee members", async(() => {
    const service: CommitteeReferenceData = CommitteeReferenceData.create(mockData, null, null);
    expect(service.committeeMembers()[1]).toEqual(EXPECTED_NIC);
  }));

});
