import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { FileUtilsService } from "../../file-utils.service";
import { AccessLevel, AccessLevelData, CampaignSearchField, MemberResource, ResourceSubject, ResourceType, ResourceTypeData } from "../../models/member-resource.model";
import { SiteEditService } from "../../site-edit/site-edit.service";
import { ContentMetadataService } from "../content-metadata.service";
import { DateUtilsService } from "../date-utils.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberLoginService } from "./member-login.service";

@Injectable({
  providedIn: "root"
})
export class MemberResourcesReferenceDataService {

  private logger: Logger;

  constructor(private fileUtilsService: FileUtilsService,
              private siteEditService: SiteEditService,
              protected dateUtils: DateUtilsService,
              private contentMetadataService: ContentMetadataService,
              private memberLoginService: MemberLoginService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MemberResourcesReferenceDataService, NgxLoggerLevel.OFF);
  }

  subjects(): ResourceSubject[] {
    return [
      {
        id: "newsletter",
        description: "Newsletter"
      },
      {
        id: "siteReleaseNote",
        description: "Site Release Note"
      },
      {
        id: "walkPlanning",
        description: "Walking Planning Advice"
      }
    ];
  }

  resourceTypes(): ResourceTypeData[] {
    return [
      {
        id: "email",
        description: "Email",
        action: "View email",
        icon() {
          return "/assets/images/local/mailchimp.ico";
        },
        resourceUrl(memberResource: MemberResource) {
          return memberResource?.data?.campaign?.archive_url_long;
        }
      },
      {
        id: "file",
        description: "File",
        action: "Download",
        icon(memberResource) {
          return this.fileUtilsService.icon(memberResource, "data");
        },
        resourceUrl(memberResource) {
          return memberResource && memberResource.data.fileNameData ? this.urlService.baseUrl() + this.contentMetadataService.baseUrl("memberResources") + "/" + memberResource.data.fileNameData.awsFileName : "";
        }
      },
      {
        id: "url",
        action: "View page",
        description: "External Link",
        icon() {
          return "images/ramblers/favicon.ico";
        },
        resourceUrl() {
          return "TBA";
        }
      }
    ];
  }

  accessLevels(): AccessLevelData[] {
    return [
      {
        id: "hidden",
        description: "Hidden",
        filter: () => this.siteEditService.active() || false,
        includeAccessLevelIds: []
      },
      {
        id: "committee",
        description: "Committee",
        filter: () => this.siteEditService.active() || this.memberLoginService.allowCommittee(),
        includeAccessLevelIds: [AccessLevel.committee, AccessLevel.loggedInMember, AccessLevel.public, AccessLevel.hidden]
      },
      {
        id: "loggedInMember",
        description: "Logged-in member",
        filter: () => this.siteEditService.active() || this.memberLoginService.memberLoggedIn(),
        includeAccessLevelIds: [AccessLevel.loggedInMember]
      },
      {
        id: "public",
        description: "Public",
        filter: () => true,
        includeAccessLevelIds: [AccessLevel.public]
      }];
  }

  accessLevelViewTypes(): AccessLevelData[] {
    return this.accessLevels().filter(item => item.id !== AccessLevel.hidden);
  }

  defaultMemberResource(): MemberResource {
    return {
      data: {campaignSearchLimit: 1000, campaignSearchField: CampaignSearchField.title},
      resourceType: ResourceType.email,
      accessLevel: AccessLevel.hidden,
      createdDate: this.dateUtils.nowAsValue(),
      createdBy: this.memberLoginService.loggedInMember().memberId
    };
  }

  resourceTypeFor(resourceType) {
    const type = this.resourceTypes().find(type => type.id === resourceType);
    this.logger.debug("resourceType for", type, type);
    return type;
  }

  accessLevelFor(accessLevel: AccessLevel): AccessLevelData {
    const level: AccessLevelData = this.accessLevels().find(level => level.id === accessLevel);
    this.logger.info("accessLevel for", accessLevel, level);
    return level;
  }

}
