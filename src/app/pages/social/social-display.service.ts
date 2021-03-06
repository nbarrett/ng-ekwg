import { Injectable } from "@angular/core";
import cloneDeep from "lodash-es/cloneDeep";
import { BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { PopoverDirective } from "ngx-bootstrap/popover";
import { NgxLoggerLevel } from "ngx-logger";
import { CommitteeMember } from "../../models/committee.model";
import { Member, MemberFilterSelection } from "../../models/member.model";
import { SocialEvent } from "../../models/social-events.model";
import { FullNameWithAliasPipe } from "../../pipes/full-name-with-alias.pipe";
import { MemberIdToFullNamePipe } from "../../pipes/member-id-to-full-name.pipe";
import { ValueOrDefaultPipe } from "../../pipes/value-or-default.pipe";
import { sortBy } from "../../services/arrays";
import { ClipboardService } from "../../services/clipboard.service";
import { CommitteeConfigService } from "../../services/committee/commitee-config.service";
import { CommitteeReferenceData } from "../../services/committee/committee-reference-data";
import { ContentMetadataService } from "../../services/content-metadata.service";
import { DateUtilsService } from "../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { MemberLoginService } from "../../services/member/member-login.service";
import { MemberService } from "../../services/member/member.service";
import { UrlService } from "../../services/url.service";

const SORT_BY_NAME = sortBy("order", "member.lastName", "member.firstName");

@Injectable({
  providedIn: "root"
})

export class SocialDisplayService {
  private logger: Logger;
  public attachmentBaseUrl = this.contentMetadataService.baseUrl("socialEvents");
  private committeeReferenceData: CommitteeReferenceData;

  constructor(
    private memberService: MemberService,
    private modalService: BsModalService,
    private memberLoginService: MemberLoginService,
    private urlService: UrlService,
    private valueOrDefault: ValueOrDefaultPipe,
    private fullNameWithAlias: FullNameWithAliasPipe,
    private memberIdToFullNamePipe: MemberIdToFullNamePipe,
    private dateUtils: DateUtilsService,
    private clipboardService: ClipboardService,
    private committeeConfig: CommitteeConfigService,
    private contentMetadataService: ContentMetadataService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SocialDisplayService, NgxLoggerLevel.OFF);
    this.committeeConfig.events().subscribe(data => this.committeeReferenceData = data);
  }

  committeeMembersPlusOrganiser(socialEvent: SocialEvent, members: Member[]): CommitteeMember[] {
    const committeeMembers = socialEvent.eventContactMemberId ?
      [this.committeeMemberFromSocialEvent(socialEvent, members)].concat(this.committeeReferenceData.committeeMembers()) : this.committeeReferenceData.committeeMembers();
    this.logger.debug("committeeMembersPlusOrganiser:", committeeMembers);
    return committeeMembers;
  }

  committeeMembers(): CommitteeMember[] {
    return this.committeeReferenceData.committeeMembers();
  }

  committeeMemberFromSocialEvent(socialEvent: SocialEvent, members: Member[]): CommitteeMember {
    const fullName = this.memberIdToFullNamePipe.transform(socialEvent.eventContactMemberId, members);
    return {
      type: "organiser",
      fullName,
      memberId: socialEvent.eventContactMemberId,
      description: "Organiser",
      nameAndDescription: `Organiser (${fullName})`,
      email: socialEvent.contactEmail
    };
  }

  attachmentTitle(socialEvent: SocialEvent) {
    return socialEvent?.attachment ? (socialEvent.attachment.title || `Attachment: ${socialEvent.attachment.originalFileName}`) : "";
  }

  socialEventLink(socialEvent: SocialEvent) {
    return socialEvent?.id ? this.urlService.notificationHref({
      area: "social",
      id: socialEvent?.id
    }) : undefined;
  }

  copyToClipboard(socialEvent: SocialEvent, pop: PopoverDirective) {
    this.clipboardService.copyToClipboard(this.socialEventLink(socialEvent), pop);
  }

  attachmentUrl(socialEvent) {
    return socialEvent && socialEvent.attachment ? `${this.attachmentBaseUrl}/${socialEvent.attachment.awsFileName}` : "";
  }

  attendeeList(socialEvent: SocialEvent, members: MemberFilterSelection[]) {
    return socialEvent?.attendees.map(memberId => members.find(member => member.id === memberId.id))
      .sort(sortBy("text")).map(item => item?.text).join(", ");
  }

  createModalOptions(initialState?: any): ModalOptions {
    return {
      class: "modal-lg",
      animated: false,
      backdrop: "static",
      ignoreBackdropClick: false,
      keyboard: true,
      focus: true,
      show: true,
      initialState: cloneDeep(initialState)
    };
  }

  toMemberFilterSelection(member: Member): MemberFilterSelection {
    let memberGrouping;
    let order: number;
    let disabled = true;
    if (member.socialMember && member.mailchimpLists.socialEvents.subscribed) {
      memberGrouping = "Subscribed to social emails";
      order = 0;
      disabled = false;
    } else if (member.socialMember && !member.mailchimpLists.socialEvents.subscribed) {
      memberGrouping = "Not subscribed to social emails";
      order = 1;
    } else if (!member.socialMember) {
      memberGrouping = "Not a social member";
      order = 2;
    } else {
      memberGrouping = "Unexpected state";
      order = 3;
    }
    return {
      id: member.id,
      member,
      order,
      memberGrouping,
      disabled,
      text: this.fullNameWithAlias.transform(member)
    };
  }

  refreshSocialMemberFilterSelection(): Promise<MemberFilterSelection[]> {
    return this.memberService.publicFields(this.memberService.filterFor.SOCIAL_MEMBERS_SUBSCRIBED).then(members => {
      this.logger.debug("refreshMembers -> populated ->", members.length, "members");
      return members.map((member => this.toMemberFilterSelection(member)))
        .sort(SORT_BY_NAME);
    });
  }

}
