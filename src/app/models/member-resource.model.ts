import { ApiResponse, Identifiable } from "./api-response.model";
import { FileNameData } from "./aws-object.model";
import { MailchimpCampaign } from "./mailchimp.model";

export interface FilterParameters {
  quickSearch: string;
  filter?: AccessLevelData;
}

export enum CampaignSearchField {
  subject = "subject",
  title = "title"
}

export enum AccessLevel {
  hidden = "hidden",
  committee = "committee",
  loggedInMember = "loggedInMember",
  public = "public"
}

export enum ResourceType {
  email = "email",
  file = "file",
  url = "url",
  public = "public"
}

export interface ResourceSubject extends Identifiable {
  description: string;
}

export interface ResourceTypeData extends Identifiable {
  description: string;
  action: string;
  icon: (memberResource?: MemberResource) => string;
  resourceUrl: (memberResource: MemberResource) => string;
}

export interface AccessLevelData extends Identifiable {
  description: string;
  filter: () => boolean;
  includeAccessLevelIds: string[];
}

export interface MemberResource extends Identifiable {
  data: {
    campaignSearchLimit: number;
    campaignSearchTerm?: string;
    campaignSearchField: CampaignSearchField;
    campaign?: MailchimpCampaign;
    fileNameData?: FileNameData;
  };
  resourceType: ResourceType;
  accessLevel: AccessLevel;
  createdDate: number;
  createdBy: string;
  title?: string;
  resourceDate?: number;
  description?: string;
  subject?: string;
}

export interface MemberResourceApiResponse extends ApiResponse {
  request: any;
  response?: MemberResource | MemberResource[];
}

export interface MemberResourcesPermissions {
  committee?: boolean;
  delete?: boolean;
  edit?: boolean;
}
