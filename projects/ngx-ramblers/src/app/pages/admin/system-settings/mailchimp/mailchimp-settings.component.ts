import { Component, OnInit } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "../../../../models/alert-target.model";
import { Notification } from "../../../../models/committee.model";
import { MailchimpCampaignListResponse, MailchimpConfigResponse, MailchimpListingResponse } from "../../../../models/mailchimp.model";
import { Member } from "../../../../models/member.model";
import { FullNameWithAliasPipe } from "../../../../pipes/full-name-with-alias.pipe";
import { LineFeedsToBreaksPipe } from "../../../../pipes/line-feeds-to-breaks.pipe";
import { CommitteeQueryService } from "../../../../services/committee/committee-query.service";
import { ContentMetadataService } from "../../../../services/content-metadata.service";
import { DateUtilsService } from "../../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../../services/logger-factory.service";
import { MailchimpConfigService } from "../../../../services/mailchimp-config.service";
import { MailchimpCampaignService } from "../../../../services/mailchimp/mailchimp-campaign.service";
import { MailchimpLinkService } from "../../../../services/mailchimp/mailchimp-link.service";
import { MailchimpListService } from "../../../../services/mailchimp/mailchimp-list.service";
import { MailchimpSegmentService } from "../../../../services/mailchimp/mailchimp-segment.service";
import { MemberLoginService } from "../../../../services/member/member-login.service";
import { MemberService } from "../../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../../services/notifier.service";
import { StringUtilsService } from "../../../../services/string-utils.service";
import { UrlService } from "../../../../services/url.service";

@Component({
  selector: "app-mailchimp-settings",
  templateUrl: "./mailchimp-settings.component.html",
})
export class MailchimpSettingsComponent implements OnInit {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public notification: Notification;
  private logger: Logger;
  members: Member[] = [];
  public mailchimpCampaignListResponse: MailchimpCampaignListResponse;
  public campaignSearchTerm: string;
  public config: MailchimpConfigResponse;
  public mailchimpListingResponse: MailchimpListingResponse;

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
    this.logger = loggerFactory.createLogger(MailchimpSettingsComponent, NgxLoggerLevel.DEBUG);
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
      }).catch(error => this.notify.error({title: "Failed to query Mailchimp config", message: error}));

    this.mailchimpCampaignService.list({
      concise: true,
      limit: 1000,
      start: 0,
      status: "save",
      query: this.campaignSearchTerm
    }).then((mailchimpCampaignListResponse: MailchimpCampaignListResponse) => {
      this.mailchimpCampaignListResponse = mailchimpCampaignListResponse;
      this.logger.debug("mailchimpCampaignService list mailchimpCampaignListResponse:", mailchimpCampaignListResponse);
      this.notify.success({
        title: "Mailchimp Campaigns",
        message: "Found " + this.mailchimpCampaignListResponse.campaigns.length + " draft campaigns matching " + this.campaignSearchTerm
      });
      this.notify.clearBusy();
    }).catch(error => this.notify.error({title: "Failed to query Mailchimp config", message: error}));;
    this.mailchimpListService.lists(this.notify).then((response: MailchimpListingResponse) => {
      this.mailchimpListingResponse = response;
      this.logger.debug("mailchimpListService lists response:", response);
    });
  }

  notReady() {
    return this.mailchimpCampaignListResponse?.campaigns?.length === 0;
  }

  editCampaign(campaignId) {
    if (!campaignId) {
      this.notify.error({
        title: "Edit Mailchimp Campaign",
        message: "Please select a campaign from the drop-down before choosing edit"
      });
    } else {
      this.notify.hide();
      const webId = this.mailchimpCampaignListResponse.campaigns.find(campaign => campaign.id === campaignId).web_id;
      this.logger.debug("editCampaign:campaignId", campaignId, "web_id", webId);
      return window.open(`${this.mailchimpLinkService.campaignEdit(webId)}`, "_blank");
    }
  }

  viewList(id: string) {
    if (!id) {
      this.notify.error({
        title: "View Mailchimp List",
        message: "Please select a list from the drop-down before choosing view"
      });
    } else {
      this.notify.hide();
      const webId = this.mailchimpListingResponse.lists.find(item => item.id === id)?.web_id;
      this.logger.debug("viewList:id", id, "web_id", webId);
      return window.open(`${this.mailchimpLinkService.listView(webId)}`, "_blank");
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
