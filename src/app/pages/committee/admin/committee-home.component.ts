/* tslint:disable:semicolon */
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { isEmpty, last } from "lodash-es";
import clone from "lodash-es/clone";
import extend from "lodash-es/extend";
import { BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { MemberLoginService } from "src/app/services/member/member-login.service";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { CommitteeFile } from "../../../models/committee.model";
import { LoginResponse, Member } from "../../../models/member.model";
import { CommitteeFileService } from "../../../services/committee/committee-file.service";
import { CommitteeQueryService } from "../../../services/committee/committee-query.service";
import { CommitteeReferenceDataService } from "../../../services/committee/committee-reference-data.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MailchimpLinkService } from "../../../services/mailchimp/mailchimp-link.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";
import { CommitteeEditFileModalComponent } from "../edit/committee-edit-file-modal.component";
import { CommitteeNotificationSettingsModalComponent } from "../notification-settings/committee-notification-settings-modal.component";
import { CommitteeSendNotificationModalComponent } from "../send-notification/committee-send-notification-modal.component";

@Component({
  selector: "app-committee-home",
  templateUrl: "./committee-home.component.html",
  changeDetection: ChangeDetectionStrategy.Default
})
export class CommitteeHomeComponent implements OnInit, OnDestroy {
  private logger: Logger;
  private subscription: Subscription;
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public loggedIn: boolean;
  public allowAdminEdits: boolean;
  private emailingInProgress: boolean;
  private destinationType: string;
  private members: Member[];
  private selected: { committeeFile?: CommitteeFile, addingNewFile: boolean; committeeFiles: any[] };
  private userEdits: { saveInProgress: boolean };
  private fileTypes: any;
  private allowConfirmDelete: boolean;
  private oldTitle: string;
  private committeeFileBaseUrl = "TBD";

  constructor(private memberLoginService: MemberLoginService,
              private memberService: MemberService,
              private notifierService: NotifierService,
              private modalService: BsModalService,
              private authService: AuthService,
              private urlService: UrlService,
              private dateUtils: DateUtilsService,
              private mailchimpLinkService: MailchimpLinkService,
              private committeeFileService: CommitteeFileService,
              private committeeReferenceData: CommitteeReferenceDataService,
              private committeeQueryService: CommitteeQueryService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeHomeComponent, NgxLoggerLevel.OFF);
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.setPrivileges();
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.subscription = this.authService.authResponse().subscribe((loginResponse: LoginResponse) => this.setPrivileges(loginResponse));
    this.userEdits = {
      saveInProgress: false
    };
    this.emailingInProgress = false;
    this.destinationType = "";
    this.members = [];
    this.selected = {
      addingNewFile: false,
      committeeFiles: []
    };
    this.committeeReferenceData.events().subscribe(referenceData => {
      if (referenceData) {
        this.assignFileTypes();
      }
    });

    this.refreshAll();
  }

  defaultCommitteeFile(): CommitteeFile {
    return clone({
      createdDate: this.dateUtils.nowAsValue(),
      fileType: this.fileTypes && this.fileTypes[0].description,
      fileNameData: {}
    });
  };

  showAlertMessage(): boolean {
    return this.notifyTarget.busy || this.notifyTarget.showAlert;
  }

  private setPrivileges(loginResponse?: LoginResponse) {
    this.allowAdminEdits = this.memberLoginService.allowMemberAdminEdits();
    this.loggedIn = this.memberLoginService.memberLoggedIn();
    this.logger.info(loginResponse, "setPrivileges:allowAdminEdits", this.allowAdminEdits, "this.loggedIn", this.loggedIn);
    this.refreshAll();
  }

  assignFileTypes() {
    this.fileTypes = this.committeeReferenceData.fileTypes();
    this.logger.info("fileTypes ->", this.fileTypes);
  }

  isActive(committeeFile) {
    return committeeFile === this.selected.committeeFile;
  };

  allowSend() {
    return this.memberLoginService.allowFileAdmin();
  };

  allowAddCommitteeFile() {
    return this.fileTypes && this.memberLoginService.allowFileAdmin();
  };

  allowEditCommitteeFile(committeeFile) {
    return this.allowAddCommitteeFile() && committeeFile && committeeFile.$id();
  };

  allowDeleteCommitteeFile(committeeFile) {
    return this.allowEditCommitteeFile(committeeFile);
  };

  showCommitteeFileDeleted() {
    return this.notify.success("File was deleted successfully");
  }

  confirmDeleteCommitteeFile() {

    this.userEdits.saveInProgress = true;

    this.committeeFileService.delete(this.selected.committeeFile)
      .then(() => this.refreshCommitteeFiles())
      .then(() => this.notify.clearBusy());
  };

  selectCommitteeFile(committeeFile, committeeFiles) {
    if (!this.selected.addingNewFile) {
      this.selected.committeeFile = committeeFile;
      this.selected.committeeFiles = committeeFiles;
    }
  };

  openMailchimp() {
    window.open(this.mailchimpLinkService.campaigns(), "_blank");
  };

  private createModalOptions(initialState?: any): ModalOptions {
    return {
      class: "modal-lg",
      animated: false,
      backdrop: "static",
      ignoreBackdropClick: false,
      keyboard: true,
      focus: true,
      show: true,
      initialState: extend({}, initialState)
    };
  }

  openSettings() {
    this.modalService.show(CommitteeNotificationSettingsModalComponent, this.createModalOptions());
  };

  sendNotification(committeeFile: CommitteeFile) {
    this.modalService.show(CommitteeSendNotificationModalComponent, this.createModalOptions({committeeFile}));
  };

  editCommitteeFile(committeeFile: CommitteeFile) {
    this.modalService.show(CommitteeEditFileModalComponent, this.createModalOptions({committeeFile}));
  };

  addCommitteeFile($event) {
    $event.stopPropagation();
    this.selected.addingNewFile = true;
    const committeeFile = this.defaultCommitteeFile();
    this.selected.committeeFiles.push(committeeFile);
    this.selected.committeeFile = committeeFile;
    this.logger.debug("addCommitteeFile:", committeeFile, "of", this.selected.committeeFiles.length, "files");
    this.editCommitteeFile(committeeFile);
  };

  attachmentTitle() {
    return (this.selected.committeeFile && isEmpty(this.selected.committeeFile.fileNameData) ? "Attach" : "Replace") + " File";
  };

  fileUrl(committeeFile) {
    return committeeFile && committeeFile.fileNameData ? this.urlService.baseUrl() + "/" + this.committeeFileBaseUrl + "/" + committeeFile.fileNameData.awsFileName : "";
  };

  fileTitle(committeeFile) {
    return committeeFile ? this.dateUtils.asString(committeeFile.eventDate, undefined, this.dateUtils.formats.displayDateTh) + " - " + committeeFile.fileNameData.title : "";
  };

  fileExtensionIs(fileName, extensions: string[]) {
    return extensions.includes(this.fileExtension(fileName));
  }

  fileExtension(fileName: string) {
    return fileName ? last(fileName.split(".")).toLowerCase() : "";
  }

  iconFile(committeeFile) {
    if (!committeeFile.fileNameData) {
      return undefined;
    }

    if (this.fileExtensionIs(committeeFile.fileNameData.awsFileName, ["doc", "docx", "jpg", "pdf", "ppt", "png", "txt", "xls", "xlsx"])) {
      return "icon-" + this.fileExtension(committeeFile.fileNameData.awsFileName).substring(0, 3) + ".jpg";
    } else {
      return "icon-default.jpg";
    }
  };

  assignMembersToScope(members: Member[]) {
    this.members = members;
    return this.members;
  }

  refreshMembers() {
    if (this.memberLoginService.allowFileAdmin()) {
      return this.memberService.all()
        .then(members => this.assignMembersToScope(members));

    }
  }

  refreshCommitteeFiles() {
    this.committeeQueryService.committeeFiles(this.notify)
  }

  refreshAll() {
    this.assignFileTypes();
    this.refreshCommitteeFiles();
    this.refreshMembers();
  }

}
