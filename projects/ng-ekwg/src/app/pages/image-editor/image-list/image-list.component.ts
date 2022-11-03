import { Location } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap, Params, Router } from "@angular/router";
import { min } from "lodash-es";
import first from "lodash-es/first";
import range from "lodash-es/range";
import { FileUploader } from "ng2-file-upload";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { ALL_TAGS, ContentMetadata, ContentMetadataItem, IMAGES_HOME, ImageTag, RECENT_PHOTOS, S3Metadata } from "../../../models/content-metadata.model";
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
import { NumberUtilsService } from "../../../services/number-utils.service";
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
  public lastSelectedTag: ImageTag;
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
  ready = false;
  public pageNumber = 1;
  private pageCount: number;
  private pageSize = 10;
  private pages: number[];

  constructor(private stringUtils: StringUtilsService,
              public imageTagDataService: ImageTagDataService,
              public numberUtils: NumberUtilsService,
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
    this.logger = loggerFactory.createLogger(ImageListComponent, NgxLoggerLevel.INFO);
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
    this.applyFilter();
    this.imageTagDataService.imageTags()
      .subscribe((imageTags: ImageTag[]) => {
        if (this.contentMetadata) {
          this.contentMetadata.imageTags = imageTags.filter(tag => tag.key > 0);
          this.logger.info("received imageTags:", imageTags, "contentMetadata imageTags:", this.contentMetadata.imageTags);
        }
        this.lastSelectedTag = this.contentMetadata.imageTags[0];
        this.selectTag();
      });
    this.applyAllowEdits();
    this.searchChangeObservable.pipe(debounceTime(500))
      .pipe(distinctUntilChanged())
      .subscribe(() => this.applyFilter());
  }

  pageChanged(event: PageChangedEvent): void {
    this.logger.debug("event:", event);
    this.goToPage(event.page);
  }

  previousPage() {
    if (this.pageNumber > 1) {
      this.goToPage(this.pageNumber - 1);
    }
  }

  nextPage() {
    if (this.pageNumber < this.pageCount) {
      this.goToPage(this.pageNumber + 1);
    }
  }

  goToPage(pageNumber) {
    this.logger.info("goToPage", pageNumber);
    this.pageNumber = pageNumber;
    this.applyPagination();
  }

  paginate(contentMetadataItems: ContentMetadataItem[], pageSize, pageNumber): ContentMetadataItem[] {
    return contentMetadataItems.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  }

  private applyPagination() {
    this.pages = range(1, this.pageCount + 1);
    const filteredImageCount = this.filteredImages().length;
    const currentPageImages: ContentMetadataItem[] = this.currentPageImages();
    this.logger.info("applyPagination: filtered image count", filteredImageCount, "filtered image count", filteredImageCount, "current page image count", currentPageImages.length, "pageSize:", this.pageSize, "pageCount", this.pageCount, "pages", this.pages, "currentPageImages:", currentPageImages.map(item => item.text));
    if (currentPageImages.length === 0) {
      this.notify.progress("No images found");
    } else {
      const offset = (this.pageNumber - 1) * this.pageSize + 1;
      const pageIndicator = this.pages.length > 1 ? `Page ${this.pageNumber} of ${this.pageCount}` : `Page ${this.pageNumber}`;
      this.notify.progress(`${pageIndicator}  — showing ${offset} to ${offset + this.pageSize - 1} of ${this.stringUtils.pluraliseWithCount(filteredImageCount, "image")}`);
    }
  }

  currentPageImages(): ContentMetadataItem[] {
    return this.paginate(this.filteredImages(), this.pageSize, this.pageNumber) || [];
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

  filteredImages(): ContentMetadataItem[] {
    return this.filteredFiles;
  }

  onSearchChange(searchEntry: string) {
    this.logger.debug("received searchEntry:" + searchEntry);
    this.searchChangeObservable.next(searchEntry);
  }

  changeLastSelectedTagOrFirst(): ImageTag {
    if ([ALL_TAGS, RECENT_PHOTOS].includes(this.selectedTag)) {
      return this.selectableTags()[0];
    } else {
      return this.selectedTag;
    }
  }

  applyFiltersFromTag(imageTag: ImageTag) {
    this.selectedTag = imageTag;
    this.logger.info("applyFiltersFromTag:this.selectedTag", this.selectedTag, "imageTag", imageTag);
    if (this.filterType !== "all") {
      this.updateQueryParams({story: this?.selectedTag?.key});
    }
    this.applyFilter();
  }

  private updateQueryParams(queryParams: Params) {
    this.router.navigate([], {
      queryParams, queryParamsHandling: "merge"
    });
  }

  applyFilter() {
    this.ready = false;
    this.filteredFiles = this.contentMetadataService.filterSlides(this.contentMetadata?.files, this.selectedTag, this.showDuplicates, this.filterText);
    this.pageCount = this.calculatePageCount();
    this.applyPagination();
    this.imageDuplicatesService.populateFrom(this.contentMetadata, this.filteredFiles);
    this.logger.debug("applyFilters:", this.filteredFiles?.length, "of", this.contentMetadata?.files?.length, "files");
    setTimeout(() => {
      this.ready = true;
    }, 0);
  }

  refreshImageMetaData(imageSource: string) {
    this.notify.setBusy();
    this.imageSource = imageSource;
    this.urlService.navigateUnconditionallyTo("image-editor", imageSource);

    Promise.all([
      this.contentMetadataService.items(imageSource)
        .then((contentMetaData: ContentMetadata) => {
          this.logger.info("contentMetaData:", contentMetaData);
          this.contentMetadata = contentMetaData;
          this.imageTagDataService.populateFrom(contentMetaData.imageTags);
          this.applyFilter();
        }),
      this.contentMetadataService.listMetaData(imageSource)
        .then((s3Metadata: S3Metadata[]) => {
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
    this.applyFilter();
  }

  sortByDate() {
    this.contentMetadata.files = this.contentMetadata.files.sort(sortBy("-date"));
    this.applyFilter();
  }

  imageTitleLength() {
    if (this.imageSource === IMAGES_HOME) {
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
    this.routerHistoryService.navigateBackToLastMainPage(true);
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
      this.applyFilter();
    } else {
      this.logger.warn("cant move up item with index", currentIndex);
    }
  }

  moveDown(item: ContentMetadataItem) {
    const currentIndex = this.contentMetadataService.findIndex(this.contentMetadata.files, item);
    if (this.contentMetadataService.canMoveDown(this.contentMetadata.files, item)) {
      move(this.contentMetadata.files, currentIndex, currentIndex + 1);
      this.logger.debug("moved down item with index", currentIndex, "to", this.contentMetadataService.findIndex(this.contentMetadata.files, item), "for item", item.text, "in total of", this.contentMetadata.files.length, "items");
      this.applyFilter();
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
      this.applyFilter();
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
      this.applyFilter();
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
    this.applyFilter();
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

  maxSize() {
    return min([this.calculatePageCount(), 5]);
  }

  private calculatePageCount(): number {
    return this.numberUtils.asNumber(this.filteredImages().length / this.pageSize, 0);
  }

}
