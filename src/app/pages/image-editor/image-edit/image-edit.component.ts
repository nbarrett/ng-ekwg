import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgSelectComponent } from "@ng-select/ng-select";
import first from "lodash-es/first";
import isArray from "lodash-es/isArray";
import map from "lodash-es/map";
import { FileUploader } from "ng2-file-upload";
import { NgxLoggerLevel } from "ngx-logger";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { GroupEvent, GroupEventsFilter, GroupEventType, groupEventTypeFor, GroupEventTypes } from "../../../models/committee.model";
import { ContentMetadataItem, ContentMetadataItemWithIndex, ImageTag } from "../../../models/content-metadata.model";
import { DateValue } from "../../../models/date.model";
import { CommitteeQueryService } from "../../../services/committee/committee-query.service";
import { ContentMetadataService } from "../../../services/content-metadata.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { FileUploadService } from "../../../services/file-upload.service";
import { ImageDuplicatesService } from "../../../services/image-duplicates-service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { RouterHistoryService } from "../../../services/router-history.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-edit-image",
  templateUrl: "./image-edit.component.html"
})
export class ImageEditComponent implements OnInit {
  private logger: Logger;
  public hasFileOver = false;
  public groupEvents: GroupEvent[] = [];
  @Input() item: ContentMetadataItem;
  @Input() index: number;
  @Input() imageCount: number;
  @Input() uploader: FileUploader;
  @Input() notify: AlertInstance;
  @Input() notifyTarget: AlertTarget;
  @Output() imageChange: EventEmitter<ContentMetadataItemWithIndex> = new EventEmitter();
  @Output() moveUp: EventEmitter<ContentMetadataItemWithIndex> = new EventEmitter();
  @Output() moveDown: EventEmitter<ContentMetadataItemWithIndex> = new EventEmitter();
  @Output() delete: EventEmitter<ContentMetadataItemWithIndex> = new EventEmitter();
  @Output() insert: EventEmitter<ContentMetadataItemWithIndex> = new EventEmitter();

  constructor(private stringUtils: StringUtilsService,
              public imageDuplicatesService: ImageDuplicatesService,
              private committeeQueryService: CommitteeQueryService,
              private contentMetadataService: ContentMetadataService,
              private authService: AuthService,
              private notifierService: NotifierService,
              private fileUploadService: FileUploadService,
              private route: ActivatedRoute,
              private memberLoginService: MemberLoginService,
              public dateUtils: DateUtilsService,
              private routerHistoryService: RouterHistoryService,
              private urlService: UrlService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ImageEditComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit:item", this.item, "index:", this.index);
  }

  onImageDateChange(dateValue: DateValue) {
    if (dateValue) {
      this.logger.debug("from:", this.dateUtils.asDate(this.item.date), "to", dateValue.date);
      this.item.date = dateValue.value;
      this.filterEventsBySourceAndDate(this.item.dateSource, this.item.date);
    }
  }

  tagsChange(stories: ImageTag[]) {
    this.logger.debug("tagChange:stories", stories);
    if (isArray(stories)) {
      this.item.tags = stories.map(story => story.key);
      this.logger.debug("imageMetaDataItem now:", this.item);
    } else {
      this.logger.debug("ignoring event", stories);
    }
    this.callImageChange();
  }

  browseToFile(fileElement: HTMLInputElement) {
    this.logger.debug("browsing from ", fileElement);
    fileElement.click();
  }

  replace(fileElement: HTMLInputElement) {
    this.browseToFile(fileElement);
  }

  callMoveUp() {
    this.moveUp.emit(this.emitValue());
  }

  callImageChange() {
    this.imageChange.emit(this.emitValue());
  }

  callMoveDown() {
    this.moveDown.emit(this.emitValue());
  }

  callDelete() {
    this.delete.emit(this.emitValue());
  }

  private emitValue(): ContentMetadataItemWithIndex {
    return {item: this.item, index: this.index};
  }

  callInsert(fileElement: HTMLInputElement) {
    this.item = {};
    this.insert.emit(this.emitValue());
    this.replace(fileElement);
  }

  onFileSelect($file: File[]) {
    this.notify.setBusy();
    this.notify.progress({title: "Image upload", message: `uploading ${first($file).name} - please wait...`});
  }

  public fileOver(index: number): void {
    this.hasFileOver = index === this.index;
    this.logger.debug("hasFileOver:", this.hasFileOver);
  }

  fileDropped($event: File[]) {
    this.logger.debug("fileDropped:", $event);
  }

  filterEventsBySourceAndDate(dateSource: string, date: number) {
    this.logger.debug("eventsFilteredFrom:", dateSource, "date:", date);
    const groupEventsFilter: GroupEventsFilter = {
      selectAll: true,
      fromDate: this.dateUtils.asDateValue(this.dateUtils.asMoment(date).add(-520, "weeks").valueOf()),
      toDate: this.dateUtils.asDateValue(this.dateUtils.asMoment(date).add(2, "day")),
      includeContact: true,
      includeDescription: true,
      includeLocation: true,
      includeWalks: dateSource === GroupEventTypes.WALK.area,
      includeSocialEvents: dateSource === GroupEventTypes.SOCIAL.area,
      includeCommitteeEvents: dateSource === GroupEventTypes.COMMITTEE.area,
      sortBy: "-eventDate"
    };

    this.committeeQueryService.groupEvents(groupEventsFilter)
      .then(events => {
        this.groupEvents = events.map(event => ({
          ...event,
          description: this.dateUtils.displayDate(event.eventDate) + ", " + event.contactName + ", " + event.title
        }));
        this.logger.debug("groupEvents", events);
        return events;
      });

  }

  selectClick(select: NgSelectComponent) {
    this.logger.debug("select", select, "imageMetaDataItem:", this.item);
  }

  onChange() {
    const event = this.groupEvents.find(event => event.id === this.item.eventId);
    if (event) {
      this.item.date = event.eventDate;
      this.logger.debug("onChange:imageMetaDataItem.date", this.dateUtils.displayDate(this.item.date), "imageMetaDataItem:", this.item);
    } else {
      this.logger.debug("onChange:not event found from", this.item);
    }
    this.imageChange.emit(this.emitValue());
  }

  dateSources(): GroupEventType[] {
    return [{
      area: "upload",
      eventType: "Upload Date",
      description: "Upload Date"
    }].concat(map(GroupEventTypes, (item) => item));
  }

  refreshGroupEventsIfRequired() {
    const groupEventType = groupEventTypeFor(this.item.dateSource);
    if (groupEventType) {
      this.logger.debug("filterEventsBySourceAndDate as group event type is", groupEventType);
      this.filterEventsBySourceAndDate(this.item.dateSource, this.item.date);
    } else {
      this.logger.debug("not refreshing as group event type is", groupEventType);
    }
  }

  refreshGroupEvents() {
    this.filterEventsBySourceAndDate(this.item.dateSource, this.item.date);
  }
}
