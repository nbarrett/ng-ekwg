import { Component, Input, OnInit } from "@angular/core";
import { faAdd, faEdit, faSortAlphaAsc } from "@fortawesome/free-solid-svg-icons";
import { faRemove } from "@fortawesome/free-solid-svg-icons/faRemove";
import { faSave } from "@fortawesome/free-solid-svg-icons/faSave";
import { FileUploader } from "ng2-file-upload";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertMessage, AlertTarget } from "../../../../models/alert-target.model";
import { AwsFileData } from "../../../../models/aws-object.model";
import { BannerImageType, Image, Images, SystemConfigResponse } from "../../../../models/system.model";
import { sortBy } from "../../../../services/arrays";
import { DateUtilsService } from "../../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../../services/logger-factory.service";
import { MemberLoginService } from "../../../../services/member/member-login.service";
import { MemberService } from "../../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../../services/notifier.service";
import { NumberUtilsService } from "../../../../services/number-utils.service";
import { StringUtilsService } from "../../../../services/string-utils.service";
import { SystemConfigService } from "../../../../services/system/system-config.service";
import { UrlService } from "../../../../services/url.service";

@Component({
  selector: "[app-image-collection-settings]",
  templateUrl: "./image-collection-settings.html"
})
export class ImageCollectionSettingsComponent implements OnInit {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private logger: Logger;
  faAdd = faAdd;
  faSortAlphaAsc = faSortAlphaAsc;
  faSave = faSave;
  faEdit = faEdit;
  faRemove = faRemove;
  public awsFileData: AwsFileData;
  public imageEditActive: boolean;
  public uploader: FileUploader;
  public imageTypeDescription: string;

  constructor(private systemConfigService: SystemConfigService,
              private notifierService: NotifierService,
              private numberUtils: NumberUtilsService,
              public stringUtils: StringUtilsService,
              private memberService: MemberService,
              private memberLoginService: MemberLoginService,
              private urlService: UrlService,
              protected dateUtils: DateUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ImageCollectionSettingsComponent, NgxLoggerLevel.OFF);
  }

  @Input() imageType: BannerImageType;
  @Input() images: Images;
  @Input() config: SystemConfigResponse;

  ngOnInit() {
    this.logger.info("constructed with:", this.images, "image:", this.images);
    this.imageTypeDescription = this.stringUtils.asTitle(this.imageType);
    if (!this.images) {
      this.images = this.systemConfigService.defaultImages(this.imageType);
    }
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
  }

  createNewImage() {
    this.images.images.splice(0, 0, {padding: 16, width: 150, originalFileName: null, awsFileName: null});
  }

  sortImages() {
    this.images.images = this.images.images.sort(sortBy("originalFileName"));
  }

  throwOrNotifyError(message: AlertMessage) {
    this.logger.error("throwOrNotifyError:", message);
    this.notify.error(message);
  }

  headerLogoDefault(image: Image): boolean {
    return this.config.system.header.selectedLogo === image.originalFileName;
  }

  toggleImageEditor() {
    this.imageEditActive = true;
  }

  imageChanged(imageFileData: Image, imageIndex: number) {
    this.logger.info("imageChanged:imageFileData:", imageFileData, "for imageIndex:", imageIndex, "images (before change):", this.images.images);
    this.images.images = this.images.images.map((item, index) => index === imageIndex ? imageFileData : item);
    this.config.system[this.imageType] = this.images;
    this.logger.info("imageChanged:imageFileData:", imageFileData, "for imageIndex:", imageIndex, "images (after change):", this.images.images);
  }
}
