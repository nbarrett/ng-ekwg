import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { faRemove } from "@fortawesome/free-solid-svg-icons/faRemove";
import { faSave } from "@fortawesome/free-solid-svg-icons/faSave";
import { remove } from "lodash-es";
import { FileUploader } from "ng2-file-upload";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertMessage, AlertTarget } from "../../../../models/alert-target.model";
import { AwsFileData } from "../../../../models/aws-object.model";
import { LogoFileData } from "../../../../models/system.model";
import { DateUtilsService } from "../../../../services/date-utils.service";
import { FileUploadService } from "../../../../services/file-upload.service";
import { Logger, LoggerFactory } from "../../../../services/logger-factory.service";
import { MemberLoginService } from "../../../../services/member/member-login.service";
import { MemberService } from "../../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../../services/notifier.service";
import { NumberUtilsService } from "../../../../services/number-utils.service";
import { StringUtilsService } from "../../../../services/string-utils.service";
import { SystemConfigService } from "../../../../services/system/system-config.service";
import { UrlService } from "../../../../services/url.service";

@Component({
  selector: "app-system-logo-edit",
  templateUrl: "./system-logo-edit.html",
  styleUrls: ["./system-logo.sass"]
})
export class SystemLogoEditComponent implements OnInit {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private logger: Logger;
  faAdd = faAdd;
  faSave = faSave;
  faRemove = faRemove;
  public awsFileData: AwsFileData;
  public logoEditActive: boolean;
  public uploader: FileUploader;
  public droppedFile: File;

  constructor(private systemConfigService: SystemConfigService,
              private notifierService: NotifierService,
              private numberUtils: NumberUtilsService,
              private fileUploadService: FileUploadService,
              private stringUtils: StringUtilsService,
              private memberService: MemberService,
              private memberLoginService: MemberLoginService,
              private urlService: UrlService,
              protected dateUtils: DateUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SystemLogoEditComponent, NgxLoggerLevel.OFF);
  }

  @Input() headerLogoDefault: boolean;
  @Input() rootFolder: string;
  @Input() image: LogoFileData;
  @Input() images: LogoFileData[];
  @Output() headerLogoChanged: EventEmitter<string> = new EventEmitter();

  ngOnInit() {
    this.logger.info("constructed with:", this.image);
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.logoEditActive = !this.image.awsFileName;
  }

  throwOrNotifyError(message: AlertMessage) {
    this.logger.error("throwOrNotifyError:", message);
    this.notify.error(message);
  }

  toggleImageEditor() {
    this.logoEditActive = true;
  }

  delete() {
    remove(this.images, this.image);
  }

  imageChanged(awsFileData: AwsFileData) {
    this.logger.info("imageChanged:", awsFileData);
    this.awsFileData = awsFileData;
    if (!this.image.originalFileName) {
      this.image.originalFileName = awsFileData.file.name;
    }
  }

  exitImageEdit() {
    this.logoEditActive = false;
    this.awsFileData = null;
  }

  imagedSaved(awsFileData: AwsFileData) {
    const logoImageSource = awsFileData.awsFileName;
    this.logger.info("imagedSaved:", awsFileData, "setting logoImageSource to", logoImageSource);
    this.image.awsFileName = logoImageSource;
  }

  uniqueIdFor(prefix: string) {
    const uniqueIdFor = this.stringUtils.kebabCase(prefix, this.image.originalFileName || 0);
    this.logger.debug("uniqueIdFor:", prefix, "returning:", uniqueIdFor);
    return uniqueIdFor;
  }

  makeDefault() {
    this.headerLogoChanged.next(this.image.originalFileName);
  }

  imageSourceOrPreview(): string {
    return this.urlService.imageSource(this.awsFileData?.image || this.image.awsFileName || this.image.originalFileName);
  }

  logoTitle() {
    return `${this.images.indexOf(this.image) + 1} of ${this.images.length} — ${this.image.originalFileName || "New Logo"} ${this.headerLogoDefault? " (header logo default)" :"" }`;
  }

}
