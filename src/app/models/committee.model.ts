import { ApiResponse, Identifiable } from "./api-response.model";
import { DateValue } from "./date.model";
import { MemberFilterSelection } from "./member.model";

export interface CommitteeFile extends Identifiable {
  eventDate?: number;
  postcode?: string;
  fileType: string;
  fileNameData?: {
    originalFileName?: string;
    awsFileName?: string;
    title?: string;
  };
}

export interface CommitteeFileApiResponse extends ApiResponse {
  request: any;
  response?: CommitteeFile[] | CommitteeFile;
}

export interface GroupEvent extends Identifiable {
  selected: boolean;
  eventType: string;
  area: string;
  type: string;
  eventDate: number;
  eventTime: string;
  postcode: string;
  title: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  distance?: string;
}

export interface CommitteeMember {
  description: string;
  email: string;
  fullName: string;
  memberId?: string;
  nameAndDescription: string;
  type: string;
}

export interface CommitteeFileType {
  description: string;
  public?: boolean;
}

export interface CommitteeConfig {
  contactUs: {
    secretary: CommitteeMember;
    treasurer: CommitteeMember;
    membership: CommitteeMember;
    social: CommitteeMember;
    walks: CommitteeMember;
    support: CommitteeMember;
  };
  fileTypes: CommitteeFileType [];
}

export interface NotificationConfig {
  list?: string;
  customCampaignType?: string;
  campaignId?: string;
  editable: { signoffText: string; text: string };
  includeSignoffText: boolean;
  includeDownloadInformation: CommitteeFile;
  signoffText: () => any;
  addresseeType: string;
  recipients: MemberFilterSelection[];
  selectedRecipients: string[];
  signoffAs: { include: boolean; value: string };
  destinationType: string;
  text: () => any;
  groupEvents: () => any[];
  title: string;
}

export interface UserEdits {
  sendInProgress: boolean;
  cancelled: boolean;
  groupEvents: {
    events: GroupEvent[];
    fromDate: DateValue;
    toDate: DateValue;
    includeContact: boolean;
    includeDescription: boolean;
    includeLocation: boolean;
    includeWalks: boolean;
    includeSocialEvents: boolean;
    includeCommitteeEvents: boolean;
  };
}

export interface CommitteeYear {
  year: string;
  latestYear: boolean;
}
