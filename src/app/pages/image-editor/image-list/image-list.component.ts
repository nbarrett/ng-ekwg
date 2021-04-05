import { Location } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap, Params, Router } from "@angular/router";
import first from "lodash-es/first";
import { FileUploader } from "ng2-file-upload";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AlertTarget } from "src/app/models/alert-target.model";
import { AuthService } from "../../../auth/auth.service";
import { ALL_TAGS, ContentMetadata, ContentMetadataItem, ImageTag, RECENT_PHOTOS, S3Metadata } from "../../../models/content-metadata.model";
import { MemberResourcesPermissions } from "../../../models/member-resource.model";
import { Confirm } from "../../../models/ui-actions";
import { move, sortBy } from "../../../services/arrays";
import { CommitteeQueryService } from "../../../services/committee/committee-query.service";
import { ContentMetadataService } from "../../../services/content-metadata.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { FileUploadService } from "../../../services/file-upload.service";
import { ImageDuplicatesService } from "../../../services/image-duplicates-service";
import { ImageTagDataService } from "../../../services/image-tag-data-service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { RouterHistoryService } from "../../../services/router-history.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { SiteEditService } from "../../../site-edit/site-edit.service";

@Component({
  selector: "app-list-editor",
  styleUrls: ["./image-list.component.sass"],
  templateUrl: "./image-list.component.html"
})
export class ImageListComponent implements OnInit {
  private logger: Logger;
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public confirm = new Confirm();
  public destinationType: string;
  public imageSource: string;
  public selectedTag: ImageTag = RECENT_PHOTOS;
  public filterType = "recent";
  public eventFilter: string;
  public uploader: FileUploader;
  public contentMetadata: ContentMetadata;
  public s3Metadata: S3Metadata[] = [];
  public filteredFiles: ContentMetadataItem[] = [];
  public allow: MemberResourcesPermissions = {};
  public showDuplicates = false;
  public toggled: boolean;
  public filterText: string;
  public hasFileOver = false;
  public currentImageIndex: number;
  private searchChangeObservable = new Subject<string>();

