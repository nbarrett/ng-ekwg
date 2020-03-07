import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { LoggerTestingModule } from "ngx-logger/testing";
import { ContentMetadata, ContentMetadataApiResponse } from "../models/content-metadata.model";
import { FullNameWithAliasPipe } from "../pipes/full-name-with-alias.pipe";
import { FullNamePipe } from "../pipes/full-name.pipe";
import { MemberIdToFullNamePipe } from "../pipes/member-id-to-full-name.pipe";

import { ContentMetadataService } from "./content-metadata.service";
import { StringUtilsService } from "./string-utils.service";

describe("ContentMetadataService", () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [LoggerTestingModule, HttpClientTestingModule],
    providers: [StringUtilsService, MemberIdToFullNamePipe, FullNamePipe, FullNameWithAliasPipe]

  }));

  const input: ContentMetadataApiResponse = {
    request: "query",
    action: "query",
    response: {
      id: "53729e3fb1e8b51319e3a2ec",
      contentMetaDataType: "imagesHome",
      baseUrl: "api/aws/s3/imagesHome",
      files: [
        {
          image: "aws/s3/imagesHome/5c02d083-35c5-4175-9411-3698d1af7f68.jpeg",
          text: "Sabine's walk around Egerton and Grafty Green"
        },
        {
          image: "api/aws/s3/imagesHome/b2ed2654-cf74-4370-a0e8-20165802415a.jpeg",
          text: "Tim's walk around Benenden"
        },
      ]
    },
  };

  const output: ContentMetadata = {
    id: "53729e3fb1e8b51319e3a2ec",
    contentMetaDataType: "imagesHome",
    baseUrl: "api/aws/s3/imagesHome",
    files: [
      {
        image: "api/aws/s3/imagesHome/5c02d083-35c5-4175-9411-3698d1af7f68.jpeg",
        text: "Sabine's walk around Egerton and Grafty Green"
      },
      {
        image: "api/aws/s3/imagesHome/b2ed2654-cf74-4370-a0e8-20165802415a.jpeg",
        text: "Tim's walk around Benenden"
      },
    ]
  };
  it("should transform ContentMetadataApiResponse with incorrect image paths to correct ones of type ContentMetadata", () => {
    const service: ContentMetadataService = TestBed.get(ContentMetadataService);
    expect(service.transform(input, "imagesHome")).toEqual(output);
  });
});