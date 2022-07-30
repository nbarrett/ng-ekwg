import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { faExclamation } from "@fortawesome/free-solid-svg-icons";
import { NgSelectComponent } from "@ng-select/ng-select";
import { keys } from "lodash-es";
import isArray from "lodash-es/isArray";
import map from "lodash-es/map";
import { NgxLoggerLevel } from "ngx-logger";
import { AuthService } from "../../../auth/auth.service";
import { GroupEvent, GroupEventsFilter, GroupEventType, groupEventTypeFor, GroupEventTypes } from "../../../models/committee.model";
import { ContentMetadataItem, ImageTag } from "../../../models/content-metadata.model";
import { DateValue } from "../../../models/date.model";
import { CommitteeQueryService } from "../../../services/committee/committee-query.service";
import { ContentMetadataService } from "../../../services/content-metadata.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { FileUploadService } from "../../../services/file-upload.service";
import { ImageDuplicatesService } from "../../../services/image-duplicates-service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { NotifierService } from "../../../services/notifier.service";
import { RouterHistoryService } from "../../../services/router-history.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-edit-image",
  templateUrl: "./image-edit.component.html"
})
export class ImageEditComponent implements OnInit, OnChanges {
  private logger: Logger;
  public groupEvents: GroupEvent[] = [];
  @Input() item: ContentMetadataItem;
  @Input() index: number;
  @Input() filteredFiles: ContentMetadataItem[];
  @Input() fileElement: HTMLInputElement;
  @Output() imageChange: EventEmitter<ContentMetadataItem> = new EventEmitter();
  @Output() moveUp: EventEmitter<ContentMetadataItem> = new EventEmitter();
  @Output() moveDown: EventEmitter<ContentMetadataItem> = new EventEmitter();
  @Output() delete: EventEmitter<ContentMetadataItem> = new EventEmitter();
  @Output() imageInsert: EventEmitter<ContentMetadataItem> = new EventEmitter();
  public canMoveUp: boolean;
  public canMoveDown: boolean;
  faExclamation = faExclamation;

  constructor(private stringUtils: StringUtilsService,
              public imageDuplicatesService: ImageDuplicatesService,
              private committeeQueryService: CommitteeQueryService,
              public contentMetadataService: ContentMetadataService,
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.item) {
      this.item = changes.item.currentValue;
      this.logger.debug("ngOnChanges:item", this.item, "(index is", this.index, ")");
    } else if (changes.index) {
      this.index = changes.index.currentValue;
      this.logger.debug("ngOnChanges:index", this.index);
    } else if (changes.filteredFiles) {
      this.filteredFiles = changes.filteredFiles.currentValue;
      this.logger.debug("ngOnChanges:filteredFiles", this.filteredFiles);
    } else {
      keys(changes).forEach(key => {
        if (!changes[key].firstChange) {
          this.logger.debug("ngOnChanges:untracked changes in:", key, "currentValue:", changes[key].currentValue);
        }
      });
    }
    this.canMoveUp = this.contentMetadataService.canMoveUp(this.filteredFiles, this.item);
    this.canMoveDown = this.contentMetadataService.canMoveDown(this.filteredFiles, this.item);
  }

  onImageDateChange(dateValue: DateValue) {
    if (dateValue) {
      this.logger.debug("date changed from:", this.dateUtils.displayDateAndTime(this.item.date), "to", this.dateUtils.displayDateAndTime(dateValue.date));
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
    this.imageChange.emit(this.emitValue());
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

  private emitValue(): ContentMetadataItem {
    return this.item;
  }

  callInsert(fileElement: HTMLInputElement) {
    this.logger.debug("callInsert:", fileElement);
    this.item = {date: this.dateUtils.momentNow().valueOf(), dateSource: "upload", tags: []};
    this.imageInsert.emit(this.emitValue());
    this.replace(fileElement);
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
