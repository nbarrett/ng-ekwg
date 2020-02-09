import { ApiResponse } from "./api-response.model";

export interface MemberCookie {
  memberId: string;
  walkAdmin: boolean;
  socialAdmin: boolean;
  socialMember: boolean;
  contentAdmin: boolean;
  memberAdmin: boolean;
  financeAdmin: boolean;
  committee: boolean;
  treasuryAdmin: boolean;
  fileAdmin: boolean;
  firstName: string;
  postcode: string;
  userName: string;
  lastName: string;
  profileSettingsConfirmed: boolean;
}

export interface SessionStatus {
  title: string;
  status?: string;
}

export interface Member extends Auditable {
  id?: string;
  hideSurname?: boolean;
  expiredPassword?: boolean;
  groupMember?: boolean;
  password?: string;
  nameAlias?: string;
  email?: string;
  mobileNumber?: string;
  displayName?: string;
  contactId?: string;
  firstName?: string;
  lastName?: string;
  memberAdmin?: boolean;
  membershipExpiryDate?: number;
  membershipNumber?: string;
  postcode?: string;
  socialAdmin?: boolean;
  socialMember?: boolean;
  userAdmin?: boolean;
  userName?: string;
  walkAdmin?: boolean;
  revoked?: boolean;
  mailchimpLists?: {
    walks?: MailchimpSubscription;
    socialEvents?: MailchimpSubscription;
    general?: MailchimpSubscription;
  };
  contentAdmin?: boolean;
  passwordResetId?: string;
  financeAdmin?: boolean;
  mailchimpSegmentIds?: {
    directMail: number;
    expenseApprover: number;
    expenseTreasurer: number;
    walkLeader: number;
    walkCoordinator: number;
  };
  treasuryAdmin?: boolean;
  fileAdmin?: boolean;
  committee?: boolean;
  profileSettingsConfirmed?: boolean;
  profileSettingsConfirmedAt?: number;
  profileSettingsConfirmedBy?: string;
  walkChangeNotifications?: boolean;
  receivedInLastBulkLoad?: boolean;
  lastBulkLoadDate?: number;
}

export interface StatusMessage {
  status: string;
  message: string;
}

export interface RamblersMember {
  membershipExpiryDate: string;
  membershipNumber: string;
  mobileNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  postcode: string;
}

export interface MemberBulkLoadAudit extends Auditable {
  files: {
    archive: string;
    data: string;
  };
  error?: string;
  auditLog: StatusMessage[];
  members: RamblersMember[];
}

export interface  MemberUpdateAudit extends Auditable {
  id?: string;
  uploadSessionId: string;
  updateTime: number;
  memberAction: string;
  rowNumber: number;
  changes: number;
  auditMessage: string;
  memberId?: string;
  member?: Member;
  auditErrorMessage?: string;
}

export interface MemberAuthAudit {
  id: string;
  userName: string;
  loginTime: number;
  loginResponse: LoginResponse;
  member: MemberCookie;
}

export interface Auditable {
  id?: string;
  createdDate?: number;
  createdBy?: string;
  updatedDate?: number;
  updatedBy?: string;
}

export interface LoginResponse {
  userName?: string;
  member?: object;
  alertMessage?: string;
  showResetPassword?: boolean;
  memberLoggedIn?: boolean;
}

export interface MailchimpSubscription {
  subscribed?: boolean;
  updated?: boolean;
  leid?: string;
  lastUpdated?: number;
  email?: { email: string, leid?: string };
}

export interface MemberApiResponse extends ApiResponse {
  request: any;
  response?: Member | Member[];
}

export interface MemberAuthAuditApiResponse extends ApiResponse {
  request: any;
  response?: MemberAuthAudit | MemberAuthAudit[];
}

export interface MemberUpdateAuditApiResponse extends ApiResponse {
  request: any;
  response?: MemberUpdateAudit | MemberUpdateAudit[];
}

export interface MemberBulkLoadAuditApiResponse extends ApiResponse {
  request: any;
  response?: MemberBulkLoadAudit | MemberBulkLoadAudit[];
}
