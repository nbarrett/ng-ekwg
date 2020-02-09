export interface CommitteeMember {
  description: string;
  fullName: string;
  email: string;
  memberId?: string;
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

