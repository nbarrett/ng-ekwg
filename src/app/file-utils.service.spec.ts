import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { CookieService } from "ngx-cookie-service";
import { LoggerTestingModule } from "ngx-logger/testing";

import { FileUtilsService } from "./file-utils.service";
import { ContentMetadataService } from "./services/content-metadata.service";
import { StringUtilsService } from "./services/string-utils.service";

describe("FileUtilsService", () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      LoggerTestingModule,
      HttpClientTestingModule,
      RouterTestingModule,
    ],
    providers: [
      CookieService,
      ContentMetadataService,
    ],
  }));

  it("fileExtensionIs should return true when matched", () => {
    const service: FileUtilsService = TestBed.inject(FileUtilsService);
    expect(service.fileExtensionIs("nick.doc", ["doc"])).toBe(true);
  });

  it("fileExtensionIs should return false when matched", () => {
    const service: FileUtilsService = TestBed.inject(FileUtilsService);
    expect(service.fileExtensionIs("nick.txt", ["doc"])).toBe(false);
  });
});
