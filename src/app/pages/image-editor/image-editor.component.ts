import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { NgSelectComponent } from "@ng-select/ng-select";
import { cloneDeep, each, groupBy } from "lodash-es";
import first from "lodash-es/first";
import isArray from "lodash-es/isArray";
import { FileUploader } from "ng2-file-upload";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "src/app/models/alert-target.model";
import { AuthService } from "../../auth/auth.service";
import { GroupEvent, GroupEventsFilter } from "../../models/committee.model";
import { ALL_TAGS, ContentMetadata, ContentMetadataItem, DuplicateImages, ImageTag, RECENT_PHOTOS, S3Metadata } from "../../models/content-metadata.model";
import { DateValue } from "../../models/date.model";
import { MemberResourcesPermissions } from "../../models/member-resource.model";
import { Confirm } from "../../models/ui-actions";
import { sortBy } from "../../services/arrays";
import { CommitteeQueryService } from "../../services/committee/committee-query.service";
import { ContentMetadataService } from "../../services/content-metadata.service";
import { DateUtilsService } from "../../services/date-utils.service";
import { FileUploadService } from "../../services/file-upload.service";
import { ImageTagDataService } from "../../services/image-tag-data-service";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { MemberLoginService } from "../../services/member/member-login.service";
import { AlertInstance, NotifierService } from "../../services/notifier.service";
import { RouterHistoryService } from "../../services/router-history.service";
import { StringUtilsService } from "../../services/string-utils.service";
import { UrlService } from "../../services/url.service";

@Component({
  selector: "app-image-editor",
  styleUrls: ["./image-editor.component.sass"],
  templateUrl: "./image-editor.component.html",
})
export class ImageEditorComponent implements OnInit {
  private logger: Logger;
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public confirm = new Confirm();
  public destinationType: string;
  public imageSource: string;
  public tagFilter: number;
  public eventFilter: string;
  public uploader: FileUploader;
  public contentMetadata: ContentMetadata;
  public s3Metadata: S3Metadata[] = [];
  public filteredFiles: ContentMetadataItem[] = [];
  public currentImageIndex: number;
  public allow: MemberResourcesPermissions = {};
  public hasFileOver = false;
  public groupEvents: GroupEvent[] = [];
  private imageMetaDataItem: ContentMetadataItem;
  private duplicateImages: DuplicateImages = {};
  showDuplicates = false;

