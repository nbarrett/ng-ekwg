import { Component, Inject, OnInit } from "@angular/core";
import { chain } from "../../../functions/chain";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";
import { WalkDisplayService } from "../walk-display.service";
import { Member } from "../../../models/member.model";
import { Walk } from "../../../models/walk.model";
import { find } from "lodash-es";
import { DisplayDatePipe } from "../../../pipes/display-date.pipe";

@Component({
  selector: "app-walk-export",
  templateUrl: "./walk-export.component.html",
  styleUrls: ["./walk-export.component.sass"]
})
export class WalkExportComponent implements OnInit {

  private ramblersUploadAuditData: any[];
  private walksForExport: any[];
  private notifyWalkExport: AlertInstance;
  private walkExport: AlertTarget = {};
  private logger: Logger;
  private fileName: string;
  private fileNames: string[];
  private showDetail: boolean;
  private walkExportTab0Active: boolean;
  private members: Member[];
  private walks: Walk[];
  private walkExportTab1Active: boolean;

  constructor(
    @Inject("RamblersWalksAndEventsService") private ramblersWalksAndEventsService,
    @Inject("RamblersUploadAudit") private ramblersUploadAudit,
    private notifierService: NotifierService,
    private displayDate: DisplayDatePipe,
    private display: WalkDisplayService,
    loggerFactory: LoggerFactory
  ) {
    this.logger = loggerFactory.createLogger(WalkExportComponent, NgxLoggerLevel.INFO);

  }

  ngOnInit() {
    this.ramblersUploadAuditData = [];
    this.walksForExport = [];
    this.notifyWalkExport = this.notifierService.createAlertInstance(this.walkExport);
  }

  finalStatusError() {
    return find(this.ramblersUploadAudit, {status: "error"});
  }

  fileNameChanged() {
    this.logger.debug("filename changed to", this.fileName);
    this.refreshRamblersUploadAudit();
  }


  refreshRamblersUploadAudit(stop?: any) {
    this.logger.debug("refreshing audit trail records related to", this.fileName);
    return this.ramblersUploadAudit.query({fileName: this.fileName}, {sort: {auditTime: -1}})
      .then(auditItems => {
        this.logger.debug("Filtering", auditItems.length, "audit trail records related to", this.fileName);
        this.ramblersUploadAudit = auditItems
          .filter(auditItem => {
            return this.showDetail || auditItem.type !== "detail";
          })
          .map(auditItem => {
            if (auditItem.status === "complete") {
              this.logger.debug("Upload complete");
              this.notifyWalkExport.success("Ramblers upload completed");
              this.display.saveInProgress = false;
            }
            return auditItem;
          });
      });
  }

  exportableWalks() {
    return this.ramblersWalksAndEventsService.exportableWalks(this.walksForExport);
  }

  cancelExportWalkDetails() {
    // $("#walk-export-dialog").modal("hide");
  }

  populateWalkExport(walksForExport) {
    this.walksForExport = walksForExport;
    this.notifyWalkExport.success("Found total of " + this.walksForExport.length + " walk(s), "
      + this.walksDownloadFile().length + " preselected for export");
    this.notifyWalkExport.clearBusy();
  }

  walksDownloadFile() {
    return this.ramblersWalksAndEventsService.exportWalks(this.exportableWalks(), this.members);
  }

  showWalkExportDialog() {
    this.walksForExport = [];
    this.notifyWalkExport.warning("Determining which walks to export", true);
    this.ramblersUploadAudit.all({limit: 1000, sort: {auditTime: -1}})
      .then(auditItems => {
        this.logger.debug("found total of", auditItems.length, "audit trail records");
        this.fileNames = chain(auditItems).map("fileName").unique().value();
        this.logger.debug("unique total of", this.fileNames.length, "audit trail records");
      });
    this.ramblersWalksAndEventsService.createWalksForExportPrompt(this.walks, this.members)
      .then(this.populateWalkExport)
      .catch(error => {
        this.logger.debug("error->", error);
        this.notifyWalkExport.error({title: "Problem with Ramblers export preparation", message: JSON.stringify(error)});
      });
    // $("#walk-export-dialog").modal();
  }

  changeWalkExportSelection(walk: any) {
    if (walk.walkValidations.length === 0) {
      walk.selected = !walk.selected;
      this.notifyWalkExport.hide();
    } else {
      this.notifyWalkExport.error({
        title: "You can\"t export the walk for " + this.displayDate.transform(walk.walk.walkDate),
        message: walk.walkValidations.join(", ")
      });
    }
  }

  uploadToRamblers() {

    const callAtInterval = () => {
      this.logger.debug("Refreshing audit trail for file", this.fileName, "count =", this.ramblersUploadAudit.length);
      this.refreshRamblersUploadAudit(stop);
    };

    this.ramblersUploadAudit = [];
    this.walkExportTab0Active = false;
    this.walkExportTab1Active = true;
    this.display.saveInProgress = true;
    this.ramblersWalksAndEventsService.uploadToRamblers(this.walksForExport, this.members, this.notifyWalkExport).then(fileName => {
      this.fileName = fileName;
      throw new Error("solve $interval(callAtInterval, 2000, false);");
      // const stop = $interval(callAtInterval, 2000, false);
      if (this.fileNames.includes(this.fileName)) {
        this.fileNames.push(this.fileName);
        this.logger.debug("added", this.fileName, "to filenames of", this.fileNames.length, "audit trail records");
      }
      delete this.finalStatusError;

    });
  }

  walksDownloadFileName() {
    return this.ramblersWalksAndEventsService.exportWalksFileName();
  }

  walksDownloadHeader() {
    return this.ramblersWalksAndEventsService.exportColumnHeadings();
  }

}
