import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { range } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { ContentText } from "../../../models/content-text.model";
import { MeetupConfigParameters } from "../../../models/meetup-config.model";
import { BroadcastService, NamedEvent, NamedEventType } from "../../../services/broadcast-service";
import { ConfigService } from "../../../services/config.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MeetupService } from "../../../services/meetup.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-walk-meetup-config-parameters",
  templateUrl: "./walk-meetup-config-parameters.component.html",
  styleUrls: ["./walk-meetup-config-parameters.component.sass"]
})
export class WalkMeetupConfigParametersComponent implements OnInit {

  @Input()
  public config: MeetupConfigParameters;

  @Input()
  public renderMarkdownField: boolean;

  @Input()
  public contentTextItems: ContentText[];

  public selectedContentTextItem: ContentText;
  private logger: Logger;
  public publishStatuses: string[] = [];
  public guestLimits: number[];

  constructor(private urlService: UrlService,
              private configService: ConfigService,
              private meetupService: MeetupService,
              private changeDetectorRef: ChangeDetectorRef,
              private broadcastService: BroadcastService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkMeetupConfigParametersComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit:renderMarkdownField", this.renderMarkdownField);
    this.publishStatuses = this.meetupService.publishStatuses();
    this.guestLimits = range(1, 11);
    this.selectedContentTextItem = this.contentTextItems.find(item => item.name === this.config.defaultContent);
    this.selectContent(this.selectedContentTextItem, this.renderMarkdownField);
  }

  changeGuestLimit(content: any) {
    this.logger.debug("changeGuestLimit:change to", content);
    this.config.guestLimit = content;
    this.changeDetectorRef.detectChanges();
  }

  changeDefaultContent(content: ContentText) {
    this.selectContent(content, true);
  }

  selectContent(content: ContentText, renderMarkdownField: boolean) {
    if (content) {
      this.config.defaultContent = content.name;
      this.logger.debug("changeDefaultContent:change to", content, "this.config.defaultContent:", this.config.defaultContent);
      this.changeDetectorRef.detectChanges();
      if (renderMarkdownField) {
        this.broadcastService.broadcast(NamedEvent.withData(NamedEventType.MEETUP_DEFAULT_CONTENT_CHANGED, content));
      }
    }
  }

}
