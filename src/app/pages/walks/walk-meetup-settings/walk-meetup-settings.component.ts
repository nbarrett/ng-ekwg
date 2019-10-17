import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { range } from "lodash-es";
import first from "lodash-es/first";
import { TabsetComponent } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "../../../models/alert-target.model";
import { ContentText } from "../../../models/content-text.model";
import { MeetupConfig } from "../../../models/meetup-config.model";
import { BroadcastService, NamedEvent, NamedEventType } from "../../../services/broadcast-service";
import { ContentTextService } from "../../../services/content-text.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { meetupDescriptionPrefix, MeetupService } from "../../../services/meetup.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-walk-meetup-settings",
  templateUrl: "./walk-meetup-settings.component.html",
  styleUrls: ["./walk-meetup-settings.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalkMeetupSettingsComponent implements OnInit {
  private logger: Logger;
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public contentTextItems: ContentText[] = [];
  @ViewChild("tabs") tabs: TabsetComponent;
  public selectedContent: ContentText;
  addNew: boolean;
  public config: MeetupConfig;
  public publishStatuses: string[] = [];
  private guestLimits: number[];

  constructor(private urlService: UrlService,
              private contentText: ContentTextService,
              private meetupService: MeetupService,
              private broadcastService: BroadcastService,
              protected notifierService: NotifierService,
              private changeDetectorRef: ChangeDetectorRef,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkMeetupSettingsComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.publishStatuses = this.meetupService.publishStatuses();
    this.guestLimits = range(1, 11);
    this.meetupService.getConfig().then(config => this.config = config);
    this.contentText.forCategory(meetupDescriptionPrefix).then(contentTextItems => {
      this.logger.debug("forCategory", meetupDescriptionPrefix + ":", contentTextItems);
      this.contentTextItems = contentTextItems;
      this.onChange(first(this.contentTextItems));
      this.changeDetectorRef.detectChanges();
    });
    this.broadcastService.on(NamedEventType.MARKDOWN_CONTENT_SAVED, (event: NamedEvent) => this.replaceContent(event.data));
    this.broadcastService.on(NamedEventType.MARKDOWN_CONTENT_DELETED, (event: NamedEvent) => this.removeContent(event.data));
  }

  activeTabIs(tab: number) {
    return this.tabs.tabs[tab].active;
  }

  backToWalks() {
    this.urlService.navigateTo("walks");
  }

  private replaceContent(contentText: ContentText) {
    if (contentText.category === meetupDescriptionPrefix) {
      this.logger.debug("Received updated content", contentText);
      const existingContent: ContentText = this.contentTextItems.find(item => !item.name || (item.name === contentText.name));
      if (existingContent) {
        this.contentTextItems[(this.contentTextItems.indexOf(existingContent))] = contentText;
        this.onChange(contentText);
        this.changeDetectorRef.detectChanges();
      } else {
        this.contentTextItems.push(contentText);
        this.onChange(contentText);
      }
    }
  }

  private removeContent(contentText: ContentText) {
    if (contentText.category === meetupDescriptionPrefix) {
      this.logger.debug("Received deleted content", contentText);
      this.contentTextItems = this.contentTextItems.filter(item => item.$id() !== contentText.$id());
      this.changeDetectorRef.detectChanges();
    }
  }

  addNewContent() {
    this.addNew = true;
    const newContent = {category: meetupDescriptionPrefix, text: "", name: ""};
    this.logger.debug("adding new content", newContent);
    this.selectedContent = newContent;
    this.contentTextItems.push(newContent);
  }

  onChange(content: any) {
    this.logger.debug("change to", content);
    this.selectedContent = content;
    this.changeDetectorRef.detectChanges();
  }

  changeGuestLimit(content: any) {
    this.logger.debug("changeGuestLimit:change to", content);
    this.config.meetup.guestLimit = content;
    this.changeDetectorRef.detectChanges();
  }

  matching(content: ContentText, selectedContent: ContentText) {
    return content && selectedContent && content.name === selectedContent.name;
  }

  save() {
    this.meetupService.saveConfig(this.notify, this.config).then(() => this.changeDetectorRef.detectChanges());
  }
}
