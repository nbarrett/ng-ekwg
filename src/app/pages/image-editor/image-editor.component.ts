import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import first from "lodash-es/first";
import without from "lodash-es/without";
import { FileUploader } from "ng2-file-upload";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AlertTarget } from "src/app/models/alert-target.model";
import { AuthService } from "../../auth/auth.service";
import { ContentMetadata, ContentMetadataItem } from "../../models/content-metadata.model";
import { MemberResourcesPermissions } from "../../models/member-resource.model";
import { Confirm } from "../../models/ui-actions";
import { ContentMetadataService } from "../../services/content-metadata.service";
import { DateUtilsService } from "../../services/date-utils.service";
import { FileUploadService } from "../../services/file-upload.service";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { MemberLoginService } from "../../services/member/member-login.service";
import { AlertInstance, NotifierService } from "../../services/notifier.service";
import { RouterHistoryService } from "../../services/router-history.service";
import { UrlService } from "../../services/url.service";
import { SiteEditService } from "../../site-edit/site-edit.service";

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
  private subscription: Subscription;
  public uploader: FileUploader;
  public imageMetaData: ContentMetadata;
  public currentImageMetaDataItem: ContentMetadataItem;
  public allow: MemberResourcesPermissions = {};
  public hasFileOver = false;

  constructor(
    private contentMetadataService: ContentMetadataService,
    private authService: AuthService,
    private notifierService: NotifierService,
    private fileUploadService: FileUploadService,
    private route: ActivatedRoute,
    private siteEditService: SiteEditService,
    private memberLoginService: MemberLoginService,
    protected dateUtils: DateUtilsService,
    private routerHistoryService: RouterHistoryService,
    private urlService: UrlService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ImageEditorComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.authService.authResponse().subscribe(() => this.authChanges());
    this.siteEditService.events.subscribe(() => this.authChanges());
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
              this.currentImageMetaDataItem.image = this.imageMetaData.baseUrl + "/" + uploadResponse.response.fileNameData.awsFileName;
              this.logger.info("JSON response:", uploadResponse, "memberResource:", this.currentImageMetaDataItem);
              this.notify.clearBusy();
              this.notify.success({title: "New file added", message: uploadResponse.response.fileNameData.title});
            }
          }
        );
      }
    });
    this.applyAllowEdits();
    this.siteEditService.events.subscribe(item => this.applyAllowEdits());
    this.authChanges();
  }

  authChanges() {
    this.logger.info("permissions:");
  }

  refreshImageMetaData(imageSource: string) {
    this.notify.setBusy();
    this.imageSource = imageSource;
    this.contentMetadataService.items(imageSource)
      .then((contentMetaData) => {
        this.imageMetaData = contentMetaData;
        this.notify.clearBusy();
        this.notify.hide();
      }).catch(response => this.notify.error({title: "Failed to refresh images", message: response}));
  }

  exitBackToPreviousWindow() {
    this.routerHistoryService.navigateBackToLastMainPage();

  }

  reverseSortOrder() {
    this.imageMetaData.files = this.imageMetaData.files.reverse();
  }

  imageTitleLength() {
    if (this.imageSource === "imagesHome") {
      return 50;
    } else {
      return 20;
    }
  }

  replace(fileElement: HTMLInputElement, imageMetaDataItem) {
    this.currentImageMetaDataItem = imageMetaDataItem;
    this.browseToFile(fileElement);
  }

  moveUp(imageMetaDataItem) {
    const currentIndex = this.imageMetaData.files.indexOf(imageMetaDataItem);
    if (currentIndex > 0) {
      this.delete(imageMetaDataItem);
      this.imageMetaData.files.splice(currentIndex - 1, 0, imageMetaDataItem);
    }
  }

  moveDown(imageMetaDataItem) {
    const currentIndex = this.imageMetaData.files.indexOf(imageMetaDataItem);
    if (currentIndex < this.imageMetaData.files.length) {
      this.delete(imageMetaDataItem);
      this.imageMetaData.files.splice(currentIndex + 1, 0, imageMetaDataItem);
    }
  }

  delete(imageMetaDataItem) {
    this.imageMetaData.files = without(this.imageMetaData.files, imageMetaDataItem);
  }

  insertHere(fileElement: HTMLInputElement, imageMetaDataItem) {
    const insertedImageMetaDataItem = this.contentMetadataService.createNewMetaData(true);
    const currentIndex = this.imageMetaData.files.indexOf(imageMetaDataItem);
    this.imageMetaData.files.splice(currentIndex, 0, insertedImageMetaDataItem);
    this.replace(fileElement, insertedImageMetaDataItem);
  }

  saveAll() {
    this.contentMetadataService.createOrUpdate(this.imageMetaData)
      .then(contentMetaData => {
        this.exitBackToPreviousWindow();
      }).catch(response => this.notify.error({title: "Failed to save images", message: response}));
  }

  applyAllowEdits() {
    this.allow.edit = this.memberLoginService.allowContentEdits();
  }

  saveOrUpdateSuccessful() {
    this.notify.success("data for " + this.imageMetaData.files.length + " images was saved successfully.");
  }

  browseToFile(fileElement: HTMLInputElement) {
    this.logger.debug("browsing from ", fileElement);
    fileElement.click();
  }

  onFileSelect($file: File[]) {
    this.notify.setBusy();
    this.notify.progress({title: "Image upload", message: `uploading ${first($file).name} - please wait...`});
  }

  public fileOver(e: any): void {
    this.hasFileOver = e;
  }

  fileDropped($event: File[]) {
    this.logger.info("fileDropped:", $event);
  }
}
