import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { CookieService } from "ngx-cookie-service";
import { LoggerTestingModule } from "ngx-logger/testing";
import { FullNameWithAliasPipe } from "../../pipes/full-name-with-alias.pipe";
import { FullNamePipe } from "../../pipes/full-name.pipe";
import { MemberIdToFullNamePipe } from "../../pipes/member-id-to-full-name.pipe";
import { CommitteeMember } from "./committee-member.model";
import { CommitteeReferenceDataService } from "./committee-reference-data.service";

const NIC: CommitteeMember = {
  type: "secretary",
  email: "secretary@ekwg.co.uk",
  fullName: "Nicola Meadway",
  memberId: "589a4fa9c2ef165d6194adae",
  nameAndDescription: "Secretary (Nicola Meadway)",
  description: "Secretary"
};
const mockData = [
  {
    type: "chairman",
    fullName: "Kerry O'Grady",
    memberId: "53595420e4b094f2b232ca16",
    nameAndDescription: "Chairman (Kerry O'Grady)",
    description: "Chairman"
  },
  NIC,
  {
    type: "treasurer",
    fullName: "Jon Inglett",
    memberId: "5a25ed0fc2ef1616079080d5",
    nameAndDescription: "Treasurer (Jon Inglett)",
    description: "Treasurer"
  },
  {
    type: "membership",
    fullName: "Desiree Nel",
    memberId: "535954ebe4b094f2b232cb1c",
    nameAndDescription: "Membership (Desiree Nel)",
    description: "Membership"
  }];

const committeConfig = {
  getConfig: () => Promise.resolve(mockData)
};

describe("CommitteeReferenceDataService", () => {

  beforeEach(() => new Promise((resolve, reject) => {
    TestBed.configureTestingModule({
      imports: [LoggerTestingModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [],
      providers: [CookieService, MemberIdToFullNamePipe,
        FullNamePipe,
        FullNameWithAliasPipe,
        {
          provide: "CommitteeConfig", useValue: committeConfig
        }],
    });
    resolve();
  }));

  // it("should be created", (done: DoneFn) => {
  //   const service: CommitteeReferenceDataService = TestBed.get(CommitteeReferenceDataService);
  //   service.committeeMembersForRole("secretary")(response => {
  //   });
  //   expect(.toBe([NIC]);
  // });
// ));
})
;

