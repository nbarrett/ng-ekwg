import { Component, OnInit } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "../../../models/alert-target.model";
import { Notification } from "../../../models/committee.model";
import { MailchimpCampaignListResponse, MailchimpConfigResponse } from "../../../models/mailchimp.model";
import { Member } from "../../../models/member.model";
import { FullNameWithAliasPipe } from "../../../pipes/full-name-with-alias.pipe";
import { LineFeedsToBreaksPipe } from "../../../pipes/line-feeds-to-breaks.pipe";
import { CommitteeQueryService } from "../../../services/committee/committee-query.service";
import { ContentMetadataService } from "../../../services/content-metadata.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MailchimpConfigService } from "../../../services/mailchimp-config.service";
import { MailchimpCampaignService } from "../../../services/mailchimp/mailchimp-campaign.service";
import { MailchimpLinkService } from "../../../services/mailchimp/mailchimp-link.service";
import { MailchimpListService } from "../../../services/mailchimp/mailchimp-list.service";
import { MailchimpSegmentService } from "../../../services/mailchimp/mailchimp-segment.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-committee-notification-settings",
  templateUrl: "./committee-notification-settings.component.html",
})
export class CommitteeNotificationSettingsComponent implements OnInit {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public notification: Notification;
  private logger: Logger;
  members: Member[] = [];
  public campaigns: MailchimpCampaignListResponse;
  public campaignSearchTerm: string;
  public config: MailchimpConfigResponse;

  constructor(private contentMetadataService: ContentMetadataService,
              private mailchimpSegmentService: MailchimpSegmentService,
              private committeeQueryService: CommitteeQueryService,
              private mailchimpCampaignService: MailchimpCampaignService,
              private mailchimpConfig: MailchimpConfigService,
              private notifierService: NotifierService,
              private stringUtils: StringUtilsService,
              private memberService: MemberService,
              private fullNameWithAlias: FullNameWithAliasPipe,
              private lineFeedsToBreaks: LineFeedsToBreaksPipe,
              private modalService: BsModalService,
              private mailchimpLinkService: MailchimpLinkService,
              private memberLoginService: MemberLoginService,
              private mailchimpListService: MailchimpListService,
              private urlService: UrlService,
              protected dateUtils: DateUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeNotificationSettingsComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("constructed with member", this.members.length, "members");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.campaignSearchTerm = "Master";
    this.notify.setBusy();
    this.notify.progress({
      title: "Mailchimp Campaigns",
      message: "Getting campaign information matching " + this.campaignSearchTerm
    });
    this.mailchimpConfig.getConfig()
      .then(config => {
        this.config = config;
        this.logger.info("retrieved config", config);
      });

    this.mailchimpCampaignService.list({
      limit: 1000,
      concise: true,
      status: "save",
      title: this.campaignSearchTerm
    }).then(response => {
      this.campaigns = response;
      this.logger.debug("mailchimpCampaignService response.data", response.data);
      this.notify.success({
        title: "Mailchimp Campaigns",
        message: "Found " + this.campaigns.data.length + " draft campaigns matching " + this.campaignSearchTerm
      });
      this.notify.clearBusy();
    });
  }

  notReady() {
    return this.campaigns?.data?.length === 0;
  }

  editCampaign(campaignId) {
    if (!campaignId) {
      this.notify.error({
        title: "Edit Mailchimp Campaign",
        message: "Please select a campaign from the drop-down before choosing edit"
      });
    } else {
      this.notify.hide();
      const webId = this.campaigns.data.find(campaign => campaign.id === campaignId).web_id;
      this.logger.debug("editCampaign:campaignId", campaignId, "web_id", webId);
      return window.open(`${this.mailchimpLinkService.campaignEdit(webId)}`, "_blank");
    }
  }

  save() {
    this.logger.debug("saving config", this.config);
    this.mailchimpConfig.saveConfig(this.config)
      .then(() => this.urlService.navigateTo("committee"))
      .catch((error) => this.notify.error(error));
  }

  cancel() {
    this.urlService.navigateTo("committee");
  }
}