  constructor(
    private stringUtils: StringUtilsService,
    public imageTagDataService: ImageTagDataService,
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
    this.logger = loggerFactory.createLogger(ImageEditorComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.notify.setBusy();
    this.destinationType = "";
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const imageSource = paramMap.get("image-source");
      this.logger.debug("imageSource from route params:", paramMap, imageSource);
      if (imageSource) {
        this.imageSource = imageSource;
        this.logger.debug("imageSource from route params:", this.imageSource);
        this.refreshImageMetaData(this.imageSource);
        this.uploader = this.fileUploadService.createUploaderFor(imageSource);
        this.uploader.response.subscribe((response: string | HttpErrorResponse) => {
            this.logger.debug("response", response, "type", typeof response);
            this.notify.clearBusy();
            if (response instanceof HttpErrorResponse) {
              this.notify.error({title: "Upload failed", message: response.error});
            } else if (response === "Unauthorized") {
              this.notify.error({title: "Upload failed", message: response + " - try logging out and logging back in again and trying this again."});
            } else {
              const uploadResponse = JSON.parse(response);
              const contentMetadataItem: ContentMetadataItem = this.contentMetadata.files[this.currentImageIndex];
              this.logger.debug("image path prior to upload:", contentMetadataItem.image);
              contentMetadataItem.image = this.contentMetadataService.baseUrl(this.imageSource) + "/" + uploadResponse.response.fileNameData.awsFileName;
              this.logger.debug("JSON response:", uploadResponse, "current contentMetadataItem[" + this.currentImageIndex + "]:", contentMetadataItem);
              this.logger.debug("image path after upload:", contentMetadataItem.image);
              this.notify.clearBusy();
              this.notify.success({title: "New file added", message: uploadResponse.response.fileNameData.title});
            }
          }
        );
      }
    });
    this.tagFilter = 0;
    this.applyFilters();
    this.imageTagDataService.imageTags()
      .subscribe((imageTags: ImageTag[]) => {
        if (this.contentMetadata) {
          this.contentMetadata.imageTags = imageTags.filter(tag => tag.key > 0);
          this.logger.info("received imageTags:", imageTags, "saved to contentMetadata imageTags:", this.contentMetadata.imageTags);
        }
      });
    this.applyAllowEdits();
  }

  onImageDateChange(dateValue: DateValue, imageMetaDataItem: ContentMetadataItem) {
    if (dateValue) {
      this.logger.debug("from:", this.dateUtils.asDate(imageMetaDataItem.date), "to", dateValue.date);
      imageMetaDataItem.date = dateValue.value;
      this.filterEventsByDateAndSource(imageMetaDataItem.dateSource, imageMetaDataItem.date);
    }
  }

  tagsChange(stories: ImageTag[], imageMetaDataItem: ContentMetadataItem) {
    this.logger.debug("tagChange:stories", stories, "imageMetaDataItem:", imageMetaDataItem);
    if (isArray(stories)) {
      imageMetaDataItem.tags = stories.map(story => story.key);
      this.logger.debug("imageMetaDataItem now:", imageMetaDataItem);
    } else {
      this.logger.debug("ignoring event", stories);
    }
  }

  fileDate(file: ContentMetadataItem): number {
    return file.date || this.s3Metadata.find(metadata => file.image.includes(metadata.key))?.lastModified;
  }

  refreshImageMetaData(imageSource: string) {
    this.notify.setBusy();
    this.imageSource = imageSource;

    Promise.all([
      this.contentMetadataService.items(imageSource)
        .then((contentMetaData) => {
          this.contentMetadata = contentMetaData;
          this.imageTagDataService.populateFrom(contentMetaData.imageTags);
          this.detectDuplicateImages();
          this.applyFilters();
        }),
      this.contentMetadataService.listMetaData(imageSource)
        .then((s3Metadata) => {
          this.s3Metadata = s3Metadata;
        })])
      .then(() => {
        this.logger.debug("this.imageMetaData.files before:", this.contentMetadata.files);
        this.contentMetadata.files = this.contentMetadata.files.map(file => {
          return {
            ...file,
            date: this.fileDate(file),
            dateSource: file.dateSource || "upload"
          };
        });
        this.logger.debug("refreshImageMetaData:imageSource", imageSource, "returning", this.contentMetadata.files.length, "ContentMetadataItem items");
        this.notify.clearBusy();
        this.notify.hide();
      })
      .catch(response => this.notify.error({title: "Failed to refresh images", message: response}));
  }

  private detectDuplicateImages() {
    this.duplicateImages = groupBy(this.contentMetadata.files, "image");
    this.logger.debug("duplicateImages pre-clean:", cloneDeep(this.duplicateImages));
    each(this.duplicateImages, (items, image) => {
      if (items.length === 1) {
        delete this.duplicateImages[image];
      }
    });
    this.logger.debug("duplicateImages post-clean:", this.duplicateImages);
  }

  duplicateCount(item: ContentMetadataItem): string {
    const count = this.duplicatedContentMetadataItems(item)?.length || 0;
    return count > 0 ? `${this.stringUtils.pluraliseWithCount(count, "duplicate")}:` : "No duplicates";
  }

  public duplicatedContentMetadataItems(item: ContentMetadataItem): ContentMetadataItem[] {
    return this.duplicateImages[item.image]?.filter(file => file._id !== item._id) || [];
  }

  duplicates(item: ContentMetadataItem): string {
    return (this.duplicatedContentMetadataItems(item) || []).map(item => `${item.text} (image ${(this.imageNumber(item))})`).join(", ");
  }

  private imageNumber(item: ContentMetadataItem) {
    const find = this.filteredFiles.find(file => file._id === item._id);
    return this.filteredFiles.indexOf(find) + 1;
  }

  applyFilters() {
    this.filteredFiles = this.filterFilesForCurrentTag();
  }

  filterEventsByDateAndSource(eventType: string, date: number) {
    this.logger.debug("filterEventsByDateAndSource:", eventType);
    this.eventsFilteredFrom(eventType, date);
  }

  reverseSortOrder() {
    this.contentMetadata.files = this.contentMetadata.files.reverse();
  }

  imageTitleLength() {
    if (this.imageSource === "imagesHome") {
      return 50;
    } else {
      return 20;
    }
  }

  replace(fileElement: HTMLInputElement, index: number) {
    this.currentImageIndex = index;
    this.browseToFile(fileElement);
  }

  moveUp(item: ContentMetadataItem) {
    const currentIndex = this.contentMetadata.files.indexOf(item);
    if (currentIndex > 0) {
      this.delete(item);
      this.contentMetadata.files.splice(currentIndex - 1, 0, item);
    }
  }

  moveDown(item: ContentMetadataItem) {
    const currentIndex = this.contentMetadata.files.indexOf(item);
    if (currentIndex < this.contentMetadata.files.length) {
      this.delete(item);
      this.contentMetadata.files.splice(currentIndex + 1, 0, item);
    }
  }

  delete(item: ContentMetadataItem) {
    this.contentMetadata.files = this.contentMetadata.files.filter(file => file._id !== item._id);
    this.applyFilters();
    this.detectDuplicateImages();
  }

  insertHere(fileElement: HTMLInputElement, index: number) {
    const insertedImageMetaDataItem = this.contentMetadataService.createNewMetaData(true);
    this.contentMetadata.files.splice(index, 0, insertedImageMetaDataItem);
    this.replace(fileElement, index);
  }

  saveChangeAndExit() {
    this.contentMetadataService.createOrUpdate(this.contentMetadata)
      .then(() => {
        this.exitBackToPreviousWindow();
      }).catch(response => this.notify.error({title: "Failed to save images", message: response}));
  }

  public exitBackToPreviousWindow() {
    this.urlService.navigateTo("/", undefined, true);
  }

  applyAllowEdits() {
    this.allow.edit = this.memberLoginService.allowContentEdits();
  }

  saveOrUpdateSuccessful() {
    this.notify.success("data for " + this.contentMetadata.files.length + " images was saved successfully.");
  }

  browseToFile(fileElement: HTMLInputElement) {
    this.logger.debug("browsing from ", fileElement);
    fileElement.click();
  }

  onFileSelect($file: File[]) {
    this.notify.setBusy();
    this.notify.progress({title: "Image upload", message: `uploading ${first($file).name} - please wait...`});
  }

  public fileOver(index: number): void {
    this.hasFileOver = index === this.currentImageIndex;
    this.logger.debug("hasFileOver:", this.hasFileOver);
  }

  fileDropped($event: File[]) {
    this.logger.debug("fileDropped:", $event);
  }

  filterFilesForCurrentTag(): ContentMetadataItem[] {
    this.logger.debug("filesForTag:", this.tagFilter);
    const filteredFiles: ContentMetadataItem[] = this.contentMetadata?.files
      ?.filter(file => +this.tagFilter === 0 || file?.tags?.includes(+this.tagFilter))
      ?.filter(file => this.showDuplicates ? this.duplicatedContentMetadataItems(file).length > 0 : true)
      .sort(sortBy(this.showDuplicates ? "image" : "-date"));
    this.logger.debug("filtering:", filteredFiles?.length, "of", this.contentMetadata?.files?.length, "based on story tag key", this.tagFilter);
    return filteredFiles;
  }

  eventsFilteredFrom(dateSource: string, date: number) {
    const groupEventsFilter: GroupEventsFilter = {
      selectAll: true,
      fromDate: this.dateUtils.asDateValue(this.dateUtils.asMoment(date).add(-520, "weeks").valueOf()),
      toDate: this.dateUtils.asDateValue(this.dateUtils.asMoment(date).add(1, "day")),
      includeContact: true,
      includeDescription: true,
      includeLocation: true,
      includeWalks: dateSource === "walk",
      includeSocialEvents: dateSource === "social",
      includeCommitteeEvents: false,
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
    this.logger.debug("select", select, "imageMetaDataItem:", this.imageMetaDataItem);
  }

  onChange(imageMetaDataItem: ContentMetadataItem) {
    const event = this.groupEvents.find(event => event.id === imageMetaDataItem.eventId);
    if (event) {
      imageMetaDataItem.date = event.eventDate;
      this.logger.debug("onChange:imageMetaDataItem.date", imageMetaDataItem.date);
    }
    this.logger.debug("onChange:imageMetaDataItem:", imageMetaDataItem, "event", event);
  }

  selectMetaDataItem(imageMetaDataItem: ContentMetadataItem) {
    if (this.imageMetaDataItem !== imageMetaDataItem) {
      this.imageMetaDataItem = imageMetaDataItem;
      this.eventsFilteredFrom(imageMetaDataItem.dateSource, imageMetaDataItem.date);
    } else {
      this.logger.debug("already selected", imageMetaDataItem);
    }
  }

  selectableTags() {
    return [ALL_TAGS].concat(this.contentMetadata.imageTags).filter(tag => tag !== RECENT_PHOTOS);
  }
}
