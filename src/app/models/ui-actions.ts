export enum ConfirmType {
  DELETE = "delete",
  APPROVE = "approve",
  REQUEST_APPROVAL = "requestApproval",
  CANCEL = "cancel",
  CONTACT_OTHER = "contactOther",
  PUBLISH_MEETUP = "publishMeetup",
  NONE = "none"
}

export class Confirm {
  public type: ConfirmType = ConfirmType.NONE;

  toggleDelete() {
    this.type = ConfirmType.DELETE;
  }

  noneOutstanding() {
    return this.type === ConfirmType.NONE;
  }

  deleteConfirmOutstanding() {
    return this.type === ConfirmType.DELETE;
  }

  approveConfirmOutstanding() {
    return this.type === ConfirmType.APPROVE;
  }

}
