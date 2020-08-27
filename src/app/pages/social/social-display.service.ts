import { Inject, Injectable } from "@angular/core";
import cloneDeep from "lodash-es/cloneDeep";
import { BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { PopoverDirective } from "ngx-bootstrap/popover";
import { NgxLoggerLevel } from "ngx-logger";
import { Member, MemberFilterSelection } from "../../models/member.model";
import { SocialEvent } from "../../models/social-events.model";
import { FullNameWithAliasPipe } from "../../pipes/full-name-with-alias.pipe";
import { ValueOrDefaultPipe } from "../../pipes/value-or-default.pipe";
import { sortBy } from "../../services/arrays";
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

  constructor(
    @Inject("ClipboardService") private clipboardService,
    private memberService: MemberService,
    private modalService: BsModalService,
    private memberLoginService: MemberLoginService,
    private urlService: UrlService,
    private valueOrDefault: ValueOrDefaultPipe,
    private fullNameWithAlias: FullNameWithAliasPipe,
    private dateUtils: DateUtilsService,
    private contentMetadataService: ContentMetadataService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SocialDisplayService, NgxLoggerLevel.DEBUG);
  }

  attachmentTitle(socialEvent: SocialEvent) {
    return socialEvent && socialEvent.attachment ? (socialEvent.attachment.title || socialEvent.attachmentTitle || "Attachment: " + socialEvent.attachment.originalFileName) : "";
  }

  socialEventLink(socialEvent: SocialEvent) {
    return socialEvent?.id ? this.urlService.notificationHref({
      area: "social",
      id: socialEvent?.id
    }) : undefined;
  }

  copyToClipboard(socialEvent: SocialEvent, pop: PopoverDirective) {
    this.clipboardService.copyToClipboard(this.socialEventLink(socialEvent));
    pop.show();
  }

  attachmentUrl(socialEvent) {
    return socialEvent && socialEvent.attachment ? this.attachmentBaseUrl + "/" + socialEvent.attachment.awsFileName : "";
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
    return this.memberService.allLimitedFields(this.memberService.filterFor.SOCIAL_MEMBERS).then(members => {
      this.logger.debug("refreshMembers -> populated ->", members.length, "members");
      return members.map((member => this.toMemberFilterSelection(member)))
        .sort(SORT_BY_NAME);
    });
  }

}
