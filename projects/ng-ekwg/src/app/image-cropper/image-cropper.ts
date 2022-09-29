import { HttpErrorResponse } from "@angular/common/http";
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { faArrowRightArrowLeft, faClose, faMagnifyingGlassMinus, faMagnifyingGlassPlus, faRedoAlt, faRotateLeft, faUpDown } from "@fortawesome/free-solid-svg-icons";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons/faRotateRight";
import { faSave } from "@fortawesome/free-solid-svg-icons/faSave";
import first from "lodash-es/first";
import { FileUploader } from "ng2-file-upload";
import { base64ToFile, Dimensions, ImageCroppedEvent, ImageCropperComponent, ImageTransform, LoadedImage } from "ngx-image-cropper";
import { NgxLoggerLevel } from "ngx-logger";
import { FileUtilsService } from "../file-utils.service";
import { AlertTarget } from "../models/alert-target.model";
import { AwsFileData, AwsFileUploadResponse, FileNameData, ImageData } from "../models/aws-object.model";
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

export class ImageCropperAndResizerComponent implements OnInit, AfterViewInit {
  @ViewChild(ImageCropperComponent) imageCropperComponent: ImageCropperComponent;
  @Input() preloadImage: string;
  @Output() quit: EventEmitter<void> = new EventEmitter();
  @Output() save: EventEmitter<AwsFileData> = new EventEmitter();
  @Output() imageChange: EventEmitter<AwsFileData> = new EventEmitter();
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
  public originalFile: File;
  public format = "png";
  public aspectRatio: number;
  private uploadInProgress: boolean;
  public dimensions: Dimensions[] = [
    {width: 1, height: 1},
    {width: 3, height: 2},
    {width: 4, height: 3},
    {width: 4, height: 6},
    {width: 5, height: 4},
    {width: 5, height: 7},
    {width: 12, height: 18},
    {width: 16, height: 9},
    {width: 18, height: 24},
    {width: 940, height: 300},
  ];
  public dimension: Dimensions = this.dimensions[0];
  faClose = faClose;
  faSave = faSave;
  faRotateRight = faRotateRight;
  faRotateLeft = faRotateLeft;
  faRedoAlt = faRedoAlt;
  faMagnifyingGlassMinus = faMagnifyingGlassMinus;
  faMagnifyingGlassPlus = faMagnifyingGlassPlus;
  faArrowRightArrowLeft = faArrowRightArrowLeft;
  faUpDown = faUpDown;

  // faAngleDown = faAngleDown;
  // faAngleUp = faAngleUp;
  // faArrowLeft = faArrowLeft;
  // faArrowLeftRotate = faArrowLeftRotate;
  // faArrowRightFromFile = faArrowRightFromFile;
  // faCompress = faCompress;
  // faCompressAlt = faCompressAlt;
  // faCrop = faCrop;
  // faFilePen = faFilePen;
  // faGripLines = faGripLines;
  // faGripLinesVertical = faGripLinesVertical;
  // faLeftRight = faLeftRight;
  // faRotate = faRotate;
  // faRulerCombined = faRulerCombined;
  // faRulerVertical = faRulerVertical;
  // faSave = faSave;
  // faSpinner = faSpinner;
  // faSyncAlt = faSyncAlt;
  // faUndoAlt = faUndoAlt;

  constructor(private broadcastService: BroadcastService<any>, private numberUtils: NumberUtilsService,
              private fileUploadService: FileUploadService,
              private notifierService: NotifierService,
              private fileUtils: FileUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ImageCropperComponent, NgxLoggerLevel.INFO);
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
          if (this.fileNameData) {
            this.fileNameData.title = this?.existingTitle;
          }
          this.logger.debug("JSON response:", uploadResponse, "committeeFile:", this.fileNameData);
          this.notify.clearBusy();
          this.notify.success({title: "File uploaded", message: this.fileNameData.title});
        }
      }
    );
  }

  ngAfterViewInit(): void {
    if (this.preloadImage) {
      this.fileUtils.urlToFile(this.preloadImage, "file-crop.jpeg")
        .then(file => this.processSingleFile(file));
    }
  }

  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
    this.logger.info("fileChangeEvent:event", event);
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    const awsFileData: AwsFileData = this.awsFileData();
    this.logger.info("imageCropped:event", event, "awsFileData:", awsFileData);
    this.croppedSize = this.numberUtils.humanFileSize(this.croppedImage.length);
    this.imageChange.next(awsFileData);
  }

  awsFileData(awsFileName?: string): AwsFileData {
    return {
      awsFileName,
      image: this.croppedImage,
      file: new File([base64ToFile(this.croppedImage)], this.originalFile.name, {lastModified: this.originalFile.lastModified, type: this.originalFile.type})
    };
  }

  imageLoaded($event: LoadedImage) {
    this.showCropper = true;
    this.logger.info("Image loaded:", $event);
    this.original = $event.original;
    this.originalSize = this.numberUtils.humanFileSize(this.original.base64.length)
      + " - humanFileSize:" + this.numberUtils.humanFileSize(this.original.base64.length, true)
      + " - humanFileSize2:" + this.numberUtils.humanFileSize2(this.original.base64.length)
      + " - humanFileSizeValor:" + this.numberUtils.humanFileSizeValor(this.originalFile.size);
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
    this.logger.info("processSingleFile:file:", file, "queue:", this.uploader.queue);
    this.notify.progress({title: "File upload", message: `loading preview for ${file.name}...`});
    this.originalFile = file;
  }

  showAlertMessage(): boolean {
    return this.notifyTarget.busy || this.notifyTarget.showAlert;
  }

  changeAspectRatio(event: any) {
    this.aspectRatio = this.dimension.width / this.dimension.height;
    this.logger.info("changeAspectRatio:", event.target.value, "aspectRatio:", this.dimension);
    this.imageCropperComponent.crop();
  }

  saveImage() {
    try {
      this.uploadInProgress = true;
      this.uploader.clearQueue();
      this.uploader.addToQueue([this.awsFileData().file]);
      this.uploader.uploadAll();
      this.uploader.response.subscribe((uploaderResponse: string) => {
        const response: AwsFileUploadResponse = JSON.parse(uploaderResponse);
        const awsFileName = `${response?.response?.fileNameData?.rootFolder}/${response?.response?.fileNameData?.awsFileName}`;
        this.logger.info("received response:", uploaderResponse, "awsFileName:", awsFileName, "local originalFile.name:", this.originalFile.name, "aws originalFileName", response?.response?.fileNameData.originalFileName);
        this.save.next(this.awsFileData(awsFileName));
        this.uploadInProgress = false;
      });
    } catch (e) {
      this.logger.error("received error response:", e);
      this.uploadInProgress = false;
    }
  }
}

