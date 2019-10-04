import { HttpClient, HttpHandler } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { LoggerTestingModule } from "ngx-logger";

import { MeetupService } from "./meetup.service";

describe("MeetupService", () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [LoggerTestingModule],
    providers: [HttpClient, HttpHandler]
  }));

  it("should be created", () => {
    const service: MeetupService = TestBed.get(MeetupService);
    expect(service).toBeTruthy();
  });
});
