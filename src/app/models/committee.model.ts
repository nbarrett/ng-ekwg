import { ApiResponse, Identifiable } from "./api-response.model";
import { FileNameData } from "./aws-object.model";
import { DateValue } from "./date.model";

export interface CommitteeFile extends Identifiable {
  eventDate?: number;
  createdDate?: number;
  postcode?: string;
  fileType: string;
  fileNameData?: FileNameData;
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
  committee: {
    contactUs: {
      chairman: CommitteeMember;
      secretary: CommitteeMember;
      treasurer: CommitteeMember;
      membership: CommitteeMember;
      social: CommitteeMember;
      walks: CommitteeMember;
      support: CommitteeMember;
    };
    fileTypes: CommitteeFileType [];
  };
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
  addresseeType?: string;
  attachment?: { include?: boolean; value?: string; };
  campaignId?: string;
  customCampaignType?: string;
  description?: { include: boolean; value?: string; };
  destinationType?: string;
  includeDownloadInformation?: boolean;
  list?: string;
  attendees?: { include?: boolean };
  recipients?: { include?: boolean; value: string[] };
  replyTo?: { include?: boolean; value: string; };
  selectedMemberIds?: string[];
  signoffAs?: { include?: boolean; value?: string; };
  signoffText?: { include?: boolean; value?: string; };
  text?: { include?: boolean; value?: string; };
  title?: { include?: boolean; value?: string; };
}

export interface Notification {
  cancelled?: boolean;
  content?: NotificationContent;
  groupEventsFilter?: GroupEventsFilter;
  groupEvents?: GroupEvent[];
}

export interface CommitteeYear {
  year: string;
  latestYear: boolean;
}
