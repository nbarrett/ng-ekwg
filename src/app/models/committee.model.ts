import { ApiResponse, Identifiable } from "./api-response.model";
import { DateValue } from "./date.model";
import { MemberFilterSelection } from "./member.model";

export interface CommitteeFile extends Identifiable {
  eventDate?: number;
  createdDate?: number;
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
  eventDate: number;
  eventTime?: string;
  distance?: string;
  postcode: string;
  title: string;
  description: string;
  contactName: string;
  contactPhone?: string;
  contactEmail: string;
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

export interface GroupEventsFilter {
  selectAll: boolean;
  fromDate: DateValue;
  toDate: DateValue;
  includeContact: boolean;
  includeDescription: boolean;
  includeLocation: boolean;
  includeWalks: boolean;
  includeSocialEvents: boolean;
  includeCommitteeEvents: boolean;
}

export interface NotificationContent {
  title: string;
  list?: string;
  customCampaignType?: string;
  campaignId?: string;
  includeDownloadInformation: boolean;
  addresseeType: string;
  recipients: MemberFilterSelection[];
  selectedMemberIds: string[];
  signoffAs: { include: boolean; value: string; };
  text: { include: boolean; value: string; };
  signoffText: { include: boolean; value: string; };
  destinationType: string;
}

export interface Notification {
  cancelled: boolean;
  content: NotificationContent;
  groupEventsFilter: GroupEventsFilter;
  groupEvents: GroupEvent[];
}

export interface CommitteeYear {
  year: string;
  latestYear: boolean;
}
