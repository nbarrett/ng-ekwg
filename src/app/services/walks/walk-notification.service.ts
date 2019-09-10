import { ComponentFactoryResolver, Inject, Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { MemberService } from "../../ajs-upgraded-providers";
import { Member } from "../../models/member.model";
import { WalkCampaignConfiguration } from "../../models/walk-campaign-configuration.model";
import { DisplayedWalk } from "../../models/walk-displayed.model";
import { WalkEventNotificationMapping, WalkEventType } from "../../models/walk-event-type.model";
import { WalkNotification } from "../../models/walk-notification.model";
import { ComponentAndData, NotificationDirective } from "../../notifications/walks/notification.directive";
import { WalkNotificationDetailsComponent } from "../../notifications/walks/templates/common/walk-notification-details.component";
import { WalkNotificationCoordinatorApprovedComponent } from "../../notifications/walks/templates/coordinator/walk-notification-coordinator-approved.component";
import { WalkNotificationCoordinatorAwaitingApprovalComponent } from "../../notifications/walks/templates/coordinator/walk-notification-coordinator-awaiting-approval.component";
import { WalkNotificationCoordinatorAwaitingWalkDetailsComponent } from "../../notifications/walks/templates/coordinator/walk-notification-coordinator-awaiting-walk-details.component";
import { WalkNotificationCoordinatorDeletedComponent } from "../../notifications/walks/templates/coordinator/walk-notification-coordinator-deleted.component";
import { WalkNotificationCoordinatorRequestedComponent } from "../../notifications/walks/templates/coordinator/walk-notification-coordinator-requested.component";
import { WalkNotificationCoordinatorUpdatedComponent } from "../../notifications/walks/templates/coordinator/walk-notification-coordinator-updated.component";
import { WalkNotificationLeaderApprovedComponent } from "../../notifications/walks/templates/leader/walk-notification-leader-approved.component";
import { WalkNotificationLeaderAwaitingApprovalComponent } from "../../notifications/walks/templates/leader/walk-notification-leader-awaiting-approval.component";
import { WalkNotificationLeaderAwaitingWalkDetailsComponent } from "../../notifications/walks/templates/leader/walk-notification-leader-awaiting-walk-details.component";
import { WalkNotificationLeaderRequestedComponent } from "../../notifications/walks/templates/leader/walk-notification-leader-requested.component";
import { WalkNotificationLeaderUpdatedComponent } from "../../notifications/walks/templates/leader/walk-notification-leader-updated.component";
import { AuditDeltaValuePipe } from "../../pipes/audit-delta-value.pipe";
import { DisplayDatePipe } from "../../pipes/display-date.pipe";
import { FullNameWithAliasPipe } from "../../pipes/full-name-with-alias.pipe";
import { DateUtilsService } from "../date-utils.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { AlertInstance, NotifierService } from "../notifier.service";
import { WalkEventService } from "./walk-event.service";
import { EventType, WalksReferenceService } from "./walks-reference-data.service";

@Injectable({
  providedIn: "root"
})

export class WalkNotificationService {
  private logger: Logger;

  constructor(
    @Inject("LoggedInMemberService") private loggedInMemberService,
    @Inject("MailchimpSegmentService") private mailchimpSegmentService,
    @Inject("MailchimpConfig") private mailchimpConfig,
    @Inject("MailchimpCampaignService") private mailchimpCampaignService,
    @Inject("MemberService") protected memberService,
    @Inject("RamblersWalksAndEventsService") private ramblersWalksAndEventsService,
    private walkEventService: WalkEventService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private walksReferenceService: WalksReferenceService,
    private notifierService: NotifierService,
    private fullNameWithAliasPipe: FullNameWithAliasPipe,
    private auditDeltaValuePipe: AuditDeltaValuePipe,
    private displayDatePipe: DisplayDatePipe,
    private dateUtils: DateUtilsService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkNotificationService, NgxLoggerLevel.DEBUG);
  }

  public createEventAndSendNotifications(notify: AlertInstance, members: Member[], notificationDirective: NotificationDirective,
                                         displayedWalk: DisplayedWalk, sendNotification: boolean, reason?: string): Promise<boolean> {
    notify.setBusy();
    const event = this.walkEventService.createEventIfRequired(displayedWalk.walk, displayedWalk.status, reason);

    if (event && sendNotification) {
      const walkEventType = this.walksReferenceService.toWalkEventType(event.eventType);
      this.logger.info("walkEventType", walkEventType, "from event:", event);
      return this.sendNotificationsToAllRoles(members, notificationDirective, displayedWalk, walkEventType, notify)
        .then(() => {
          this.walkEventService.writeEventIfRequired(displayedWalk.walk, event);
          return true;
        })
        .then(() => {
          return true;
        });
      // .catch((error) => {
      //   notify.error({title: "Sending of notifications failed", message: error});
      //   return false;
      // });
    } else {
      this.logger.debug("Not sending notification sendNotification:", sendNotification, "event:", event);
      return Promise.resolve(this.walkEventService.writeEventIfRequired(displayedWalk.walk, event))
        .then(() => {
          return false;
        });
    }

  }

  public loadNotification(displayedWalk: DisplayedWalk, members: Member[], notificationDirective: NotificationDirective, walkEventType: WalkEventType) {
    const walkNotification: WalkNotification = this.toWalkNotification(displayedWalk, members);
    if (walkEventType) {
      if (walkEventType.notifyCoordinator) {
        const coordinatorHTML = this.generateNotificationHTML(walkNotification, notificationDirective, this.walkEventNotificationMappingsFor(walkEventType.eventType).notifyCoordinator as WalkNotificationDetailsComponent);
        this.logger.info("coordinatorHTML", coordinatorHTML);
      }
      if (walkEventType.notifyLeader) {
        const component = this.walkEventNotificationMappingsFor(walkEventType.eventType).notifyLeader as WalkNotificationDetailsComponent;
        const leaderHTML = this.generateNotificationHTML(walkNotification, notificationDirective, component);
        this.logger.info("leaderHTML", leaderHTML);
      }
    } else {
      this.logger.info("no notification required for", walkEventType && walkEventType.description);
    }
  }

  private walkEventNotificationMappingsFor(eventType: EventType) {
    const mappings: WalkEventNotificationMapping[] = [
      {
        eventType: EventType.AWAITING_WALK_DETAILS,
        notifyLeader: WalkNotificationLeaderAwaitingWalkDetailsComponent,
        notifyCoordinator: WalkNotificationCoordinatorAwaitingWalkDetailsComponent
      },
      {
        eventType: EventType.WALK_DETAILS_REQUESTED,
        notifyLeader: WalkNotificationLeaderRequestedComponent,
        notifyCoordinator: WalkNotificationCoordinatorRequestedComponent
      }, {
        eventType: EventType.WALK_DETAILS_UPDATED,
        notifyLeader: WalkNotificationLeaderUpdatedComponent,
        notifyCoordinator: WalkNotificationCoordinatorUpdatedComponent
      }, {
        eventType: EventType.AWAITING_APPROVAL,
        notifyLeader: WalkNotificationLeaderAwaitingApprovalComponent,
        notifyCoordinator: WalkNotificationCoordinatorAwaitingApprovalComponent
      }, {
        eventType: EventType.APPROVED,
        notifyLeader: WalkNotificationLeaderApprovedComponent,
        notifyCoordinator: WalkNotificationCoordinatorApprovedComponent
      }, {
        eventType: EventType.DELETED,
        notifyLeader: WalkNotificationCoordinatorDeletedComponent,
        notifyCoordinator: WalkNotificationCoordinatorDeletedComponent
      }];
    return mappings.find(mapping => mapping.eventType === eventType);
  }

  private toWalkNotification(displayedWalk: DisplayedWalk, members: Member[], reason?: string): WalkNotification {
    const data = {
      walk: displayedWalk.walk,
      status: displayedWalk.status,
      event: this.walkEventService.latestEvent(displayedWalk.walk),
      dataAuditDelta: this.walkEventService.walkDataAuditFor(displayedWalk.walk, displayedWalk.status),
      validationMessages: this.ramblersWalksAndEventsService.validateWalk(displayedWalk.walk, members).validationMessages,
      reason
    };
    this.logger.info("toWalkNotification ->", data);
    return data;
  }

  private generateNotificationHTML(walkNotification: WalkNotification, notificationDirective: NotificationDirective, component): string {
    const componentAndData = new ComponentAndData(component, walkNotification);
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentAndData.component);
    const viewContainerRef = notificationDirective.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent(componentFactory);
    componentRef.instance.data = componentAndData.data;
    componentRef.changeDetectorRef.detectChanges();
    const html = componentRef.location.nativeElement.innerHTML;
    this.logger.debug("notification html ->", html);
    return html;
  }

  private sendNotificationsToAllRoles(members: Member[], notificationDirective: NotificationDirective, displayedWalk: DisplayedWalk, walkEventType: WalkEventType, notify: AlertInstance): Promise<void> {
    notify.progress({
      title: "Sending Notifications",
      message: "Preparing to send email notifications"
    });
    const walkNotification: WalkNotification = this.toWalkNotification(displayedWalk, members);
    return this.loggedInMemberService.getMemberForMemberId(displayedWalk.walk.walkLeaderMemberId)
      .then((member: Member) => {
        this.logger.debug("sendNotification:", "memberId", displayedWalk.walk.walkLeaderMemberId, "member", member);
        const walkLeaderName = this.fullNameWithAliasPipe.transform(member);
        const walkDate = this.displayDatePipe.transform(displayedWalk.walk.walkDate);
        return Promise.resolve()
          .then(() => this.sendLeaderNotifications(notify, member, members, notificationDirective, walkNotification, walkEventType, walkLeaderName, walkDate))
          .then(() => this.sendCoordinatorNotifications(notify, member, members, notificationDirective, walkNotification, walkEventType, walkLeaderName, walkDate));
      });
  }

  private sendLeaderNotifications(notify: AlertInstance, member: Member, members: Member[], notificationDirective: NotificationDirective,
                                  walkNotification: WalkNotification, walkEventType: WalkEventType, walkLeaderName: string, walkDate: string): Promise<void> {
    if (walkEventType.notifyLeader) {
      const leaderHTML = this.generateNotificationHTML(walkNotification, notificationDirective, this.walkEventNotificationMappingsFor(walkEventType.eventType).notifyLeader as WalkNotificationDetailsComponent);
      return this.sendNotificationsTo(notify, member, members, walkEventType, {
        memberIds: [walkNotification.walk.walkLeaderMemberId],
        notificationText: leaderHTML,
        segmentType: "walkLeader",
        segmentName: this.mailchimpSegmentService.formatSegmentName("Walk leader notifications for " + walkLeaderName),
        emailSubject: "Your walk on " + walkDate,
        destination: "walk leader"
      });
    }
    this.logger.debug("not sending leader notification");
  }

  private sendCoordinatorNotifications(notify: AlertInstance, member: Member, members: Member[], notificationDirective: NotificationDirective,
                                       displayedWalk: WalkNotification, walkEventType: WalkEventType, walkLeaderName: string, walkDate: string): Promise<void> {
    if (walkEventType.notifyCoordinator) {
      const coordinatorHTML = this.generateNotificationHTML(displayedWalk, notificationDirective, this.walkEventNotificationMappingsFor(walkEventType.eventType).notifyCoordinator as WalkNotificationDetailsComponent);
      const memberIds = this.memberService.allMemberIdsWithPrivilege("walkChangeNotifications", members);
      if (memberIds.length > 0) {
        return this.sendNotificationsTo(notify, member, members, walkEventType, {
          memberIds,
          notificationText: coordinatorHTML,
          segmentType: "walkCoordinator",
          segmentName: this.mailchimpSegmentService.formatSegmentName("Walk co-ordinator notifications for " + walkLeaderName),
          emailSubject: walkLeaderName + "'s walk on " + walkDate,
          destination: "walk co-ordinators"
        });
      } else {
        this.logger.debug("not sending coordinator notifications as none are configured with walkChangeNotifications");
      }
    } else {
      this.logger.debug("not sending coordinator notifications as event type is", walkEventType.eventType);
    }
  }

  private sendNotificationsTo(notify: AlertInstance, member: Member, members: Member[], walkEventType: WalkEventType, walkCampaignConfiguration: WalkCampaignConfiguration) {
    if (walkCampaignConfiguration.memberIds.length === 0) {
      throw new Error("No members have been configured as " + walkCampaignConfiguration.destination
        + " therefore notifications cannot be sent");
    }
    this.logger.debug("sendNotificationsTo:", walkCampaignConfiguration);
    const campaignName = walkCampaignConfiguration.emailSubject + " (" + walkEventType.description + ")";
    const segmentName = walkCampaignConfiguration.segmentName;
    const contentSections = {
      sections: {
        notification_text: walkCampaignConfiguration.notificationText
      }
    };

    this.logger.debug("contentSections -> ", contentSections);
    return this.createOrSaveMailchimpSegment(member, members, walkCampaignConfiguration, segmentName)
      .then((segmentResponse) => this.saveSegmentDataToMember(segmentResponse, member, walkCampaignConfiguration))
      .then(() => this.sendEmailCampaign(notify, member, campaignName, contentSections, walkCampaignConfiguration))
      .then(() => this.notifyEmailSendComplete(notify, campaignName));
  }

  private createOrSaveMailchimpSegment(member, members, walkCampaignConfiguration: WalkCampaignConfiguration, segmentName) {
    return this.mailchimpSegmentService.saveSegment("walks", {
      segmentId:
        this.mailchimpSegmentService.getMemberSegmentId(member, walkCampaignConfiguration.segmentType)
    }, walkCampaignConfiguration.memberIds, segmentName, members);
  }

  private saveSegmentDataToMember(segmentResponse, member: Member, walkCampaignConfiguration: WalkCampaignConfiguration) {
    this.mailchimpSegmentService.setMemberSegmentId(member, walkCampaignConfiguration.segmentType, segmentResponse.segment.id);
    return this.loggedInMemberService.saveMember(member);
  }

  private sendEmailCampaign(notify: AlertInstance, member: Member, campaignName: string, contentSections, walkCampaignConfiguration: WalkCampaignConfiguration) {
    notify.progress({
      title: "Sending Notifications", message: "Sending " + campaignName
    });
    return this.mailchimpConfig.getConfig()
      .then((config) => {
        const campaignId = config.mailchimp.campaigns.walkNotification.campaignId;
        const segmentId = this.mailchimpSegmentService.getMemberSegmentId(member, walkCampaignConfiguration.segmentType);
        this.logger.debug("about to send campaign", campaignName, "campaign Id", campaignId, "segmentId", segmentId);
        return this.mailchimpCampaignService.replicateAndSendWithOptions({
          campaignId,
          campaignName,
          contentSections,
          segmentId
        });
      })
      .then(() => {
        notify.progress({
          title: "Sending Notifications", message: "Sending of " + campaignName + " was successful"
        }, true);
      });
  }

  private notifyEmailSendComplete(notify: AlertInstance, campaignName: string) {
    notify.success({
      title: "Sending Notifications",
      message: "Sending of " + campaignName + " was successful. Check your inbox for details."
    });
    return true;
  }

}
