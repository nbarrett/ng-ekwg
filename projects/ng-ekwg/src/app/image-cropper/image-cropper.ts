import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import first from "lodash-es/first";
import { FileUploader } from "ng2-file-upload";
import { base64ToFile, Dimensions, ImageCroppedEvent, ImageCropperComponent, ImageTransform, LoadedImage } from "ngx-image-cropper";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "../models/alert-target.model";
import { FileNameData } from "../models/aws-object.model";
import { NamedEvent, NamedEventType } from "../models/broadcast.model";
import { DateValue } from "../models/date.model";
import { BroadcastService } from "../services/broadcast-service";
import { FileUploadService } from "../services/file-upload.service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { AlertInstance, NotifierService } from "../services/notifier.service";
import { NumberUtilsService } from "../services/number-utils.service";

@Component({
  selector: "app-image-cropper",
  templateUrl: "./image-cropper.html",
  styleUrls: ["./image-cropper.sass"]
})

export class ImageCropperAndResizerComponent implements OnInit {
  @ViewChild(ImageCropperComponent) imageCropperComponent: ImageCropperComponent;
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  imageChangedEvent: Event;
  croppedImage: any = "";
  canvasRotation = 0;
  resizeToWidth = 0;
  rotation = 0;
  scale = 1;
  showCropper = false;
  containWithinAspectRatio = false;
  transform: ImageTransform = {};
  original: ImageData;
  private maintainQuality = false;
  originalSize = "";
  croppedSize = "";
  private logger: Logger;
  public fileNameData: FileNameData;
  public hasFileOver = false;
  public eventDate: DateValue;
  private existingTitle: string;
  public uploader: FileUploader;
  public imageFile: File;
  public format = "png";

  constructor(private broadcastService: BroadcastService<any>, private numberUtils: NumberUtilsService,
              private fileUploadService: FileUploadService,
              private notifierService: NotifierService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ImageCropperComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit(): void {
    this.logger.debug("constructed with fileNameData", this.fileNameData);
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.uploader = this.fileUploadService.createUploaderFor("site-content-files", false);
    this.uploader.response.subscribe((response: string | HttpErrorResponse) => {
        this.logger.debug("response", response, "type", typeof response);
        this.notify.clearBusy();
        if (response instanceof HttpErrorResponse) {
          this.notify.error({title: "Upload failed", message: response.error});
        } else if (response === "Unauthorized") {
          this.notify.error({title: "Upload failed", message: response + " - try logging out and logging back in again and trying this again."});
        } else {
          const uploadResponse = JSON.parse(response);
          this.fileNameData = uploadResponse.response.fileNameData;
          this.fileNameData.title = this.existingTitle;
          this.logger.debug("JSON response:", uploadResponse, "committeeFile:", this.fileNameData);
          this.notify.clearBusy();
          this.notify.success({title: "File uploaded", message: this.fileNameData.title});
        }
      }
    );
  }

  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
    this.logger.info("fileChangeEvent:event", event);
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    const blob: Blob = base64ToFile(event.base64);
    this.logger.info("imageCropped:event", event, "base64ToFileBlob:", blob);
    this.croppedSize = this.numberUtils.humanFileSize(this.croppedImage.length);
    this.broadcastService.broadcast(NamedEvent.withData(NamedEventType.IMAGE_CROP, event.base64));
  }

  imageLoaded($event: LoadedImage) {
    this.showCropper = true;
    this.logger.info("Image loaded:", $event);
    this.original = $event.original;
    this.originalSize = this.numberUtils.humanFileSize(this.original.base64.length)
      + " - humanFileSize:" + this.numberUtils.humanFileSize(this.original.base64.length, true)
      + " - humanFileSize2:" + this.numberUtils.humanFileSize2(this.original.base64.length)
      + " - humanFileSizeValor:" + this.numberUtils.humanFileSizeValor(this.imageFile.size);
    this.setResizeToWidth();
  }

  private setResizeToWidth() {
    this.resizeToWidth = this.maintainQuality ? this.original.size.width : 500;
  }

  cropperReady(sourceImageDimensions: Dimensions) {
    this.logger.info("Cropper ready", sourceImageDimensions);
    this.notify.hide();
  }

  loadImageFailed() {
    this.logger.info("Load failed");
  }

  rotateLeft() {
    this.canvasRotation--;
    this.flipAfterRotate();
  }

  rotateRight() {
    this.canvasRotation++;
    this.flipAfterRotate();
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH
    };
  }

  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH
    };
  }

  flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV
    };
  }

  resetImage() {
    this.scale = 1;
    this.rotation = 0;
    this.canvasRotation = 0;
    this.transform = {};
    this.setResizeToWidth();
  }

  zoomOut() {
    this.scale -= .1;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  zoomIn() {
    this.scale += .1;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  toggleContainWithinAspectRatio() {
    this.containWithinAspectRatio = !this.containWithinAspectRatio;
  }

  updateRotation() {
    this.transform = {
      ...this.transform,
      rotate: this.rotation
    };
  }

  resized($event: UIEvent) {
    this.logger.info("resized:", $event);
  }

  resizeToWidthChanged($event: any) {
    this.logger.info("resizeToWidthChanged:", $event);
    this.imageCropperComponent.crop();
  }

  browseToFile(fileElement: HTMLInputElement) {
    this.existingTitle = this.fileNameData?.title;
    fileElement.click();
  }

  removeAttachment() {
    this.fileNameData = undefined;
  }

  public fileOver(e: any): void {
    this.hasFileOver = e;
  }

  fileDropped($event: File[]) {
    this.logger.debug("fileDropped:", $event);
    this.processSingleFile(first($event));
  }

  onFileSelect($event: File[]) {
    this.processSingleFile(first($event));
  }

  private processSingleFile(file: File) {
    this.notify.setBusy();
    this.notify.progress({title: "File upload", message: `loading preview for ${file.name}...`});
    this.imageFile = file;
  }

  showAlertMessage(): boolean {
    return this.notifyTarget.busy || this.notifyTarget.showAlert;
  }

}

interface ImageData {
  base64: string;
  image: HTMLImageElement;
  size: Dimensions;
}