  constructor(private stringUtils: StringUtilsService,
              public imageTagDataService: ImageTagDataService,
              private router: Router,
              private imageDuplicatesService: ImageDuplicatesService,
              private committeeQueryService: CommitteeQueryService,
              private contentMetadataService: ContentMetadataService,
              private siteEditService: SiteEditService,
              private authService: AuthService,
              private location: Location,
              private notifierService: NotifierService,
              private fileUploadService: FileUploadService,
              private route: ActivatedRoute,
              private memberLoginService: MemberLoginService,
              public dateUtils: DateUtilsService,
              private routerHistoryService: RouterHistoryService,
              private urlService: UrlService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ImageListComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.notify.setBusy();
    this.destinationType = "";
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const imageSource = paramMap.get("image-source");
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
              this.logger.debug("image path prior to upload:", contentMetadataItem?.image);
              contentMetadataItem.image = this.contentMetadataService.baseUrl(this.imageSource) + "/" + uploadResponse.response.fileNameData.awsFileName;
              this.logger.debug("JSON response:", uploadResponse, "current contentMetadataItem[" + this.currentImageIndex + "]:", contentMetadataItem);
              this.logger.debug("image path at index position", this.currentImageIndex, "after upload:", contentMetadataItem?.image);
              this.notify.clearBusy();
              this.notify.success({title: "New file added", message: uploadResponse.response.fileNameData.title});
            }
          }, (error) => {
            this.notify.error({title: "Upload failed", message: error});
          }
        );
      }
    });
    this.selectTag();
    this.applyFilters();
    this.imageTagDataService.imageTags()
      .subscribe((imageTags: ImageTag[]) => {
        if (this.contentMetadata) {
          this.contentMetadata.imageTags = imageTags.filter(tag => tag.key > 0);
          this.logger.debug("received imageTags:", imageTags, "contentMetadata imageTags:", this.contentMetadata.imageTags);
        }
        this.selectTag();
      });
    this.applyAllowEdits();
    this.searchChangeObservable.pipe(debounceTime(500))
      .pipe(distinctUntilChanged())
      .subscribe(() => this.applyFilters());
  }

  onFileSelect($file: File[]) {
    if ($file) {
      this.notify.setBusy();
      this.notify.progress({title: "Image upload", message: `uploading ${first($file).name} - please wait...`});
    }
  }

  public fileOver(): void {
    this.hasFileOver = true;
    this.logger.debug("hasFileOver:", this.hasFileOver);
  }

  fileDropped($event: File[]) {
    this.logger.debug("fileDropped:", $event);
  }

  filesFiltered(): ContentMetadataItem[] {
    return this.filteredFiles;
  }

  onSearchChange(searchEntry: string) {
    this.logger.debug("received searchEntry:" + searchEntry);
    this.searchChangeObservable.next(searchEntry);
  }

  applyFiltersFromTag() {
    this.logger.debug("applyFiltersFromTag:this.selectedTag", this.selectedTag);
    this.updateQueryParams({story: this.selectedTag.key});
    this.applyFilters();
  }

  private updateQueryParams(queryParams: Params) {
    this.router.navigate([], {
      queryParams, queryParamsHandling: "merge"
    });
  }

  applyFilters() {
    this.filteredFiles = [];
    this.filteredFiles = this.contentMetadataService.filterSlides(this.contentMetadata?.files, this.selectedTag, this.showDuplicates, this.filterText);
    this.imageDuplicatesService.populateFrom(this.contentMetadata, this.filteredFiles);
    this.logger.debug("applyFilters:", this.filteredFiles?.length, "of", this.contentMetadata?.files?.length, "files");
  }

  refreshImageMetaData(imageSource: string) {
    this.notify.setBusy();
    this.imageSource = imageSource;
    this.urlService.navigateTo("image-editor", imageSource);

    Promise.all([
      this.contentMetadataService.items(imageSource)
        .then((contentMetaData) => {
          this.contentMetadata = contentMetaData;
          this.imageTagDataService.populateFrom(contentMetaData.imageTags);
          this.applyFilters();
        }),
      this.contentMetadataService.listMetaData(imageSource)
        .then((s3Metadata) => {
          this.s3Metadata = s3Metadata;
        })])
      .then(() => {
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

  fileDate(file: ContentMetadataItem): number {
    if (!file.date && !this.s3Metadata) {
      this.logger.warn("cant find date for", file);
    }
    const fileDate = file.date || this.s3Metadata?.find(metadata => file.image.includes(metadata.key))?.lastModified;
    this.logger.debug("fileDate:", fileDate, "original file.date", file.date);
    return fileDate;
  }

  reverseSortOrder() {
    this.contentMetadata.files = this.contentMetadata.files.reverse();
    this.applyFilters();
  }

  sortByDate() {
    this.contentMetadata.files = this.contentMetadata.files.sort(sortBy("-date"));
    this.applyFilters();
  }

  imageTitleLength() {
    if (this.imageSource === "imagesHome") {
      return 50;
    } else {
      return 20;
    }
  }

  saveChangeAndExit() {
    this.contentMetadataService.createOrUpdate(this.contentMetadata)
      .then(() => {
        this.exitBackToPreviousWindow();
      }).catch(response => this.notify.error({title: "Failed to save images", message: response}));
  }

  public exitBackToPreviousWindow() {
    this.routerHistoryService.navigateBackToLastMainPage();
  }

  applyAllowEdits() {
    this.allow.edit = this.memberLoginService.allowContentEdits();
  }

  saveOrUpdateSuccessful() {
    this.notify.success("data for" + this.contentMetadata.files.length + " images was saved successfully.");
  }

  moveUp(item: ContentMetadataItem) {
    const currentIndex = this.contentMetadataService.findIndex(this.contentMetadata.files, item);
    if (this.contentMetadataService.canMoveUp(this.contentMetadata.files, item)) {
      move(this.contentMetadata.files, currentIndex, currentIndex - 1);
      this.logger.debug("moved up item with index", currentIndex, "to", this.contentMetadataService.findIndex(this.contentMetadata.files, item), "in total of", this.contentMetadata.files.length, "items");
      this.applyFilters();
    } else {
      this.logger.warn("cant move up item with index", currentIndex);
    }
  }

  moveDown(item: ContentMetadataItem) {
    const currentIndex = this.contentMetadataService.findIndex(this.contentMetadata.files, item);
    if (this.contentMetadataService.canMoveDown(this.contentMetadata.files, item)) {
      move(this.contentMetadata.files, currentIndex, currentIndex + 1);
      this.logger.debug("moved down item with index", currentIndex, "to", this.contentMetadataService.findIndex(this.contentMetadata.files, item), "for item", item.text, "in total of", this.contentMetadata.files.length, "items");
      this.applyFilters();
    } else {
      this.logger.warn("cant move down item", currentIndex);
    }
  }

  imageChange(item: ContentMetadataItem) {
    if (!item) {
      this.logger.debug("change:no item");
    } else {
      this.currentImageIndex = this.contentMetadataService.findIndex(this.contentMetadata.files, item);
      if (this.currentImageIndex >= 0) {
        this.logger.debug("change:existing item", item, "at index", this.currentImageIndex);
        this.contentMetadata.files[this.currentImageIndex] = item;
      } else {
        this.logger.debug("change:appears to be a new item", item, "at index", this.currentImageIndex);
      }
    }
  }

  delete(item: ContentMetadataItem): number {
    this.logger.debug("delete:before count", this.contentMetadata.files.length, "item:", item);
    const index = this.contentMetadataService.findIndex(this.contentMetadata.files, item);
    if (index >= 0) {
      this.contentMetadata.files.splice(index, 1);
      this.logger.debug("delete:after count", this.contentMetadata.files.length);
      this.applyFilters();
    } else {
      this.logger.warn("cant delete", item);
    }
    return this.contentMetadataService.findIndex(this.contentMetadata.files, item);
  }

  imageInsert(item: ContentMetadataItem) {
    const existingIndex = this.contentMetadataService.findIndex(this.contentMetadata.files, item);
    if (existingIndex >= 0) {
      this.logger.debug("attempt to insert:existing item", item, "in index position:", existingIndex);
    } else {
      const index = 0;
      this.logger.debug("insert:new item", item, "in index position:", index, "item:", item);
      this.contentMetadata.files.splice(index, 0, item);
      this.applyFilters();
    }
  }

  selectableTags(): ImageTag[] {
    return this.contentMetadata.imageTags;
  }

  tagTracker(index: number, imageTag: ImageTag) {
    return imageTag.key;
  }

  metadataItemTracker(index: number, item: ContentMetadataItem) {
    return item._id || index;
  }

  filterForAll() {
    this.selectedTag = ALL_TAGS;
  }

  filterForRecent() {
    this.selectedTag = RECENT_PHOTOS;
  }

  filterFor(choice: string) {
    this.filterType = choice;
    if (choice === "all") {
      this.selectedTag = ALL_TAGS;
    } else if (choice === "recent") {
      this.selectedTag = RECENT_PHOTOS;
    } else {
      this.selectedTag = this.selectableTags()[0];
    }
    this.applyFilters();
    this.updateQueryParams({story: this.selectedTag.key});
  }

  private selectTag() {
    this.route.queryParams.subscribe(params => {
      const story = params["story"];
      this.selectedTag = this.imageTagDataService.findTag(story) || this.imageTagDataService.currentTag() || RECENT_PHOTOS;
      switch (this.selectedTag) {
        case RECENT_PHOTOS:
          this.filterType = "recent";
          break;
        case ALL_TAGS:
          this.filterType = "all";
          break;
        default:
          this.filterType = "choose";
          break;
      }
      this.logger.debug("story:", story, "imageTagDataService.currentTag", this.imageTagDataService.currentTag(), "selectedTag:", this.selectedTag);
    });
  }
}
