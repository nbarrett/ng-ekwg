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

export interface Member {
  expiredPassword?: boolean;
  groupMember?: boolean;
  password?: string;
  nameAlias?: string;
  email?: string;
  mobileNumber?: string;
  displayName: string;
  contactId?: string;
  firstName: string;
  lastName: string;
  memberAdmin?: boolean;
  membershipExpiryDate?: number;
  membershipNumber?: string;
  postcode?: string;
  socialAdmin?: boolean;
  socialMember?: boolean;
  userAdmin?: boolean;
  userName?: string;
  walkAdmin?: boolean;
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
  createdDate?: number;
  createdBy?: string;
  updatedDate?: number;
  updatedBy?: string;

  $id?(): any;

  $saveOrUpdate?(saveCallback?, updateCallback?, errorSaveCallback?, errorUpdateCallback?): Promise<Member>;

  $update?(saveCallback?, updateCallback?, errorSaveCallback?, errorUpdateCallback?): Promise<Member>;
}

export interface LoginResponse {
  userName?: string;
  alertMessage?: string;
  showResetPassword?: boolean;
  memberLoggedIn?: boolean;
}

export interface MailchimpSubscription {
  subscribed: boolean;
  updated: boolean;
  leid: string;
  lastUpdated: number;
  email: string;
}
