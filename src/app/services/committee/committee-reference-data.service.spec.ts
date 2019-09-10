import { TestBed, async} from "@angular/core/testing";
import { CommitteeReferenceDataService } from "./committee-reference-data.service";
import { LoggerTestingModule } from "ngx-logger";
import { CommitteeConfig } from "../../ajs-upgraded-providers";


const committeConfig = {
  getConfig: () => {
  }
};

const mockData = [
  {
    type: "chairman",
    fullName: "Kerry O'Grady",
    memberId: "53595420e4b094f2b232ca16",
    nameAndDescription: "Chairman (Kerry O'Grady)",
    description: "Chairman"
  },
  {
    type: "secretary",
    fullName: "Nicola Meadway",
    memberId: "589a4fa9c2ef165d6194adae",
    nameAndDescription: "Secretary (Nicola Meadway)",
    description: "Secretary"
  },
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

xdescribe("CommitteeReferenceDataService", () => {

  // beforeAll(done => {
  //   setTimeout(done, 5000);
  // });
  let spy;
  beforeEach(() => {


    TestBed.configureTestingModule({
      imports: [LoggerTestingModule],
      declarations: [],
      providers: [CommitteeReferenceDataService, LoggerTestingModule, {
        provide: "CommitteeConfig", useValue: committeConfig
      }]
    });
    spy = spyOn(committeConfig, "getConfig").and.returnValue(Promise.resolve(mockData));

  });

  it("should be created", (async(() => {
    const service: CommitteeReferenceDataService = TestBed.get(CommitteeReferenceDataService);
    expect(committeConfig.getConfig).toHaveBeenCalled();
    // service.whenStable
    spy.calls.mostRecent().returnValue.then(() => {
      expect(service.committeeMembersForRole("secretary")).toEqual([]);

    });
  })));
});
