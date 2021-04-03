import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { omit } from "lodash-es";
import { FileUploader } from "ng2-file-upload";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "src/app/models/alert-target.model";
import { AuthService } from "../../../auth/auth.service";
import { ALL_TAGS, ContentMetadata, ContentMetadataItem, ContentMetadataItemWithIndex, ImageTag, RECENT_PHOTOS, S3Metadata } from "../../../models/content-metadata.model";
import { MemberResourcesPermissions } from "../../../models/member-resource.model";
import { Confirm } from "../../../models/ui-actions";
import { sortBy } from "../../../services/arrays";
import {Location} from "@angular/common";
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

@Component({
  selector: "app-list-editor",
  styleUrls: ["./image-list.component.sass"],
  templateUrl: "./image-list.component.html",
})
export class ImageListComponent implements OnInit {
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
  showDuplicates = false;
  toggled: boolean;

  constructor(private stringUtils: StringUtilsService,
              public imageTagDataService: ImageTagDataService,
              private imageDuplicatesService: ImageDuplicatesService,
              private committeeQueryService: CommitteeQueryService,
              private contentMetadataService: ContentMetadataService,
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
    this.route.queryParams.subscribe(params => {
      const story = params["story"];
      this.logger.debug("story:", story);
      this.tagFilter = +story || this.imageTagDataService.currentTag()?.key || 0;
      this.logger.debug("tagFilter:", this.tagFilter, "story:", story);
    });
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
    this.applyFilters();
    this.imageTagDataService.imageTags()
      .subscribe((imageTags: ImageTag[]) => {
        if (this.contentMetadata) {
          this.contentMetadata.imageTags = imageTags.filter(tag => tag.key > 0);
          this.logger.debug("received imageTags:", imageTags, "saved to contentMetadata imageTags:", this.contentMetadata.imageTags);
        }
      });
    this.applyAllowEdits();
  }

  refreshImageMetaData(imageSource: string) {
    this.notify.setBusy();
    this.imageSource = imageSource;

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

  fileDate(file: ContentMetadataItem): number {
    return file.date || this.s3Metadata.find(metadata => file.image.includes(metadata.key))?.lastModified;
  }

  applyFilters() {
    this.filteredFiles = this.filterFiles();
    this.imageDuplicatesService.populateFrom(this.contentMetadata, this.filteredFiles);
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

  saveChangeAndExit() {
    this.contentMetadataService.createOrUpdate(this.contentMetadata)
      .then(() => {
        this.exitBackToPreviousWindow();
      }).catch(response => this.notify.error({title: "Failed to save images", message: response}));
  }

  public exitBackToPreviousWindow() {
    this.location.back();
  }

  applyAllowEdits() {
    this.allow.edit = this.memberLoginService.allowContentEdits();
  }

  saveOrUpdateSuccessful() {
    this.notify.success("data for " + this.contentMetadata.files.length + " images was saved successfully.");
  }

  moveUp(item: ContentMetadataItemWithIndex) {
    const index = this.findIndex(item);
    if (index > 0) {
      this.delete(item);
      this.contentMetadata.files.splice(index - 1, 0, item.item);
    }
  }

  moveDown(item: ContentMetadataItemWithIndex) {
    const index = this.findIndex(item);
    if (index < this.contentMetadata.files.length) {
      this.delete(item);
      this.contentMetadata.files.splice(index + 1, 0, item.item);
    }
  }

  imageChange(item: ContentMetadataItemWithIndex) {
    if (!item?.item) {
      this.logger.debug("change:no item");
    } else if (item.item._id) {
      const index = this.findIndex(item);
      this.logger.debug("change:existing item", item, "at index", index);
      this.contentMetadata.files[index] = item.item;
    } else {
      this.insert(item);
      this.applyFilters();
    }
  }

  delete(item: ContentMetadataItemWithIndex) {
    this.logger.debug("delete:before count", this.contentMetadata.files.length, "item:", item);
    const index = this.findIndex(item);
    this.contentMetadata.files.splice(index, 1);
    this.logger.debug("delete:after count", this.contentMetadata.files.length);
    this.applyFilters();
  }

  private findIndex(item: ContentMetadataItemWithIndex): number {
    const direct: number = this.contentMetadata.files.indexOf(item.item);
    if (direct > -1) {
      this.logger.debug("findIndex:direct:", direct, "for", item.item.image);
      return direct;
    } else {
      const indexByMongoId = this.contentMetadata.files.indexOf(this.contentMetadata.files.find(file => file._id === item.item._id));
      if (indexByMongoId > 0) {
        this.logger.debug("findIndex:indexByMongoId:", indexByMongoId, "for", item.item.image);
        return indexByMongoId;
      } else {
        const indexByImage = this.contentMetadata.files.indexOf(this.contentMetadata.files.find(file => file.image === item.item.image));
        this.logger.debug("findIndex:indexByImage:", indexByMongoId, "for", item.item.image);
        return indexByImage;
      }
    }
  }

  insert(item: ContentMetadataItemWithIndex) {
    const newItem: ContentMetadataItem = omit(item.item, "_id");
    this.logger.debug("insert:new item", item, "item without id:", newItem);
    this.contentMetadata.files.splice(item.index, 0, newItem);
    this.applyFilters();
  }

  filterFiles(): ContentMetadataItem[] {
    this.logger.debug("filesForTag:", this.tagFilter);
    const filteredFiles: ContentMetadataItem[] = this.contentMetadata?.files
      ?.filter(item => +this.tagFilter === 0 || item?.tags?.includes(+this.tagFilter))
      ?.filter(item => this.showDuplicates ? this.imageDuplicatesService.duplicatedContentMetadataItems(item).length > 0 : true)
      .sort(sortBy(this.showDuplicates ? "image" : "-date"));
    this.logger.debug("filtering:", filteredFiles?.length, "of", this.contentMetadata?.files?.length, "based on story tag key", this.tagFilter);
    return filteredFiles;
  }

  selectableTags() {
    return [ALL_TAGS].concat(this.contentMetadata.imageTags).filter(tag => tag !== RECENT_PHOTOS);
  }

}
