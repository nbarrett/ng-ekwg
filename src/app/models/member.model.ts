export interface Member {
  nameAlias?: string;
  email?: string;
  mobileNumber: string;
  displayName: string;
  contactId: string;

  $id(): any;
}
